// @ts-check
import { GAME_EVENTS } from '../../core/events/gameEvents.js';
import { TEXTS } from '../i18n/fr.js';
import { CONTENT_TEXTS } from '../i18n/frContent.js';
import { craftedMessage, learnedMessages } from './craftingMessages.js';
import { findingsMessages } from './findingsMessages.js';
import { questCompletedMessages, questStartedMessage } from './questMessages.js';

/**
 * Notification à afficher.
 * @typedef {object} NotificationSpec
 * @property {string} text
 * @property {boolean} sticky `true` : reste jusqu'à ce qu'on la ferme (quêtes, R-IHM-NOT-003).
 */

/**
 * @param {string} id
 * @returns {string}
 */
const placeName = (id) => CONTENT_TEXTS.placeNames[id] ?? id;

/**
 * @param {string[]} texts
 * @returns {NotificationSpec[]}
 */
const brief = (texts) => texts.map((text) => ({ text, sticky: false }));

/**
 * @param {string[]} texts
 * @returns {NotificationSpec[]}
 */
const sticky = (texts) => texts.map((text) => ({ text, sticky: true }));

/**
 * Données des événements notifiés (catalogue : src/core/events/gameEvents.js).
 * @typedef {object} EventPayload
 * @property {string} [placeId]
 * @property {number} [level]
 * @property {string} [questId]
 * @property {number} [experience]
 * @property {string[]} [recipes]
 * @property {string} [recipeId]
 * @property {string[]} [books]
 * @property {string[]} [items]
 * @property {Record<string, number>} [resources]
 */

/**
 * Notifications de chaque événement du jeu.
 * @type {Readonly<Record<string, (payload: EventPayload) => NotificationSpec[]>>}
 */
const BY_EVENT = Object.freeze({
  // R-IHM-NOT-001
  [GAME_EVENTS.PLACE_DISCOVERED]: ({ placeId = '' }) =>
    brief([TEXTS.placeDiscovered(placeName(placeId))]),
  [GAME_EVENTS.PLACE_ENTERED]: ({ placeId = '' }) => brief([placeName(placeId)]),
  [GAME_EVENTS.PLACE_RUMORED]: ({ placeId = '' }) =>
    brief([TEXTS.placeRumored(placeName(placeId))]),
  // R-IHM-NOT-002
  [GAME_EVENTS.ITEMS_FOUND]: ({ books = [], items = [], resources = {} }) =>
    brief(findingsMessages({ books, items, resources })),
  // R-IHM-LIV-001, R-IHM-ART-001
  [GAME_EVENTS.BOOK_READ]: ({ recipes = [] }) => brief(learnedMessages(recipes)),
  [GAME_EVENTS.ITEM_CRAFTED]: ({ recipeId = '' }) => brief([craftedMessage(recipeId)]),
  [GAME_EVENTS.SLEPT]: () => brief([TEXTS.sleptMessage]),
  // R-IHM-NOT-005
  [GAME_EVENTS.BLIGHT_ENTERED]: () => brief([TEXTS.blightEntered]),
  [GAME_EVENTS.PURIFIED]: () => brief([TEXTS.purified]),
  // R-IHM-NOT-004, R-IHM-REC-001
  [GAME_EVENTS.LEVEL_UP]: ({ level = 0 }) => sticky([TEXTS.levelUp(level)]),
  [GAME_EVENTS.RESEARCHED]: ({ recipes = [] }) => brief(learnedMessages(recipes)),
  [GAME_EVENTS.FAINTED]: () => sticky([TEXTS.faintedMessage]),
  // R-IHM-NOT-003
  [GAME_EVENTS.QUEST_STARTED]: ({ questId = '' }) => sticky([questStartedMessage(questId)]),
  [GAME_EVENTS.QUEST_COMPLETED]: ({ questId = '', experience = 0 }) =>
    sticky(questCompletedMessages(questId, experience)),
});

/** Événements qui donnent lieu à une notification. */
export const NOTIFIED_EVENTS = Object.freeze(Object.keys(BY_EVENT));

/**
 * @param {string} eventName Clé de GAME_EVENTS.
 * @param {EventPayload} payload Données de l'événement.
 * @returns {NotificationSpec[]}
 */
export function notificationsFor(eventName, payload) {
  return BY_EVENT[eventName]?.(payload) ?? [];
}
