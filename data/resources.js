// @ts-check

/**
 * Ressources que le joueur accumule dans son inventaire, dans l'ordre d'affichage
 * (R-IHM-HUD-001). Les noms affichés sont dans src/presentation/i18n/fr.js.
 */

/**
 * @typedef {object} ResourceDefinition
 * @property {string} id Identifiant unique, kebab-case.
 * @property {string} icon Icône (clé de ICONS, data/icons.js).
 */

/** @type {Readonly<Record<string, Readonly<ResourceDefinition>>>} */
export const RESOURCES = Object.freeze({
  wood: Object.freeze({ id: 'wood', icon: 'wood' }),
  stone: Object.freeze({ id: 'stone', icon: 'stone' }),
  flower: Object.freeze({ id: 'flower', icon: 'flower' }),
  flint: Object.freeze({ id: 'flint', icon: 'flint' }),
  branch: Object.freeze({ id: 'branch', icon: 'branch' }),
  fiber: Object.freeze({ id: 'fiber', icon: 'fiber' }),
});
