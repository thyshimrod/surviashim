// @ts-check
import { GAME_PARAMETERS } from './gameParameters.js';

/**
 * Plans de recherche (concepts C-TEC-01, C-TEC-04, spécification B.11) : coût en points de
 * recherche et prérequis. L'identifiant d'un plan est celui de sa recette (data/recipes.js), ou
 * celui d'une technique s'il n'est pas une recette (la fumée de sauge).
 */

/**
 * @typedef {object} ResearchPlan
 * @property {string} id
 * @property {number} cost Points de recherche (R-TEC-REC-002).
 * @property {string} [requires] Recette qu'il faut connaître avant (R-TEC-REC-002).
 * @property {number} [level] Niveau à atteindre avant (R-TEC-REC-002).
 */

/**
 * @param {string} id
 * @param {{ requires?: string, level?: number }} [prerequisites]
 * @returns {Readonly<ResearchPlan>}
 */
function plan(id, prerequisites = {}) {
  return Object.freeze({ id, cost: GAME_PARAMETERS.RESEARCH_COST, ...prerequisites });
}

/** @type {Readonly<Record<string, Readonly<ResearchPlan>>>} */
export const RESEARCH_PLANS = Object.freeze({
  'stone-axe': plan('stone-axe', { requires: 'flint-axe' }),
  'stone-pickaxe': plan('stone-pickaxe', { requires: 'flint-pickaxe' }),
  'gatherer-bag': plan('gatherer-bag'),
  'grilled-mushroom': plan('grilled-mushroom'),
  'sage-smoke': plan('sage-smoke', { level: GAME_PARAMETERS.SAGE_SMOKE_LEVEL }),
});
