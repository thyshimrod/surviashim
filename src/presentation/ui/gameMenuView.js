// @ts-check
import { TEXTS } from '../i18n/fr.js';

/**
 * Contenu de la fenêtre « Partie » (R-IHM-SAU-001).
 * @typedef {object} GameMenuContent
 * @property {string} status Où en est la sauvegarde.
 * @property {string | undefined} question Confirmation demandée, s'il y en a une.
 * @property {string[]} buttons Libellés des boutons, dans l'ordre.
 */

/**
 * @param {{ savedDay: number | undefined, confirming: boolean }} params
 * @returns {GameMenuContent}
 */
export function gameMenuView({ savedDay, confirming }) {
  return {
    status: savedDay === undefined ? TEXTS.notSavedYet : TEXTS.savedOn(savedDay),
    question: confirming ? TEXTS.newGameQuestion : undefined,
    buttons: confirming ? [TEXTS.restartButton, TEXTS.cancelButton] : [TEXTS.newGameButton],
  };
}
