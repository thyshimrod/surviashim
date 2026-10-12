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
  };
}
