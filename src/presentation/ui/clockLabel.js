// @ts-check
import { TEXTS } from '../i18n/fr.js';

const MINUTES_PER_HOUR = 60;
/** L'heure s'affiche par tranches de 10 minutes. */
const MINUTE_STEP = 10;

/**
 * R-IHM-HOR-001 : « Jour 1 · 6:00 », minutes arrondies à la dizaine inférieure.
 * @param {{ day: number, minute: number }} time
 * @returns {string}
 */
export function clockLabel({ day, minute }) {
  const hours = Math.floor(minute / MINUTES_PER_HOUR);
  const minutes = Math.floor((minute % MINUTES_PER_HOUR) / MINUTE_STEP) * MINUTE_STEP;
  return TEXTS.clock(day, `${hours}:${String(minutes).padStart(2, '0')}`);
}
