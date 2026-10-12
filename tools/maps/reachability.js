// @ts-check
import { TILE_DEFINITIONS } from '../../data/tilesets.js';

/** @typedef {{ column: number, row: number }} Tile */

const WALKABLE_SYMBOLS = new Set(
  Object.values(TILE_DEFINITIONS)
    .filter((tile) => !tile.isBlocking)
    .map((tile) => tile.symbol),
);

/**
 * Tuiles franchissables accessibles depuis une tuile de départ, en marchant de tuile en tuile
 * (4 directions).
 * @param {readonly string[]} rows Carte au format de data/maps/.
 * @param {Tile} start
 * @returns {Set<string>} Tuiles accessibles, sous la forme « colonne,ligne ».
 */
export function reachableTiles(rows, start) {
  const isWalkable = (column, row) => WALKABLE_SYMBOLS.has(rows[row]?.[column]);
  const seen = new Set([`${start.column},${start.row}`]);
  const queue = [start];
  while (queue.length > 0) {
    const { column, row } = queue.shift();
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const key = `${column + dx},${row + dy}`;
      if (!seen.has(key) && isWalkable(column + dx, row + dy)) {
        seen.add(key);
        queue.push({ column: column + dx, row: row + dy });
      }
    }
  }
  return seen;
}

/**
 * Cibles dont aucune tuile n'est accessible depuis le départ.
 * @param {object} params
 * @param {readonly string[]} params.rows
 * @param {Tile} params.start
 * @param {readonly { name: string, tiles: readonly Tile[] }[]} params.targets
 * @returns {string[]} Noms des cibles inaccessibles.
 */
export function findUnreachable({ rows, start, targets }) {
  const reachable = reachableTiles(rows, start);
  return targets
    .filter(({ tiles }) => !tiles.some(({ column, row }) => reachable.has(`${column},${row}`)))
    .map(({ name }) => name);
}
