// @ts-check
// Outils de dessin de carte, utilisés par generateValley.js.

/** @typedef {{ column: number, row: number }} Tile */
/** @typedef {{ column: number, row: number, width: number, height: number }} Area */

const UINT32_RANGE = 4294967296;

/**
 * Générateur pseudo-aléatoire seedé (mulberry32) : la même graine donne la même suite.
 * @param {number} seed
 * @returns {() => number} Tirage dans [0, 1[.
 */
export function createRng(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / UINT32_RANGE;
  };
}

/**
 * Bruit lisse : valeurs aléatoires sur une grille de pas `step`, interpolées.
 * @param {() => number} random
 * @param {{ width: number, height: number, step: number }} size Taille de la carte, pas de la grille.
 * @returns {(column: number, row: number) => number} Valeur dans [0, 1].
 */
export function createNoise(random, { width, height, step }) {
  const columns = Math.ceil(width / step) + 2;
  const rows = Math.ceil(height / step) + 2;
  const grid = Array.from({ length: columns * rows }, () => random());
  const at = (gx, gy) => grid[gy * columns + gx];
  const smooth = (t) => t * t * (3 - 2 * t);
  return (column, row) => {
    const gx = Math.floor(column / step);
    const gy = Math.floor(row / step);
    const fx = smooth(column / step - gx);
    const fy = smooth(row / step - gy);
    const top = at(gx, gy) * (1 - fx) + at(gx + 1, gy) * fx;
    const bottom = at(gx, gy + 1) * (1 - fx) + at(gx + 1, gy + 1) * fx;
    return top * (1 - fy) + bottom * fy;
  };
}

/**
 * @param {Area} area
 * @param {number} column
 * @param {number} row
 * @returns {boolean} `true` si la tuile est dans le rectangle.
 */
export function isIn(area, column, row) {
  return (
    column >= area.column &&
    column < area.column + area.width &&
    row >= area.row &&
    row < area.row + area.height
  );
}

/**
 * @param {Tile} center
 * @param {{ x: number, y: number }} radii
 * @param {number} column
 * @param {number} row
 * @returns {boolean} `true` si la tuile est dans l'ellipse.
 */
export function inEllipse(center, radii, column, row) {
  return ((column - center.column) / radii.x) ** 2 + ((row - center.row) / radii.y) ** 2 <= 1;
}

/**
 * Grille modifiable de symboles (format de data/maps/).
 * @param {number} width
 * @param {number} height
 * @param {string} fillSymbol Symbole de départ de toutes les tuiles.
 * @returns {{ width: number, height: number, get: (column: number, row: number) => string | undefined, set: (column: number, row: number, symbol: string) => void, forEach: (visit: (column: number, row: number) => void) => void, rows: () => string[] }}
 */
export function createGrid(width, height, fillSymbol) {
  const cells = Array.from({ length: width * height }, () => fillSymbol);
  const isInside = (column, row) => column >= 0 && column < width && row >= 0 && row < height;
  return {
    width,
    height,
    /** @type {(column: number, row: number) => string | undefined} */
    get: (column, row) => (isInside(column, row) ? cells[row * width + column] : undefined),
    /** @type {(column: number, row: number, symbol: string) => void} */
    set: (column, row, symbol) => {
      if (isInside(column, row)) {
        cells[row * width + column] = symbol;
      }
    },
    /** @type {(visit: (column: number, row: number) => void) => void} */
    forEach: (visit) => {
      for (let row = 0; row < height; row += 1) {
        for (let column = 0; column < width; column += 1) {
          visit(column, row);
        }
      }
    },
    /** @type {() => string[]} */
    rows: () =>
      Array.from({ length: height }, (_, row) =>
        cells.slice(row * width, (row + 1) * width).join(''),
      ),
  };
}

/** @typedef {ReturnType<typeof createGrid>} Grid */

/**
 * Remplit un rectangle avec un symbole.
 * @param {Grid} grid
 * @param {Area} area
 * @param {string} symbol
 */
export function fill(grid, area, symbol) {
  grid.forEach((column, row) => {
    if (isIn(area, column, row)) {
      grid.set(column, row, symbol);
    }
  });
}

/**
 * Parcourt les tuiles d'une ligne droite.
 * @param {[number, number]} from Colonne et ligne de départ.
 * @param {[number, number]} to Colonne et ligne d'arrivée.
 * @param {(column: number, row: number) => void} visit
 */
export function line([fromColumn, fromRow], [toColumn, toRow], visit) {
  const steps = Math.max(Math.abs(toColumn - fromColumn), Math.abs(toRow - fromRow));
  for (let step = 0; step <= steps; step += 1) {
    const t = steps === 0 ? 0 : step / steps;
    visit(
      Math.round(fromColumn + (toColumn - fromColumn) * t),
      Math.round(fromRow + (toRow - fromRow) * t),
    );
  }
}

/**
 * Tuiles d'un carré centré sur une tuile.
 * @param {Tile} center
 * @param {number} radius
 * @returns {Tile[]}
 */
export function around({ column, row }, radius) {
  const tiles = [];
  for (let dy = -radius; dy <= radius; dy += 1) {
    for (let dx = -radius; dx <= radius; dx += 1) {
      tiles.push({ column: column + dx, row: row + dy });
    }
  }
  return tiles;
}

/**
 * Distance (en tuiles, au sens de Tchebychev) d'une tuile au bord d'une zone ; 0 ou moins dedans.
 * @param {{ column: number, row: number, width: number, height: number }} area
 * @param {number} column
 * @param {number} row
 * @returns {number}
 */
export function distanceOutside(area, column, row) {
  return Math.max(
    area.column - column,
    column - (area.column + area.width - 1),
    area.row - row,
    row - (area.row + area.height - 1),
  );
}
