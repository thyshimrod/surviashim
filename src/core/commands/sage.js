// @ts-check
import { GAME_EVENTS } from '../events/gameEvents.js';
import { purifyAround } from '../systems/blight.js';
import { litFireInReach } from './campfire.js';
import { REJECTION_REASONS } from './commands.js';

/** @typedef {import('../state/GameState.js').GameState} GameState */
/** @typedef {import('../state/GameState.js').GameRules} GameRules */
/** @typedef {import('../events/EventBus.js').EventBus} EventBus */
/** @typedef {import('./commands.js').CommandResult} CommandResult */

/** Technique de purification, à rechercher (B.11). */
export const SAGE_SMOKE = 'sage-smoke';

/**
 * R-MEN-SAU-002 : brûle une sauge dans un feu allumé à portée et purifie autour du feu.
 * @param {GameState} state
 * @param {GameRules} rules
 * @param {EventBus} events
 * @returns {CommandResult}
 */
export function burnSage(state, rules, events) {
  if (!state.researched.includes(SAGE_SMOKE)) {
    return { ok: false, reason: REJECTION_REASONS.UNKNOWN_TECHNIQUE };
  }
  if ((state.inventory.sage ?? 0) <= 0) {
    return { ok: false, reason: REJECTION_REASONS.NOTHING_TO_BURN };
  }
  const fire = litFireInReach(state, rules);
  if (fire === undefined) {
    return { ok: false, reason: REJECTION_REASONS.NEEDS_FIRE };
  }
  state.inventory.sage -= 1;
  const count = purifyAround(state, rules, fire);
  events.emit(GAME_EVENTS.PURIFIED, { ...fire, count });
  return { ok: true };
}
