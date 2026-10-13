// @ts-check
import { GAME_EVENTS } from '../events/gameEvents.js';
import { isBlighted, playerTile } from './blight.js';
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
 * @property {number} energyMax
 * @property {number} energyDrainMinutes Minutes de jeu pour perdre 1 d'énergie en zone flétrie.
 * @property {number} blightHealthMinutes Minutes de jeu entre deux PV perdus, sans énergie.
 * @property {number} energyRegenMinutes Minutes de jeu pour regagner 1 d'énergie près du Foyer.
 * @property {number} faintEnergy Énergie minimale au réveil d'un évanouissement.
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
  /**
   * @param {number} minutes
   * @returns {boolean} `true` si l'horloge franchit un multiple de cette durée.
   */
  const every = (minutes) => state.clock % ticksFor(minutes, time) === 0;
  const inBlight = isBlighted(state, rules, playerTile(state));
  if (every(vitals.hungerMinutes)) {
    state.hunger = Math.max(0, state.hunger - 1);
  }
  updateEnergy(state, rules, { inBlight, every });
  updateHealth(state, vitals, { isExhausted: inBlight && state.energy === 0, every });
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
  state.harvesting = undefined; // R-RES-REC-006
  state.travel = undefined; // R-JOU-DEP-004
  state.clock = nextMorning(state.clock, time);
  state.player.position = { ...vitals.startPosition };
  state.player.moveIntent = { dx: 0, dy: 0 };
  state.health = vitals.faintHealth;
  state.hunger = Math.max(state.hunger, vitals.faintHunger);
  state.energy = Math.max(state.energy, vitals.faintEnergy);
  events.emit(GAME_EVENTS.FAINTED, {});
}

/**
 * R-JOU-VIE-003, R-JOU-ENE-003 : la santé suit la faim ; épuisé en zone flétrie, elle baisse.
 * @param {GameState} state
 * @param {VitalRules} vitals
 * @param {{ isExhausted: boolean, every: (minutes: number) => boolean }} context
 */
function updateHealth(state, vitals, { isExhausted, every }) {
  if (every(vitals.healthMinutes)) {
    if (state.hunger > vitals.wellFed && !isExhausted) {
      state.health = Math.min(vitals.healthMax, state.health + 1);
    } else if (state.hunger === 0) {
      state.health -= 1;
    }
  }
  if (isExhausted && every(vitals.blightHealthMinutes)) {
    state.health -= 1;
  }
}

/**
 * R-JOU-ENE-002, 004 : la Flétrissure ronge l'énergie ; près du Foyer, elle remonte.
 * @param {GameState} state
 * @param {GameRules} rules
 * @param {{ inBlight: boolean, every: (minutes: number) => boolean }} context
 */
function updateEnergy(state, rules, { inBlight, every }) {
  const vitals = /** @type {VitalRules} */ (rules.vitals);
  if (inBlight && every(vitals.energyDrainMinutes)) {
    state.energy = Math.max(0, state.energy - 1);
  }
  if (isNearHearth(state, rules) && every(vitals.energyRegenMinutes)) {
    state.energy = Math.min(vitals.energyMax, state.energy + 1);
  }
}

/**
 * Le joueur est-il à `HEARTH_REACH` ou moins du centre du Foyer ?
 * @param {GameState} state
 * @param {GameRules} rules
 * @returns {boolean}
 */
export function isNearHearth(state, rules) {
  const hearth = rules.hearth;
  if (
    hearth === undefined ||
    !state.map.contains(hearth.column, hearth.row) ||
    !rules.tiles[state.map.tileIdAt(hearth.column, hearth.row)]?.isHearth
  ) {
    return false;
  }
  const size = state.map.tileSize;
  const { x, y } = state.player.position;
  const half = size / 2;
  const distance = Math.hypot(x - (hearth.column * size + half), y - (hearth.row * size + half));
  return distance <= hearth.reach;
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
