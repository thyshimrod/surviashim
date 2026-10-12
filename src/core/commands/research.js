// @ts-check
import { GAME_EVENTS } from '../events/gameEvents.js';
import { levelOf, researchPoints } from '../systems/experience.js';
import { REJECTION_REASONS } from './commands.js';

/** @typedef {import('../state/GameState.js').GameState} GameState */
/** @typedef {import('../state/GameState.js').GameRules} GameRules */
/** @typedef {import('../events/EventBus.js').EventBus} EventBus */
/** @typedef {import('./commands.js').CommandResult} CommandResult */

/**
 * État d'un plan, lu par la fenêtre de recherche (R-IHM-REC-001).
 * @typedef {object} PlanInspection
 * @property {boolean} isDiscovered
 * @property {boolean} isResearched
 * @property {string | undefined} missingPrerequisite Recette prérequise encore inconnue.
 * @property {number | undefined} missingLevel Niveau requis, s'il n'est pas atteint.
 * @property {number} cost
 * @property {boolean} canAfford `true` si le joueur a assez de points.
 */

/**
 * Décrit un plan sans rien modifier.
 * @param {GameState} state
 * @param {GameRules} rules
 * @param {string} planId
 * @returns {PlanInspection}
 */
export function inspectPlan(state, rules, planId) {
  const plan = rules.research?.[planId];
  const requires = plan?.requires;
  const cost = plan?.cost ?? 0;
  return {
    isDiscovered: plan !== undefined && state.discoveredPlans.includes(planId),
    isResearched: state.researched.includes(planId),
    missingPrerequisite:
      requires !== undefined && !state.knownRecipes.includes(requires) ? requires : undefined,
    missingLevel: missingLevelOf(state, rules, plan?.level),
    cost,
    canAfford: researchPoints(state, rules) >= cost,
  };
}

/**
 * Niveau requis par un plan, s'il n'est pas atteint.
 * @param {GameState} state
 * @param {GameRules} rules
 * @param {number | undefined} level
 * @returns {number | undefined}
 */
function missingLevelOf(state, rules, level) {
  return level !== undefined && levelOf(state.experience, rules) < level ? level : undefined;
}

/**
 * R-TEC-REC-002 : paie un plan découvert et apprend sa recette, ou sa technique.
 * @param {GameState} state
 * @param {GameRules} rules
 * @param {EventBus} events
 * @param {string} planId
 * @returns {CommandResult}
 */
export function research(state, rules, events, planId) {
  const plan = inspectPlan(state, rules, planId);
  if (!plan.isDiscovered) {
    return { ok: false, reason: REJECTION_REASONS.UNKNOWN_PLAN };
  }
  if (plan.isResearched) {
    return { ok: false, reason: REJECTION_REASONS.ALREADY_RESEARCHED };
  }
  if (plan.missingPrerequisite !== undefined) {
    return { ok: false, reason: REJECTION_REASONS.MISSING_PREREQUISITE };
  }
  if (plan.missingLevel !== undefined) {
    return { ok: false, reason: REJECTION_REASONS.LEVEL_TOO_LOW };
  }
  if (!plan.canAfford) {
    return { ok: false, reason: REJECTION_REASONS.NOT_ENOUGH_POINTS };
  }
  state.researched.push(planId);
  const isRecipe = rules.recipes?.[planId] !== undefined; // sinon, une technique
  const recipes = !isRecipe || state.knownRecipes.includes(planId) ? [] : [planId];
  state.knownRecipes.push(...recipes);
  events.emit(GAME_EVENTS.RESEARCHED, { planId, recipes });
  return { ok: true };
}
