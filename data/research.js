// @ts-check
import { GAME_PARAMETERS } from './gameParameters.js';

/**
 * Plans de recherche (concepts C-TEC-01, C-TEC-04, spécification B.11) : coût en points de
 * recherche et prérequis. L'identifiant d'un plan est celui de sa recette (data/recipes.js).
 */

/**
 * @typedef {object} ResearchPlan
 * @property {string} id
 * @property {number} cost Points de recherche (R-TEC-REC-002).
 * @property {string} [requires] Recette qu'il faut connaître avant (R-TEC-REC-002).
 */

/**
 * @param {string} id
 * @param {string} [requires]
 * @returns {Readonly<ResearchPlan>}
 */
function plan(id, requires) {
  return Object.freeze({
    id,
    cost: GAME_PARAMETERS.RESEARCH_COST,
    ...(requires === undefined ? {} : { requires }),
  });
}

/** @type {Readonly<Record<string, Readonly<ResearchPlan>>>} */
export const RESEARCH_PLANS = Object.freeze({
  'stone-axe': plan('stone-axe', 'flint-axe'),
  'stone-pickaxe': plan('stone-pickaxe', 'flint-pickaxe'),
  'gatherer-bag': plan('gatherer-bag'),
  'grilled-mushroom': plan('grilled-mushroom'),
});
