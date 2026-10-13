// @ts-check

/** @typedef {{ column: number, row: number }} Tile */

/** Les 8 voisins d'une tuile, et le coût d'y aller. */
const NEIGHBORS = Object.freeze(
  [-1, 0, 1].flatMap((dx) =>
    [-1, 0, 1]
      .filter((dy) => dx !== 0 || dy !== 0)
      .map((dy) => Object.freeze({ dx, dy, cost: dx !== 0 && dy !== 0 ? Math.SQRT2 : 1 })),
  ),
);

/**
 * Distance « octile » entre deux tuiles : le plus court chemin en 8 directions sans obstacle.
 * @param {Tile} a
 * @param {Tile} b
 * @returns {number}
 */
export function octile(a, b) {
  const dx = Math.abs(a.column - b.column);
  const dy = Math.abs(a.row - b.row);
  return Math.max(dx, dy) + (Math.SQRT2 - 1) * Math.min(dx, dy);
}

/**
 * Recherche du plus court chemin A* sur la grille des tuiles (R-JOU-DEP-004) : 8 directions,
 * sans couper le coin d'une tuile infranchissable.
 * @param {object} params
 * @param {{ columns: number, rows: number, contains: (c: number, r: number) => boolean,
 *   isBlocking: (c: number, r: number) => boolean }} params.map
 * @param {Tile} params.from Tuile de départ.
 * @param {(tile: Tile) => boolean} params.isGoal
 * @param {(tile: Tile) => number} params.estimate Estimation du reste du chemin, sans excès.
 * @returns {Tile[] | undefined} Les tuiles, du départ à l'arrivée ; `undefined` sans chemin.
 */
export function findPath({ map, from, isGoal, estimate }) {
  const key = (/** @type {Tile} */ tile) => tile.row * map.columns + tile.column;
  /** @type {Map<number, number>} */
  const cost = new Map([[key(from), 0]]);
  /** @type {Map<number, Tile>} */
  const cameFrom = new Map();
  const open = new MinHeap();
  open.push(from, estimate(from));
  while (open.size > 0) {
    const tile = /** @type {Tile} */ (open.pop());
    if (isGoal(tile)) {
      return rebuild(tile, cameFrom, key);
    }
    const base = /** @type {number} */ (cost.get(key(tile)));
    for (const next of walkableNeighbors(map, tile)) {
      const nextCost = base + next.cost;
      const nextKey = key(next.tile);
      if (nextCost < (cost.get(nextKey) ?? Infinity)) {
        cost.set(nextKey, nextCost);
        cameFrom.set(nextKey, tile);
        open.push(next.tile, nextCost + estimate(next.tile));
      }
    }
  }
  return undefined;
}

/**
 * Voisins franchissables ; une diagonale exige ses deux côtés franchissables.
 * @param {Parameters<typeof findPath>[0]['map']} map
 * @param {Tile} tile
 * @returns {{ tile: Tile, cost: number }[]}
 */
function walkableNeighbors(map, { column, row }) {
  const isFree = (/** @type {number} */ c, /** @type {number} */ r) =>
    map.contains(c, r) && !map.isBlocking(c, r);
  return NEIGHBORS.filter(
    ({ dx, dy }) =>
      isFree(column + dx, row + dy) && isFree(column + dx, row) && isFree(column, row + dy),
  ).map(({ dx, dy, cost }) => ({ tile: { column: column + dx, row: row + dy }, cost }));
}

/**
 * @param {Tile} last
 * @param {Map<number, Tile>} cameFrom
 * @param {(tile: Tile) => number} key
 * @returns {Tile[]}
 */
function rebuild(last, cameFrom, key) {
  const path = [last];
  let tile = cameFrom.get(key(last));
  while (tile !== undefined) {
    path.unshift(tile);
    tile = cameFrom.get(key(tile));
  }
  return path;
}

/** File de priorité minimale (tas binaire). */
class MinHeap {
  constructor() {
    /** @type {{ item: Tile, priority: number }[]} */
    this.items = [];
  }

  get size() {
    return this.items.length;
  }

  /**
   * @param {Tile} item
   * @param {number} priority
   */
  push(item, priority) {
    const { items } = this;
    items.push({ item, priority });
    let index = items.length - 1;
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (items[parent].priority <= items[index].priority) {
        break;
      }
      [items[parent], items[index]] = [items[index], items[parent]];
      index = parent;
    }
  }

  /** @returns {Tile | undefined} */
  pop() {
    const { items } = this;
    const top = items[0];
    const last = items.pop();
    if (items.length > 0 && last !== undefined) {
      items[0] = last;
      this.sink(0);
    }
    return top?.item;
  }

  /** @param {number} start */
  sink(start) {
    const { items } = this;
    let index = start;
    for (;;) {
      const left = index * 2 + 1;
      const smallest = [left, left + 1]
        .filter((child) => child < items.length)
        .reduce(
          (best, child) => (items[child].priority < items[best].priority ? child : best),
          index,
        );
      if (smallest === index) {
        return;
      }
      [items[smallest], items[index]] = [items[index], items[smallest]];
      index = smallest;
    }
  }
}
