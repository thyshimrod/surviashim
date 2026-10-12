// @ts-check
import { FACINGS } from '../config/directions.js';
import { GAME_EVENTS } from '../events/gameEvents.js';
import { REJECTION_REASONS } from './commands.js';
import { giveableQuest, startQuest, visiblePages } from './quests.js';

/** @typedef {import('../state/GameState.js').GameState} GameState */
/** @typedef {import('../state/GameState.js').GameRules} GameRules */
/** @typedef {import('../state/GameState.js').Npc} Npc */
/** @typedef {import('../events/EventBus.js').EventBus} EventBus */
/** @typedef {import('./commands.js').CommandResult} CommandResult */

/**
 * Ce que la fenêtre d'information doit savoir d'un PNJ (R-IHM-INS-005).
 * @typedef {object} NpcInspection
 * @property {boolean} exists
 * @property {boolean} isInReach `true` si le PNJ est à portée de parole (R-PNJ-DIA-001).
 * @property {string | undefined} giveableItem Objet que le joueur peut lui donner
 *   (R-PNJ-QUE-002).
 */

/**
 * @param {GameState} state
 * @param {string} npcId
 * @returns {Npc | undefined}
 */
function findNpc(state, npcId) {
  return state.npcs.find((npc) => npc.id === npcId);
}

/**
 * Décrit un PNJ sans rien modifier.
 * @param {GameState} state
 * @param {GameRules} rules
 * @param {string} npcId
 * @returns {NpcInspection}
 */
export function inspectNpc(state, rules, npcId) {
  const npc = findNpc(state, npcId);
  if (npc === undefined) {
    return { exists: false, isInReach: false, giveableItem: undefined };
  }
  const { x, y } = state.player.position;
  const distance = Math.hypot(npc.position.x - x, npc.position.y - y);
  return {
    exists: true,
    isInReach: distance <= (rules.talkReach ?? 0),
    giveableItem: giveableQuest(state, rules, npcId)?.item,
  };
}

/**
 * Motif de refus d'une parole (R-PNJ-DIA-001), dans l'ordre ; aussi utilisé pour donner
 * (R-PNJ-QUE-002).
 * @param {GameState} state
 * @param {GameRules} rules
 * @param {string} npcId
 * @returns {CommandResult | undefined} `undefined` si le PNJ peut être abordé.
 */
export function talkRefusal(state, rules, npcId) {
  const npc = findNpc(state, npcId);
  if (npc === undefined || rules.npcs?.[npcId] === undefined) {
    return { ok: false, reason: REJECTION_REASONS.NOBODY_TO_TALK_TO };
  }
  if (state.dialogue !== undefined) {
    return { ok: false, reason: REJECTION_REASONS.ALREADY_TALKING };
  }
  if (!inspectNpc(state, rules, npcId).isInReach) {
    return { ok: false, reason: REJECTION_REASONS.OUT_OF_REACH };
  }
  return undefined;
}

/**
 * R-PNJ-DIA-001 : commence un dialogue, le PNJ se tourne vers le joueur. Les pages dites sont
 * fixées au début (R-PNJ-QUE-003).
 * @param {GameState} state
 * @param {GameRules} rules
 * @param {EventBus} events
 * @param {string} npcId
 * @returns {CommandResult}
 */
export function talk(state, rules, events, npcId) {
  const refusal = talkRefusal(state, rules, npcId);
  if (refusal !== undefined) {
    return refusal;
  }
  const npc = /** @type {Npc} */ (findNpc(state, npcId));
  npc.facing = facingToward(npc.position, state.player.position);
  state.dialogue = { npcId, page: 0, pages: visiblePages(state, rules, npcId) };
  events.emit(GAME_EVENTS.DIALOGUE_STARTED, { npcId });
  showPage(state, rules, events);
  return { ok: true };
}

/**
 * R-PNJ-DIA-002 : page suivante, ou fin du dialogue après la dernière page.
 * @param {GameState} state
 * @param {GameRules} rules
 * @param {EventBus} events
 * @returns {CommandResult}
 */
export function turnPage(state, rules, events) {
  const { dialogue } = state;
  if (dialogue === undefined) {
    return { ok: false, reason: REJECTION_REASONS.NO_DIALOGUE };
  }
  if (dialogue.page + 1 >= pagesOf(dialogue, rules).length) {
    return finishDialogue(state, events);
  }
  dialogue.page += 1;
  showPage(state, rules, events);
  return { ok: true };
}

/**
 * R-PNJ-DIA-002 : termine le dialogue.
 * @param {GameState} state
 * @param {EventBus} events
 * @returns {CommandResult}
 */
export function finishDialogue(state, events) {
  if (state.dialogue === undefined) {
    return { ok: false, reason: REJECTION_REASONS.NO_DIALOGUE };
  }
  const { npcId } = state.dialogue;
  state.dialogue = undefined;
  events.emit(GAME_EVENTS.DIALOGUE_ENDED, { npcId });
  return { ok: true };
}

/**
 * Pages du dialogue en cours (identifiants).
 * @param {import('../state/GameState.js').Dialogue} dialogue
 * @param {GameRules} rules
 * @returns {readonly string[]}
 */
function pagesOf(dialogue, rules) {
  return dialogue.pages ?? (rules.npcs?.[dialogue.npcId]?.pages ?? []).map((page) => page.id);
}

/**
 * Une page devient la page en cours : indice (R-PNJ-DIA-004) et quête (R-PNJ-QUE-001).
 * @param {GameState} state
 * @param {GameRules} rules
 * @param {EventBus} events
 */
function showPage(state, rules, events) {
  const dialogue = /** @type {import('../state/GameState.js').Dialogue} */ (state.dialogue);
  const pageId = pagesOf(dialogue, rules)[dialogue.page];
  const page = rules.npcs?.[dialogue.npcId]?.pages.find(({ id }) => id === pageId);
  revealHint(state, events, { npcId: dialogue.npcId, page });
  startQuest(state, events, { npcId: dialogue.npcId, page });
}

/**
 * R-PNJ-DIA-004 : si la page en cours porte un indice sur un lieu absent du journal, il y entre.
 * @param {GameState} state
 * @param {EventBus} events
 * @param {{ npcId: string, page: Readonly<import('../../../data/npcs.js').DialoguePage> | undefined }} current
 */
function revealHint(state, events, { npcId, page: current }) {
  const placeId = current?.reveals;
  if (placeId === undefined || state.journal.some((entry) => entry.placeId === placeId)) {
    return;
  }
  state.journal.push({ placeId, status: 'rumored', hint: { npcId, pageId: current.id } });
  events.emit(GAME_EVENTS.PLACE_RUMORED, { placeId, npcId, pageId: current.id });
}

/**
 * Orientation vers une cible : selon l'axe où l'écart est le plus grand ; à égalité,
 * horizontalement (R-PNJ-DIA-001).
 * @param {{ x: number, y: number }} from
 * @param {{ x: number, y: number }} to
 * @returns {import('../config/directions.js').Facing}
 */
export function facingToward(from, to) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0 ? FACINGS.RIGHT : FACINGS.LEFT;
  }
  return dy > 0 ? FACINGS.DOWN : FACINGS.UP;
}
