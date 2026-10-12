// @ts-check

/**
 * Objets à poser (concept C-ART-07, spécification B.8) : fabriqués, gardés dans l'inventaire,
 * puis posés sur la tuile devant le joueur (R-ART-POS-001). Les noms affichés sont ceux des plans
 * (src/presentation/i18n/frContent.js).
 */

/**
 * @typedef {object} PlaceableDefinition
 * @property {string} id Identifiant unique, kebab-case.
 * @property {string} icon Icône (clé de ICONS, data/icons.js).
 * @property {string} tile Type de tuile laissé une fois posé (clé de data/tilesets.js).
 */

/** @type {Readonly<Record<string, Readonly<PlaceableDefinition>>>} */
export const PLACEABLES = Object.freeze({
  campfire: Object.freeze({ id: 'campfire', icon: 'log-burning', tile: 'campfire' }),
});
