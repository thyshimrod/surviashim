// @ts-check
import { TEXTS } from '../i18n/fr.js';
import { CONTENT_TEXTS } from '../i18n/frContent.js';

/**
 * @param {string} questId
 * @returns {string} Titre de la quête.
 */
export function questTitle(questId) {
  return CONTENT_TEXTS.quests[questId]?.title ?? questId;
}

/**
 * R-IHM-NOT-003 : notification d'une quête reçue.
 * @param {string} questId
 * @returns {string}
 */
export function questStartedMessage(questId) {
  return TEXTS.questStarted(questTitle(questId));
}

/**
 * R-IHM-NOT-003 : notifications d'une quête terminée, puis de l'expérience gagnée.
 * @param {string} questId
 * @param {number} experience
 * @returns {string[]}
 */
export function questCompletedMessages(questId, experience) {
  return [TEXTS.questCompleted(questTitle(questId)), TEXTS.experienceGained(experience)];
}
