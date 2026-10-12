// @ts-check
// Usage : node tools/assets/downscaleTileset.js <source.png> <cible.png> [côté source] [côté cible]
// Réduit une planche de tuiles RPG Maker MV (48 px) au format du jeu (32 px). Chaque pixel cible
// est la moyenne des pixels source qu'il recouvre, pondérée par la surface couverte et par
// l'opacité : les contours restent nets et les couleurs fidèles.
import { readPng, writePng } from './png.js';

const CHANNELS = 4;
const OPAQUE = 255;
const DEFAULT_SOURCE_TILE = 48;
const DEFAULT_TARGET_TILE = 32;
const ALPHA_CUTOFF = 0.5;

/**
 * @param {import('./png.js').RgbaImage} image
 * @param {number} ratio Côté cible / côté source (2/3 pour 48 → 32 px).
 * @returns {import('./png.js').RgbaImage}
 */
export function downscale(image, ratio) {
  const width = Math.round(image.width * ratio);
  const height = Math.round(image.height * ratio);
  const data = Buffer.alloc(width * height * CHANNELS);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      data.set(
        averageCell(image, { x0: x / ratio, y0: y / ratio, size: 1 / ratio }),
        (y * width + x) * CHANNELS,
      );
    }
  }
  return { width, height, data };
}

/**
 * Moyenne pondérée des pixels source recouverts par un pixel cible.
 * @param {import('./png.js').RgbaImage} image
 * @param {{ x0: number, y0: number, size: number }} cell Zone recouverte, en pixels source.
 * @returns {number[]} Couleur RGBA.
 */
function averageCell(image, { x0, y0, size }) {
  const sum = [0, 0, 0];
  let alphaSum = 0;
  let area = 0;
  for (let sy = Math.floor(y0); sy < Math.ceil(y0 + size); sy += 1) {
    const coverY = Math.min(sy + 1, y0 + size) - Math.max(sy, y0);
    for (let sx = Math.floor(x0); sx < Math.ceil(x0 + size); sx += 1) {
      const weight = coverY * (Math.min(sx + 1, x0 + size) - Math.max(sx, x0));
      const index = (sy * image.width + sx) * CHANNELS;
      const alpha = image.data[index + 3] / OPAQUE;
      for (let channel = 0; channel < 3; channel += 1) {
        sum[channel] += image.data[index + channel] * weight * alpha;
      }
      alphaSum += alpha * weight;
      area += weight;
    }
  }
  const coverage = alphaSum / area;
  if (coverage < ALPHA_CUTOFF) {
    return [0, 0, 0, 0];
  }
  return [...sum.map((value) => Math.round(value / alphaSum)), OPAQUE];
}

const [source, target, sourceTile = DEFAULT_SOURCE_TILE, targetTile = DEFAULT_TARGET_TILE] =
  process.argv.slice(2);
if (source === undefined || target === undefined) {
  console.error('Usage : node tools/assets/downscaleTileset.js <source.png> <cible.png> [48] [32]');
  process.exitCode = 1;
} else {
  const image = readPng(source);
  const result = downscale(image, Number(targetTile) / Number(sourceTile));
  writePng(target, result);
  console.log(
    `${source} (${image.width} × ${image.height}) → ${target} (${result.width} × ${result.height})`,
  );
}
