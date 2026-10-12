// @ts-check
import { overlaps } from '../utils/box.js';

/** @typedef {import('../utils/box.js').Box} Box */
/** @typedef {import('../utils/box.js').Point} Point */
/** @typedef {import('../../../data/tilesets.js').TileDefinition} TileDefinition */

/**
 * Tuile repérée par sa colonne et sa ligne, à partir de 0 (spécification B.3).
 * @typedef {{ column: number, row: number }} TileCoordinates
 */

/**
 * Carte à tuiles (R-MON-CAR-001). Ne contient que des données simples : identifiants de tuiles
 * et indicateurs d'infranchissabilité, rangés ligne par ligne.
 */
export class TileMap {
  /**
   * @param {object} params
   * @param {number} params.columns Largeur (tuiles).
   * @param {number} params.rows Hauteur (tuiles).
   * @param {number} params.tileSize Côté d'une tuile (px).
   * @param {readonly string[]} params.tileIds Identifiant de chaque tuile, ligne par ligne.
   * @param {readonly boolean[]} params.blocking Infranchissabilité de chaque tuile, même ordre.
   * @throws {RangeError} Si les listes n'ont pas `columns × rows` éléments.
   */
  constructor({ columns, rows, tileSize, tileIds, blocking }) {
    const expected = columns * rows;
    if (tileIds.length !== expected || blocking.length !== expected) {
      throw new RangeError(
        `Map of ${columns}x${rows} tiles needs ${expected} tiles, got ${tileIds.length} ids and ${blocking.length} flags`,
      );
    }
    this.columns = columns;
    this.rows = rows;
    this.tileSize = tileSize;
    this.tileIds = [...tileIds];
    this.blocking = [...blocking];
  }

  /** Largeur de la carte (px). */
  get widthPx() {
    return this.columns * this.tileSize;
  }

  /** Hauteur de la carte (px). */
  get heightPx() {
    return this.rows * this.tileSize;
  }

  /**
   * R-MON-CAR-001 : tuile qui contient un point.
   * @param {Point} point
   * @returns {TileCoordinates | undefined} `undefined` si le point est hors de la carte.
   */
  tileAt(point) {
    const column = Math.floor(point.x / this.tileSize);
    const row = Math.floor(point.y / this.tileSize);
    return this.contains(column, row) ? { column, row } : undefined;
  }

  /**
   * @param {number} column
   * @param {number} row
   * @returns {boolean} `true` si la tuile existe.
   */
  contains(column, row) {
    return column >= 0 && column < this.columns && row >= 0 && row < this.rows;
  }

  /**
   * @param {number} column
   * @param {number} row
   * @returns {string} Identifiant de la tuile.
   * @throws {RangeError} Si la tuile est hors de la carte.
   */
  tileIdAt(column, row) {
    return this.tileIds[this.indexOf(column, row)];
  }

  /**
   * @param {number} column
   * @param {number} row
   * @returns {boolean} `true` si la tuile est infranchissable.
   * @throws {RangeError} Si la tuile est hors de la carte.
   */
  isBlocking(column, row) {
    return this.blocking[this.indexOf(column, row)];
  }

  /**
   * Change le type d'une tuile (après une récolte, R-RES-REC-003).
   * @param {number} column
   * @param {number} row
   * @param {Readonly<Pick<TileDefinition, 'id' | 'isBlocking'>>} tile Nouveau type.
   * @throws {RangeError} Si la tuile est hors de la carte.
   */
  setTile(column, row, tile) {
    const index = this.indexOf(column, row);
    this.tileIds[index] = tile.id;
    this.blocking[index] = tile.isBlocking;
  }

  /**
   * Rectangle couvert par une tuile (px).
   * @param {number} column
   * @param {number} row
   * @returns {Box}
   */
  boundsOf(column, row) {
    return {
      left: column * this.tileSize,
      right: (column + 1) * this.tileSize,
      top: row * this.tileSize,
      bottom: (row + 1) * this.tileSize,
    };
  }

  /**
   * Tuiles infranchissables que chevauche un rectangle (R-MON-COL-001).
   * @param {Box} box
   * @returns {Box[]} Rectangles des tuiles concernées.
   */
  blockingTilesOverlapping(box) {
    const found = [];
    const firstColumn = Math.max(0, Math.floor(box.left / this.tileSize));
    const lastColumn = Math.min(this.columns - 1, Math.floor(box.right / this.tileSize));
    const firstRow = Math.max(0, Math.floor(box.top / this.tileSize));
    const lastRow = Math.min(this.rows - 1, Math.floor(box.bottom / this.tileSize));
    for (let row = firstRow; row <= lastRow; row += 1) {
      for (let column = firstColumn; column <= lastColumn; column += 1) {
        const bounds = this.boundsOf(column, row);
        if (this.isBlocking(column, row) && overlaps(box, bounds)) {
          found.push(bounds);
        }
      }
    }
    return found;
  }

  /**
   * @param {number} column
   * @param {number} row
   * @returns {number} Rang de la tuile dans les listes.
   * @throws {RangeError} Si la tuile est hors de la carte.
   */
  indexOf(column, row) {
    if (!this.contains(column, row)) {
      throw new RangeError(
        `Tile (${column}, ${row}) is outside the ${this.columns}x${this.rows} map`,
      );
    }
    return row * this.columns + column;
  }
}

/**
 * Construit une carte à partir de lignes de texte (format de data/maps/).
 * @param {object} params
 * @param {readonly string[]} params.rows Une chaîne par ligne de tuiles, un caractère par tuile.
 * @param {Readonly<Record<string, Readonly<TileDefinition>>>} params.definitions Types de tuiles.
 * @param {number} params.tileSize
 * @returns {TileMap}
 * @throws {Error} Si les lignes n'ont pas toutes la même longueur ou si un caractère est inconnu.
 */
export function createTileMapFromRows({ rows, definitions, tileSize }) {
  const bySymbol = new Map(Object.values(definitions).map((tile) => [tile.symbol, tile]));
  const columns = rows[0]?.length ?? 0;
  const tiles = rows.flatMap((line, row) => {
    if (line.length !== columns) {
      throw new Error(`Map row ${row} has ${line.length} tiles, expected ${columns}`);
    }
    return [...line].map((symbol, column) => {
      const tile = bySymbol.get(symbol);
      if (tile === undefined) {
        throw new Error(`Unknown tile symbol "${symbol}" at (${column}, ${row})`);
      }
      return tile;
    });
  });
  return new TileMap({
    columns,
    rows: rows.length,
    tileSize,
    tileIds: tiles.map((tile) => tile.id),
    blocking: tiles.map((tile) => tile.isBlocking),
  });
}
