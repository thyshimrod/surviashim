// @ts-check
import { NPCS } from '../../../data/npcs.js';
import { endDialogue, nextPage } from '../../core/commands/commands.js';
import { TEXTS } from '../i18n/fr.js';
import { CONTENT_TEXTS } from '../i18n/frContent.js';

/** @typedef {import('../../core/state/GameState.js').Dialogue} Dialogue */
/** @typedef {import('../../core/commands/commands.js').Command} Command */

/**
 * Contenu de la boîte de dialogue (R-IHM-DIA-001).
 * @typedef {object} DialogueView
 * @property {string} speaker Nom du PNJ.
 * @property {string} text Texte de la page en cours.
 * @property {string | undefined} more Indicateur « ▼ » s'il reste des pages.
 */

const NEXT_KEYS = Object.freeze([' ', 'Enter']);
const END_KEY = 'Escape';

/**
 * R-IHM-DIA-001 : ce qu'affiche la boîte de dialogue.
 * @param {Dialogue | undefined} dialogue Dialogue en cours.
 * @returns {DialogueView | undefined} `undefined` sans dialogue.
 */
export function dialogueView(dialogue) {
  if (dialogue === undefined) {
    return undefined;
  }
  const pages = dialogue.pages ?? (NPCS[dialogue.npcId]?.pages ?? []).map((page) => page.id);
  const pageId = pages[dialogue.page] ?? '';
  return {
    speaker: CONTENT_TEXTS.npcNames[dialogue.npcId]?.full ?? dialogue.npcId,
    text: CONTENT_TEXTS.pages[pageId] ?? pageId,
    more: dialogue.page + 1 < pages.length ? TEXTS.dialogueMore : undefined,
  };
}

/**
 * R-IHM-DIA-001 : commande déclenchée par une touche pendant un dialogue.
 * @param {string} key Valeur de `KeyboardEvent.key`.
 * @returns {Command | undefined} Page suivante (Espace, Entrée), fin (Échap), ou rien.
 */
export function dialogueCommandForKey(key) {
  if (NEXT_KEYS.includes(key)) {
    return nextPage();
  }
  return key === END_KEY ? endDialogue() : undefined;
}
