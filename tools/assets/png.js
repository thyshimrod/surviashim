// @ts-check
// Lecture et écriture de PNG, sans dépendance (outils d'assets, exécutés par Node).
import { readFileSync, writeFileSync } from 'node:fs';
import { deflateSync, inflateSync } from 'node:zlib';

/** @typedef {{ width: number, height: number, data: Buffer }} RgbaImage */

const SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const COLOR = Object.freeze({ PALETTE: 3, RGB: 2, RGBA: 6 });
const BYTE = 8;
const CHANNELS = 4;
const OPAQUE = 255;

/**
 * Lit un PNG 8 bits (RGBA, RGB ou à palette) et le convertit en RGBA.
 * @param {string} path
 * @returns {RgbaImage}
 * @throws {Error} Si le format n'est pas pris en charge.
 */
export function readPng(path) {
  const bytes = readFileSync(path);
  const header = { width: 0, height: 0, bitDepth: 0, colorType: 0 };
  /** @type {Buffer[]} */
  const data = [];
  let palette = Buffer.alloc(0);
  let transparency = Buffer.alloc(0);
  for (let offset = SIGNATURE.length; offset < bytes.length;) {
    const length = bytes.readUInt32BE(offset);
    const type = bytes.toString('ascii', offset + 4, offset + 8);
    const chunk = bytes.subarray(offset + 8, offset + 8 + length);
    if (type === 'IHDR') {
      Object.assign(header, {
        width: chunk.readUInt32BE(0),
        height: chunk.readUInt32BE(4),
        bitDepth: chunk[8],
        colorType: chunk[9],
      });
    } else if (type === 'PLTE') {
      palette = chunk;
    } else if (type === 'tRNS') {
      transparency = chunk;
    } else if (type === 'IDAT') {
      data.push(chunk);
    }
    offset += length + 12;
  }
  return toRgba(header, inflateSync(Buffer.concat(data)), { palette, transparency });
}

/**
 * @param {{ width: number, height: number, bitDepth: number, colorType: number }} header
 * @param {Buffer} raw Données décompressées, avec l'octet de filtre de chaque ligne.
 * @param {{ palette: Buffer, transparency: Buffer }} colors
 * @returns {RgbaImage}
 */
function toRgba({ width, height, bitDepth, colorType }, raw, { palette, transparency }) {
  const channels = { [COLOR.PALETTE]: 1, [COLOR.RGB]: 3, [COLOR.RGBA]: CHANNELS }[colorType];
  if (channels === undefined || (colorType !== COLOR.PALETTE && bitDepth !== BYTE)) {
    throw new Error(`Unsupported PNG: color type ${colorType}, ${bitDepth} bits`);
  }
  const stride = Math.ceil((width * channels * bitDepth) / BYTE);
  const pixels = unfilter(raw, {
    height,
    stride,
    bytesPerPixel: Math.max(1, (channels * bitDepth) / BYTE),
  });
  const out = Buffer.alloc(width * height * CHANNELS);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const target = (y * width + x) * CHANNELS;
      if (colorType === COLOR.PALETTE) {
        const bit = x * bitDepth;
        const byte = pixels[y * stride + Math.floor(bit / BYTE)];
        const index = (byte >> (BYTE - bitDepth - (bit % BYTE))) & ((1 << bitDepth) - 1);
        out.set(
          [...palette.subarray(index * 3, index * 3 + 3), transparency[index] ?? OPAQUE],
          target,
        );
      } else {
        const source = y * stride + x * channels;
        out.set(
          [
            ...pixels.subarray(source, source + 3),
            channels === CHANNELS ? pixels[source + 3] : OPAQUE,
          ],
          target,
        );
      }
    }
  }
  return { width, height, data: out };
}

/**
 * Annule les filtres PNG ligne par ligne.
 * @param {Buffer} raw
 * @param {{ height: number, stride: number, bytesPerPixel: number }} layout
 * @returns {Buffer}
 */
function unfilter(raw, { height, stride, bytesPerPixel }) {
  const out = Buffer.alloc(height * stride);
  for (let y = 0; y < height; y += 1) {
    const filter = raw[y * (stride + 1)];
    for (let x = 0; x < stride; x += 1) {
      const value = raw[y * (stride + 1) + 1 + x];
      const left = x >= bytesPerPixel ? out[y * stride + x - bytesPerPixel] : 0;
      const up = y > 0 ? out[(y - 1) * stride + x] : 0;
      const upLeft = y > 0 && x >= bytesPerPixel ? out[(y - 1) * stride + x - bytesPerPixel] : 0;
      out[y * stride + x] = (value + predict(filter, left, up, upLeft)) & OPAQUE;
    }
  }
  return out;
}

/**
 * @param {number} filter
 * @param {number} left
 * @param {number} up
 * @param {number} upLeft
 * @returns {number}
 */
function predict(filter, left, up, upLeft) {
  if (filter === 1) return left;
  if (filter === 2) return up;
  if (filter === 3) return (left + up) >> 1;
  if (filter === 4) {
    const estimate = left + up - upLeft;
    const [a, b, c] = [left, up, upLeft].map((value) => Math.abs(estimate - value));
    if (a <= b && a <= c) return left;
    return b <= c ? up : upLeft;
  }
  return 0;
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < BYTE; k += 1) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  return c >>> 0;
});

/**
 * @param {string} type
 * @param {Buffer} data
 * @returns {Buffer}
 */
function chunk(type, data) {
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  let crc = 0xffffffff;
  for (const byte of body) {
    crc = CRC_TABLE[(crc ^ byte) & OPAQUE] ^ (crc >>> BYTE);
  }
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE((crc ^ 0xffffffff) >>> 0);
  return Buffer.concat([length, body, checksum]);
}

/**
 * Écrit une image RGBA en PNG.
 * @param {string} path
 * @param {RgbaImage} image
 */
export function writePng(path, { width, height, data }) {
  const rowLength = width * CHANNELS;
  const raw = Buffer.alloc(height * (rowLength + 1));
  for (let y = 0; y < height; y += 1) {
    data.copy(raw, y * (rowLength + 1) + 1, y * rowLength, (y + 1) * rowLength);
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = BYTE;
  header[9] = COLOR.RGBA;
  writeFileSync(
    path,
    Buffer.concat([
      SIGNATURE,
      chunk('IHDR', header),
      chunk('IDAT', deflateSync(raw)),
      chunk('IEND', Buffer.alloc(0)),
    ]),
  );
}
