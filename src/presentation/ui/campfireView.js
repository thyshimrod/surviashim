// @ts-check
import { TEXTS } from '../i18n/fr.js';

/** @typedef {import('../../core/commands/harvest.js').TileInspection} TileInspection */
/** @typedef {import('./InspectionController.js').InspectionView} InspectionView */

const MINUTES_PER_HOUR = 60;

/**
 * R-IHM-INS-008 : fenêtre d'information d'un feu de camp. De loin, les boutons restent actifs :
 * le héros s'approchera (R-JOU-DEP-005).
 * @param {TileInspection & { campfire: import('../../core/commands/campfire.js').CampfireInspection }} inspection
 * @returns {InspectionView}
 */
export function campfireView({ campfire }) {
  if (campfire.isHearth) {
    // R-IHM-INS-009 : le Foyer ne se ravive pas ; son bouton fait dormir.
    const sleep = sleepButton(campfire);
    return {
      title: TEXTS.tileNames.hearth,
      action: TEXTS.hearthDescription,
      button: sleep.button,
      isActionEnabled: sleep.isEnabled,
      warning: sleep.warning,
    };
  }
  const hours = Math.ceil(campfire.minutesLeft / MINUTES_PER_HOUR);
  const warning = campfire.hasFuel ? undefined : TEXTS.woodNeeded;
  return {
    title: TEXTS.tileNames.campfire,
    action: campfire.isLit ? TEXTS.campfireLit(hours) : TEXTS.campfireOut,
    button: TEXTS.rekindleButton,
    isActionEnabled: warning === undefined,
    warning,
    sleep: sleepButton(campfire),
  };
}

/**
 * Bouton « Dormir » : le feu éteint, puis l'heure.
 * @param {import('../../core/commands/campfire.js').CampfireInspection} campfire
 * @returns {{ button: string, isEnabled: boolean, warning?: string }}
 */
function sleepButton(campfire) {
  let warning;
  if (!campfire.isLit) {
    warning = TEXTS.fireOut;
  } else if (!campfire.isBedtime) {
    warning = TEXTS.tooEarlyToSleep;
  }
  return warning === undefined
    ? { button: TEXTS.sleepButton, isEnabled: true }
    : { button: TEXTS.sleepButton, isEnabled: false, warning };
}
