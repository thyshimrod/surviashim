// @ts-check
import { GAME_PARAMETERS } from './gameParameters.js';

/**
 * Outils que le joueur peut posséder (concept C-INV-04, spécification B.8). Les noms affichés sont
 * dans src/presentation/i18n/fr.js.
 */

/**
 * Sorte d'outil : ce qu'exige une récolte (R-RES-OUT-001).
 * @typedef {'axe' | 'pickaxe' | 'bag'} ToolKind
 */

/**
 * @typedef {object} ToolDefinition
 * @property {string} id Identifiant unique, kebab-case.
 * @property {ToolKind} kind
 * @property {string} icon Icône (clé de ICONS, data/icons.js).
 * @property {number} bonus Rendement en plus (R-RES-OUT-002).
 */

/** @type {Readonly<Record<string, Readonly<ToolDefinition>>>} */
export const TOOLS = Object.freeze({
  'flint-axe': Object.freeze({ id: 'flint-axe', kind: 'axe', icon: 'axe', bonus: 0 }),
  'flint-pickaxe': Object.freeze({
    id: 'flint-pickaxe',
    kind: 'pickaxe',
    icon: 'pickaxe',
    bonus: 0,
  }),
  'stone-axe': Object.freeze({
    id: 'stone-axe',
    kind: 'axe',
    icon: 'battle-axe',
    bonus: GAME_PARAMETERS.STONE_TOOL_BONUS,
  }),
  'stone-pickaxe': Object.freeze({
    id: 'stone-pickaxe',
    kind: 'pickaxe',
    icon: 'pickaxe',
    bonus: GAME_PARAMETERS.STONE_TOOL_BONUS,
  }),
  'gatherer-bag': Object.freeze({
    id: 'gatherer-bag',
    kind: 'bag',
    icon: 'sack',
    bonus: GAME_PARAMETERS.BAG_BONUS,
  }),
});
