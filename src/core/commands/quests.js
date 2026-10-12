// @ts-check
import { GAME_EVENTS } from '../events/gameEvents.js';
import { REJECTION_REASONS } from './commands.js';

/** @typedef {import('../state/GameState.js').GameState} GameState */
/** @typedef {import('../state/GameState.js').GameRules} GameRules */
/** @typedef {import('../events/EventBus.js').EventBus} EventBus */
/** @typedef {import('./commands.js').CommandResult} CommandResult */
/** @typedef {import('../../../data/npcs.js').DialoguePage} DialoguePage */

/**
 * @param {GameState} state
 * @param {string} questId
 * @returns {boolean} `true` si la quête est terminée.
 */
function isDone(state, questId) {
  return state.quests.some((quest) => quest.questId === questId && quest.status === 'done');
}

/**
 * R-PNJ-QUE-003 : pages que dit un PNJ, selon l'état de ses quêtes.
 * @param {GameState} state
 * @param {GameRules} rules
 * @param {string} npcId
 * @returns {string[]} Identifiants des pages, dans l'ordre.
 */
export function visiblePages(state, rules, npcId) {
  return (rules.npcs?.[npcId]?.pages ?? [])
    .filter((page) => page.startsQuest === undefined || !isDone(state, page.startsQuest))
    .filter((page) => page.afterQuest === undefined || isDone(state, page.afterQuest))
    .map((page) => page.id);
}

/**
 * R-PNJ-QUE-001 : si la page confie une quête jamais reçue, elle entre au journal « en cours ».
 * @param {GameState} state
 * @param {EventBus} events
 * @param {{ npcId: string, page: Readonly<DialoguePage> | undefined }} current
 */
export function startQuest(state, events, { npcId, page }) {
  const questId = page?.startsQuest;
  if (questId === undefined || state.quests.some((quest) => quest.questId === questId)) {
    return;
  }
  state.quests.push({ questId, status: 'active' });
  events.emit(GAME_EVENTS.QUEST_STARTED, { questId, npcId });
}

/**
 * Quête en cours de ce PNJ dont le joueur possède l'objet (R-PNJ-QUE-002).
 * @param {GameState} state
 * @param {GameRules} rules
 * @param {string} npcId
 * @returns {Readonly<import('../../../data/quests.js').QuestDefinition> | undefined}
 */
export function giveableQuest(state, rules, npcId) {
  return state.quests
    .filter((quest) => quest.status === 'active')
    .map((quest) => rules.quests?.[quest.questId])
    .find((quest) => quest?.giver === npcId && state.items.includes(quest.item));
}

/**
 * R-PNJ-QUE-002 : donne l'objet, termine la quête, ajoute l'expérience et commence le
 * remerciement. Les premiers motifs de refus sont ceux de la parole (R-PNJ-DIA-001).
 * @param {GameState} state
 * @param {GameRules} rules
 * @param {EventBus} events
 * @param {{ npcId: string, refusal: CommandResult | undefined }} request `refusal` : motif de
 *   refus de la parole, s'il y en a un.
 * @returns {CommandResult}
 */
export function give(state, rules, events, { npcId, refusal }) {
  if (refusal !== undefined) {
    return refusal;
  }
  const quest = giveableQuest(state, rules, npcId);
  if (quest === undefined) {
    return { ok: false, reason: REJECTION_REASONS.NOTHING_TO_GIVE };
  }
  state.items = state.items.filter((item) => item !== quest.item);
  const entry = state.quests.find(({ questId }) => questId === quest.id);
  if (entry !== undefined) {
    entry.status = 'done';
  }
  state.experience += quest.experience; // R-JOU-EXP-001
  state.dialogue = { npcId, page: 0, pages: [...quest.thanks] };
  events.emit(GAME_EVENTS.QUEST_COMPLETED, {
    questId: quest.id,
    npcId,
    experience: quest.experience,
  });
  events.emit(GAME_EVENTS.DIALOGUE_STARTED, { npcId });
  return { ok: true };
}
