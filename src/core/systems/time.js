// @ts-check

/** @typedef {import('../state/GameState.js').GameState} GameState */
/** @typedef {import('../state/GameState.js').GameRules} GameRules */

/** Minutes de jeu dans une journée. */
export const MINUTES_PER_DAY = 1440;

/**
 * Valeurs des règles du temps (spécification, partie C).
 * @typedef {object} TimeRules
 * @property {number} ticksPerMinute Ticks par minute de jeu (R-MON-TPS-001).
 * @property {number} dayStart Minute du jour : début d'une partie, fin de l'aube.
 * @property {number} duskStart Minute du jour : début du crépuscule.
 * @property {number} nightStart Minute du jour : nuit complète.
 * @property {number} dawnStart Minute du jour : début de l'aube.
 * @property {number} nightDarkness Obscurité en pleine nuit (0 à 1).
 * @property {number} heroLightRadius Halo du héros (px).
 * @property {number} campfireLightRadius Halo d'un feu de camp allumé (px).
 * @property {number} campfireBurnMinutes Combustion d'un feu de camp (minutes de jeu).
 * @property {number} campfireRekindleWood Bois pour raviver un feu.
 * @property {number} treeRegrowDays Jours avant qu'une souche redevienne un arbre.
 */

/**
 * R-MON-TPS-001 : jour (à partir de 1) et minute du jour d'une horloge.
 * @param {number} clock Ticks écoulés depuis le jour 1 à 0:00.
 * @param {number} ticksPerMinute
 * @returns {{ day: number, minute: number }}
 */
export function timeOf(clock, ticksPerMinute) {
  const minutes = Math.floor(clock / ticksPerMinute);
  return { day: Math.floor(minutes / MINUTES_PER_DAY) + 1, minute: minutes % MINUTES_PER_DAY };
}

/**
 * Horloge (ticks) d'une durée en minutes de jeu.
 * @param {number} minutes
 * @param {TimeRules} time
 * @returns {number}
 */
export function ticksFor(minutes, time) {
  return minutes * time.ticksPerMinute;
}

/**
 * R-MON-TPS-002 : obscurité à une minute du jour.
 * @param {number} minute Minute du jour (0 à 1439).
 * @param {{ time?: TimeRules }} rules
 * @returns {number} De 0 (plein jour) à `nightDarkness`.
 */
export function darknessAt(minute, { time }) {
  if (time === undefined) {
    return 0;
  }
  const { dayStart, duskStart, nightStart, dawnStart, nightDarkness } = time;
  if (minute >= dayStart && minute < duskStart) {
    return 0;
  }
  if (minute >= duskStart && minute < nightStart) {
    return (nightDarkness * (minute - duskStart)) / (nightStart - duskStart);
  }
  if (minute >= dawnStart && minute < dayStart) {
    return (nightDarkness * (dayStart - minute)) / (dayStart - dawnStart);
  }
  return nightDarkness;
}

/**
 * R-MON-TPS-001 : avance l'horloge d'un tick.
 * @param {GameState} state
 */
export function advanceClock(state) {
  state.clock += 1;
}
