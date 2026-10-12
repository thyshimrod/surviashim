// @ts-check
import { GAME_EVENTS } from '../events/gameEvents.js';

/** @typedef {import('../state/GameState.js').GameState} GameState */
/** @typedef {import('../state/GameState.js').GameRules} GameRules */
/** @typedef {import('../events/EventBus.js').EventBus} EventBus */

/**
 * Valeurs des règles d'expérience (spécification, partie C).
 * @typedef {object} ExperienceRules
 * @property {number} harvest Expérience par récolte (R-JOU-EXP-002).
 * @property {number} search Par fouille.
 * @property {number} craft Par fabrication.
 * @property {number} discover Par lieu découvert.
 * @property {number} firstLevel Expérience pour passer au niveau 2 (R-JOU-EXP-003).
 * @property {number} step Expérience demandée en plus à chaque niveau suivant.
 */

/**
 * R-JOU-EXP-003 : expérience totale qu'il faut pour atteindre un niveau.
 * @param {number} level À partir de 1.
 * @param {ExperienceRules} experience
 * @returns {number}
 */
export function levelThreshold(level, { firstLevel, step }) {
  const gained = level - 1;
  return gained * firstLevel + (step * gained * (gained - 1)) / 2;
}

/**
 * R-JOU-EXP-003 : niveau atteint avec cette expérience.
 * @param {number} experience
 * @param {{ experience?: ExperienceRules }} rules
 * @returns {number}
 */
export function levelOf(experience, rules) {
  if (rules.experience === undefined) {
    return 1;
  }
  let level = 1;
  while (experience >= levelThreshold(level + 1, rules.experience)) {
    level += 1;
  }
  return level;
}

/**
 * R-TEC-REC-001 : points de recherche disponibles : un par niveau au-dessus du premier, moins le
 * coût des plans recherchés.
 * @param {GameState} state
 * @param {GameRules} rules
 * @returns {number}
 */
export function researchPoints(state, rules) {
  const spent = state.researched.reduce(
    (total, id) => total + (rules.research?.[id]?.cost ?? 0),
    0,
  );
  return levelOf(state.experience, rules) - 1 - spent;
}

/**
 * R-JOU-EXP-002 : ajoute de l'expérience ; chaque niveau gagné est annoncé (R-IHM-NOT-004).
 * @param {GameState} state
 * @param {GameRules} rules
 * @param {EventBus} events
 * @param {number} amount
 */
export function gainExperience(state, rules, events, amount) {
  const before = levelOf(state.experience, rules);
  state.experience += amount;
  const after = levelOf(state.experience, rules);
  for (let level = before + 1; level <= after; level += 1) {
    events.emit(GAME_EVENTS.LEVEL_UP, { level });
  }
}
