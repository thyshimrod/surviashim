// @ts-check
import { GAME_EVENTS } from '../events/gameEvents.js';
import { MINUTES_PER_DAY, ticksFor, timeOf } from './time.js';

/** @typedef {import('../state/GameState.js').GameState} GameState */
/** @typedef {import('../state/GameState.js').GameRules} GameRules */
/** @typedef {import('../events/EventBus.js').EventBus} EventBus */

/**
 * Valeurs des règles de faim, de santé et de sommeil (spécification, partie C).
 * @typedef {object} VitalRules
 * @property {number} healthMax
 * @property {number} hungerMax
 * @property {number} hungerMinutes Minutes de jeu pour perdre 1 point de faim.
 * @property {number} healthMinutes Minutes de jeu entre deux variations de PV.
 * @property {number} wellFed Faim au-dessus de laquelle les PV remontent.
 * @property {number} faintHealth PV au réveil d'un évanouissement.
 * @property {number} faintHunger Faim minimale au réveil d'un évanouissement.
 * @property {number} sleepStart Minute du jour à partir de laquelle on peut dormir.
 * @property {number} sleepHunger Faim perdue pendant une nuit.
 * @property {{ x: number, y: number }} startPosition Où l'on se réveille d'un évanouissement.
 */

/**
 * Horloge (ticks) du prochain matin (`dayStart`) après l'horloge donnée.
 * @param {number} clock
 * @param {import('./time.js').TimeRules} time
 * @returns {number}
 */
export function nextMorning(clock, time) {
  const dayTicks = ticksFor(MINUTES_PER_DAY, time);
  const morning = Math.floor(clock / dayTicks) * dayTicks + ticksFor(time.dayStart, time);
  return morning > clock ? morning : morning + dayTicks;
}

/**
 * R-JOU-VIE-002 à 004 : la faim baisse, la santé suit la faim, à 0 PV le joueur s'évanouit.
 * Ne fait rien si les règles de faim sont absentes.
 * @param {GameState} state
 * @param {GameRules} rules
 * @param {EventBus} events
 */
export function updateNeeds(state, rules, events) {
  const { vitals, time } = rules;
  if (vitals === undefined || time === undefined) {
    return;
  }
  if (state.clock % ticksFor(vitals.hungerMinutes, time) === 0) {
    state.hunger = Math.max(0, state.hunger - 1);
  }
  if (state.clock % ticksFor(vitals.healthMinutes, time) === 0) {
    if (state.hunger > vitals.wellFed) {
      state.health = Math.min(vitals.healthMax, state.health + 1);
    } else if (state.hunger === 0) {
      state.health -= 1;
    }
  }
  if (state.health <= 0) {
    faint(state, rules, events);
  }
}

/**
 * R-JOU-VIE-004 : réveil au prochain matin, au départ, sans rien perdre.
 * @param {GameState} state
 * @param {GameRules} rules
 * @param {EventBus} events
 */
function faint(state, rules, events) {
  const vitals = /** @type {VitalRules} */ (rules.vitals);
  const time = /** @type {import('./time.js').TimeRules} */ (rules.time);
  state.dialogue = undefined;
  state.clock = nextMorning(state.clock, time);
  state.player.position = { ...vitals.startPosition };
  state.player.moveIntent = { dx: 0, dy: 0 };
  state.health = vitals.faintHealth;
  state.hunger = Math.max(state.hunger, vitals.faintHunger);
  events.emit(GAME_EVENTS.FAINTED, {});
}

/**
 * Peut-on dormir à cette heure (de `sleepStart` jusqu'avant `dayStart`) ?
 * @param {GameState} state
 * @param {GameRules} rules
 * @returns {boolean}
 */
export function isBedtime(state, rules) {
  const { time, vitals } = rules;
  if (time === undefined || vitals === undefined) {
    return false;
  }
  const { minute } = timeOf(state.clock, time.ticksPerMinute);
  return minute >= vitals.sleepStart || minute < time.dayStart;
}
