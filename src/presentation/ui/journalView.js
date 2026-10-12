// @ts-check
import { BOOKS } from '../../../data/books.js';
import { TEXTS } from '../i18n/fr.js';
import { CONTENT_TEXTS } from '../i18n/frContent.js';
import { questTitle } from './questMessages.js';

/** @typedef {import('../../core/state/GameState.js').JournalEntry} JournalEntry */
/** @typedef {import('../../core/state/GameState.js').QuestEntry} QuestEntry */

/**
 * Quête affichée au journal (R-IHM-JRN-003).
 * @typedef {object} JournalQuest
 * @property {string} id
 * @property {string} heading « La poupée de Maëlle — En cours ».
 * @property {string} description
 */

/**
 * Ligne affichée du journal (R-IHM-JRN-001).
 * @typedef {object} JournalLine
 * @property {string} place Nom du lieu.
 * @property {string} status « Découvert » ou « Indice d'Aldric ».
 * @property {string | undefined} hint Texte de l'indice, s'il y en a un.
 */

/**
 * Livre affiché au journal (R-IHM-JRN-002).
 * @typedef {object} JournalBook
 * @property {string} id
 * @property {string} title
 * @property {string} text
 * @property {string} plans « Plans : hache en silex, pioche en silex ».
 * @property {string} icon Icône (clé de ICONS).
 */

/**
 * Contenu du journal.
 * @typedef {object} JournalContent
 * @property {JournalLine[]} lines Lieux, dans l'ordre d'arrivée.
 * @property {string | undefined} empty Message si aucun lieu.
 * @property {JournalBook[]} books Livres, dans l'ordre où ils ont été trouvés.
 * @property {string | undefined} noBook Message si aucun livre.
 * @property {JournalQuest[]} quests Quêtes reçues, dans l'ordre.
 * @property {string | undefined} noQuest Message si aucune quête.
 */

/**
 * @param {readonly JournalEntry[]} journal
 * @param {readonly string[]} [books] Livres trouvés (identifiants).
 * @param {readonly QuestEntry[]} [quests] Quêtes reçues.
 * @returns {JournalContent}
 */
export function journalView(journal, books = [], quests = []) {
  return {
    lines: journal.map(toLine),
    empty: journal.length === 0 ? TEXTS.journalEmpty : undefined,
    books: books.map(toBook),
    noBook: books.length === 0 ? TEXTS.booksEmpty : undefined,
    quests: quests.map(({ questId, status }) => ({
      id: questId,
      heading: `${questTitle(questId)} — ${TEXTS.questStatus[status]}`,
      description: CONTENT_TEXTS.quests[questId]?.description ?? '',
    })),
    noQuest: quests.length === 0 ? TEXTS.questsEmpty : undefined,
  };
}

/**
 * @param {JournalEntry} entry
 * @returns {JournalLine}
 */
function toLine(entry) {
  const place = CONTENT_TEXTS.placeNames[entry.placeId] ?? entry.placeId;
  const hint =
    entry.hint === undefined
      ? undefined
      : TEXTS.journalHint(CONTENT_TEXTS.pages[entry.hint.pageId] ?? entry.hint.pageId);
  if (entry.status === 'discovered') {
    return { place, status: TEXTS.journalDiscovered, hint };
  }
  const name = CONTENT_TEXTS.npcNames[entry.hint?.npcId]?.short ?? entry.hint?.npcId ?? '';
  return { place, status: TEXTS.journalHintFrom(name), hint };
}

/**
 * @param {string} id
 * @returns {JournalBook}
 */
function toBook(id) {
  const texts = CONTENT_TEXTS.books[id];
  const plans = (BOOKS[id]?.plans ?? []).map((plan) => CONTENT_TEXTS.plans[plan] ?? plan);
  return {
    id,
    title: texts?.title ?? id,
    text: texts?.text ?? '',
    plans: TEXTS.plansLabel(plans.join(', ')),
    icon: BOOKS[id]?.icon ?? 'book-red',
  };
}
