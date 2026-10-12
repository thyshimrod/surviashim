// @ts-check
import { GAME_PARAMETERS } from './gameParameters.js';

/**
 * Ressources que le joueur accumule dans son inventaire, dans l'ordre d'affichage
 * (R-IHM-HUD-001). Les noms affichés sont dans src/presentation/i18n/fr.js.
 */

/**
 * @typedef {object} ResourceDefinition
 * @property {string} id Identifiant unique, kebab-case.
 * @property {string} icon Icône (clé de ICONS, data/icons.js).
 * @property {number} [food] Faim rendue en la mangeant (R-JOU-MAN-001) ; absente, elle ne se
 *   mange pas.
 */

/** @type {Readonly<Record<string, Readonly<ResourceDefinition>>>} */
export const RESOURCES = Object.freeze({
  wood: Object.freeze({ id: 'wood', icon: 'wood' }),
  stone: Object.freeze({ id: 'stone', icon: 'stone' }),
  flower: Object.freeze({ id: 'flower', icon: 'flower' }),
  flint: Object.freeze({ id: 'flint', icon: 'flint' }),
  branch: Object.freeze({ id: 'branch', icon: 'branch' }),
  fiber: Object.freeze({ id: 'fiber', icon: 'fiber' }),
  berry: Object.freeze({ id: 'berry', icon: 'berries', food: GAME_PARAMETERS.BERRY_FOOD }),
  mushroom: Object.freeze({
    id: 'mushroom',
    icon: 'mushroom',
    food: GAME_PARAMETERS.MUSHROOM_FOOD,
  }),
  'grilled-mushroom': Object.freeze({
    id: 'grilled-mushroom',
    icon: 'mushroom-green',
    food: GAME_PARAMETERS.GRILLED_MUSHROOM_FOOD,
  }),
  // Sauge de l'aube : ne se mange pas, se brûle (R-MEN-SAU-002).
  sage: Object.freeze({ id: 'sage', icon: 'lavender' }),
});
