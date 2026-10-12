// @ts-check

/**
 * Lieux nommés de la vallée (R-MON-LIE-001, spécification B.6). Chaque lieu couvre un rectangle
 * de tuiles. Les noms affichés sont dans src/presentation/i18n/frContent.js. L'outil
 * tools/maps/generateValley.js dessine la vallée autour de ces lieux.
 */

/**
 * @typedef {object} PlaceDefinition
 * @property {string} id Identifiant unique, kebab-case.
 * @property {Readonly<{ column: number, row: number, width: number, height: number }>} area
 *   Rectangle de tuiles : coin supérieur gauche, largeur et hauteur.
 */

/**
 * @param {string} id
 * @param {number} column
 * @param {number} row
 * @param {[number, number]} size Largeur et hauteur (tuiles).
 * @returns {Readonly<PlaceDefinition>}
 */
function place(id, column, row, [width, height]) {
  return Object.freeze({ id, area: Object.freeze({ column, row, width, height }) });
}

/** @type {Readonly<Record<string, Readonly<PlaceDefinition>>>} */
export const PLACES = Object.freeze({
  vale: place('vale', 18, 80, [32, 26]),
  'watchtower-ruins': place('watchtower-ruins', 22, 20, [16, 14]),
  'silver-lake': place('silver-lake', 64, 46, [38, 33]),
  'sunken-chapel': place('sunken-chapel', 110, 54, [18, 16]),
  'abandoned-hamlet': place('abandoned-hamlet', 110, 92, [26, 18]),
  'whispering-wood': place('whispering-wood', 46, 8, [44, 28]),
  'rocky-hills': place('rocky-hills', 110, 8, [42, 34]),
});
