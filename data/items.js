// @ts-check

/**
 * Objets uniques que le joueur peut posséder et donner (R-INV-OBJ-001, spécification B.9). Les
 * noms affichés sont dans src/presentation/i18n/fr.js.
 */

/**
 * @typedef {object} ItemDefinition
 * @property {string} id Identifiant unique, kebab-case.
 * @property {string} icon Icône (clé de ICONS, data/icons.js).
 */

/** @type {Readonly<Record<string, Readonly<ItemDefinition>>>} */
export const ITEMS = Object.freeze({
  'blue-doll': Object.freeze({ id: 'blue-doll', icon: 'doll' }),
});
