// @ts-check
import { GAME_EVENTS } from '../events/gameEvents.js';
import { isBedtime, nextMorning } from '../systems/needs.js';
import { timeOf } from '../systems/time.js';
import { inspectCampfire } from './campfire.js';
import { REJECTION_REASONS } from './commands.js';

/** @typedef {import('../state/GameState.js').GameState} GameState */
/** @typedef {import('../state/GameState.js').GameRules} GameRules */
/** @typedef {import('../events/EventBus.js').EventBus} EventBus */
/** @typedef {import('./commands.js').CommandResult} CommandResult */

/**
 * R-JOU-MAN-001 : mange une ressource.
 * @param {GameState} state
 * @param {GameRules} rules
 * @param {EventBus} events
 * @param {string} resource
 * @returns {CommandResult}
 */
export function eat(state, rules, events, resource) {
  const food = rules.resources?.[resource]?.food;
  if (food === undefined || rules.vitals === undefined) {
    return { ok: false, reason: REJECTION_REASONS.NOT_EDIBLE };
  }
  if ((state.inventory[resource] ?? 0) <= 0) {
    return { ok: false, reason: REJECTION_REASONS.NOTHING_TO_EAT };
  }
  if (state.hunger >= rules.vitals.hungerMax) {
    return { ok: false, reason: REJECTION_REASONS.ALREADY_FULL };
  }
  state.inventory[resource] -= 1;
  state.hunger = Math.min(rules.vitals.hungerMax, state.hunger + food);
  events.emit(GAME_EVENTS.ATE, { resource });
  return { ok: true };
}

/**
 * R-JOU-SOM-001 : dort près d'un feu allumé jusqu'au prochain matin.
 * @param {GameState} state
 * @param {GameRules} rules
 * @param {EventBus} events
 * @param {{ column: number, row: number }} tile Le feu de camp.
 * @returns {CommandResult}
 */
export function sleep(state, rules, events, tile) {
  const fire = inspectCampfire(state, rules, tile);
  const { time, vitals } = rules;
  if (fire === undefined || !fire.isLit || time === undefined || vitals === undefined) {
    return { ok: false, reason: REJECTION_REASONS.NOTHING_TO_SLEEP_BY };
  }
  if (!isBedtime(state, rules)) {
    return { ok: false, reason: REJECTION_REASONS.TOO_EARLY };
  }
  if (!fire.isInReach) {
    return { ok: false, reason: REJECTION_REASONS.OUT_OF_REACH };
  }
  state.dialogue = undefined;
  state.player.moveIntent = { dx: 0, dy: 0 };
  state.clock = nextMorning(state.clock, time);
  state.health = vitals.healthMax;
  state.hunger = Math.max(0, state.hunger - vitals.sleepHunger);
  events.emit(GAME_EVENTS.SLEPT, { day: timeOf(state.clock, time.ticksPerMinute).day });
  return { ok: true };
}
