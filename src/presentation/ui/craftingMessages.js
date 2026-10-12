// @ts-check
import { TEXTS } from '../i18n/fr.js';
import { CONTENT_TEXTS } from '../i18n/frContent.js';

/**
 * R-IHM-LIV-001 : une notification par recette nouvellement apprise.
 * @param {readonly string[]} recipes Plans appris par la lecture.
 * @returns {string[]}
 */
export function learnedMessages(recipes) {
  return recipes.map((recipe) => TEXTS.recipeLearned(CONTENT_TEXTS.plans[recipe] ?? recipe));
}

/**
 * R-IHM-ART-001 : notification d'une fabrication.
 * @param {string} recipeId Recette fabriquée (son nom est celui du plan).
 * @returns {string}
 */
export function craftedMessage(recipeId) {
  return TEXTS.crafted(CONTENT_TEXTS.plans[recipeId] ?? recipeId);
}
