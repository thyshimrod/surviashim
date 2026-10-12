// @ts-check
import { TOOLS } from '../../../data/tools.js';
import { RESOURCES } from '../../../data/resources.js';
import { inspectPlan } from '../../core/commands/research.js';
import { researchPoints } from '../../core/systems/experience.js';
import { TEXTS } from '../i18n/fr.js';
import { CONTENT_TEXTS } from '../i18n/frContent.js';

/** @typedef {import('../../core/state/GameState.js').GameState} GameState */
/** @typedef {import('../../core/state/GameState.js').GameRules} GameRules */

/**
 * Ligne de la fenêtre de recherche.
 * @typedef {object} ResearchEntry
 * @property {string} id
 * @property {string} name « Hache en pierre ».
 * @property {string} icon Icône (clé de ICONS).
 * @property {string} cost « 1 point ».
 * @property {string} button
 * @property {boolean} isEnabled
 * @property {string | undefined} warning Pourquoi le bouton est inactif.
 */

/**
 * Contenu de la fenêtre de recherche (R-IHM-REC-001).
 * @typedef {object} ResearchContent
 * @property {string} points « Points de recherche : 1 ».
 * @property {ResearchEntry[]} entries Plans découverts, dans l'ordre.
 * @property {string | undefined} empty Message s'il n'y en a aucun.
 */

/**
 * @param {string} id
 * @returns {string} Nom du plan, avec une majuscule.
 */
function planName(id) {
  const name = CONTENT_TEXTS.plans[id] ?? id;
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/** Ressource dont un plan qui n'est pas une recette prend l'icône. */
const PLAN_RESOURCES = Object.freeze({ 'sage-smoke': 'sage' });

/**
 * Pourquoi un plan ne peut pas être recherché, dans l'ordre de R-TEC-REC-002.
 * @param {import('../../core/commands/research.js').PlanInspection} plan
 * @returns {string | undefined}
 */
function warningOf(plan) {
  if (plan.isResearched) {
    return TEXTS.researched;
  }
  if (plan.missingPrerequisite !== undefined) {
    return TEXTS.requires(
      CONTENT_TEXTS.plans[plan.missingPrerequisite] ?? plan.missingPrerequisite,
    );
  }
  if (plan.missingLevel !== undefined) {
    return TEXTS.levelRequired(plan.missingLevel);
  }
  return plan.canAfford ? undefined : TEXTS.notEnoughPoints;
}

/**
 * @param {{ getState: () => GameState, rules: GameRules }} game
 * @returns {ResearchContent}
 */
export function researchView(game) {
  const state = game.getState();
  const entries = state.discoveredPlans.map((id) => {
    const plan = inspectPlan(state, game.rules, id);
    const warning = warningOf(plan);
    return {
      id,
      name: planName(id),
      icon: TOOLS[id]?.icon ?? RESOURCES[PLAN_RESOURCES[id] ?? id]?.icon ?? 'scroll',
      cost: TEXTS.researchCost(plan.cost),
      button: TEXTS.researchButton,
      isEnabled: warning === undefined,
      warning,
    };
  });
  return {
    points: TEXTS.researchPoints(researchPoints(state, game.rules)),
    entries,
    empty: entries.length === 0 ? TEXTS.researchEmpty : undefined,
  };
}
