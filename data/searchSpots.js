// @ts-check

/**
 * Cachettes des ruines (R-RES-FOU-003, spécification B.7) : la tuile, le type d'élément à fouiller
 * qui s'y trouve, et ce qu'il contient. L'outil tools/maps/generateValley.js place ces éléments
 * sur la carte.
 */

/**
 * @typedef {object} SearchSpot
 * @property {number} column
 * @property {number} row
 * @property {'ruin-bookshelf' | 'ruin-chest' | 'ruin-crate'} tile Élément à fouiller.
 * @property {readonly string[]} books Livres (clés de data/books.js), au plus SEARCH_MAX_BOOKS.
 * @property {readonly string[]} items Objets (clés de data/items.js).
 * @property {Readonly<Record<string, number>>} resources Matériaux (clés de data/resources.js).
 */

/**
 * @param {[number, number]} position Colonne et ligne.
 * @param {SearchSpot['tile']} tile
 * @param {{ books?: string[], items?: string[], resources?: Record<string, number> }} [content]
 * @returns {Readonly<SearchSpot>}
 */
function spot([column, row], tile, { books = [], items = [], resources = {} } = {}) {
  return Object.freeze({
    column,
    row,
    tile,
    books: Object.freeze(books),
    items: Object.freeze(items),
    resources: Object.freeze(resources),
  });
}

/** @type {readonly Readonly<SearchSpot>[]} */
export const SEARCH_SPOTS = Object.freeze([
  // Les Ruines du Guet : de quoi fabriquer la hache et la pioche en silex (B.8).
  spot([26, 25], 'ruin-bookshelf', { books: ['flint-knapping'], resources: { flint: 2 } }),
  spot([32, 29], 'ruin-chest', { resources: { branch: 4, fiber: 2 } }),
  // La Chapelle engloutie.
  spot([120, 58], 'ruin-bookshelf', { books: ['watchman-notebook', 'dawn-ritual'] }),
  spot([123, 64], 'ruin-crate', { books: ['forager-guide'], resources: { flint: 1, fiber: 3 } }),
  // Le Hameau abandonné.
  spot([115, 97], 'ruin-crate', { resources: { branch: 2, fiber: 1 } }),
  // La poupée de la quête de Maëlle (B.9).
  spot([127, 96], 'ruin-chest', { items: ['blue-doll'], resources: { flint: 2, branch: 1 } }),
  // Livres de recherche (B.11).
  spot([115, 105], 'ruin-crate', { books: ['stonework'] }),
  spot([127, 105], 'ruin-crate', { resources: { fiber: 2 } }),
]);
