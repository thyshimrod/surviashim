// @ts-check
import { TEXTS } from '../i18n/fr.js';

/** @typedef {import('../../core/commands/harvest.js').TileInspection} TileInspection */
/** @typedef {import('./InspectionController.js').InspectionView} InspectionView */

const MINUTES_PER_HOUR = 60;

/**
 * R-IHM-INS-008 : fenêtre d'information d'un feu de camp. Le bois manquant passe avant la
 * distance.
 * @param {TileInspection & { campfire: import('../../core/commands/campfire.js').CampfireInspection }} inspection
 * @returns {InspectionView}
 */
export function campfireView({ campfire, isInReach }) {
  const hours = Math.ceil(campfire.minutesLeft / MINUTES_PER_HOUR);
  let warning;
  if (!campfire.hasFuel) {
    warning = TEXTS.woodNeeded;
  } else if (!isInReach) {
    warning = TEXTS.tooFar;
  }
  return {
    title: TEXTS.tileNames.campfire,
    action: campfire.isLit ? TEXTS.campfireLit(hours) : TEXTS.campfireOut,
    button: TEXTS.rekindleButton,
    isActionEnabled: warning === undefined,
    warning,
    sleep: sleepButton(campfire, isInReach),
  };
}

/**
 * Bouton « Dormir » : le feu éteint, l'heure, puis la distance, dans cet ordre.
 * @param {import('../../core/commands/campfire.js').CampfireInspection} campfire
 * @param {boolean} isInReach
 * @returns {{ button: string, isEnabled: boolean, warning?: string }}
 */
function sleepButton(campfire, isInReach) {
  let warning;
  if (!campfire.isLit) {
    warning = TEXTS.fireOut;
  } else if (!campfire.isBedtime) {
    warning = TEXTS.tooEarlyToSleep;
  } else if (!isInReach) {
    warning = TEXTS.tooFar;
  }
  return warning === undefined
    ? { button: TEXTS.sleepButton, isEnabled: true }
    : { button: TEXTS.sleepButton, isEnabled: false, warning };
}
