// @ts-check
import { BOOKS } from '../../../data/books.js';
import { TEXTS } from '../i18n/fr.js';
import { CONTENT_TEXTS } from '../i18n/frContent.js';

/**
 * Contenu de la fenêtre de lecture (R-IHM-LIV-001).
 * @typedef {object} BookContent
 * @property {string} title
 * @property {string} text
 * @property {string} recipes « Recettes : hache en silex, pioche en silex ».
 * @property {string} icon Icône (clé de ICONS).
 */

/**
 * @param {string} bookId
 * @returns {BookContent}
 */
export function bookView(bookId) {
  const texts = CONTENT_TEXTS.books[bookId];
  const plans = (BOOKS[bookId]?.plans ?? []).map((plan) => CONTENT_TEXTS.plans[plan] ?? plan);
  return {
    title: texts?.title ?? bookId,
    text: texts?.text ?? '',
    recipes: TEXTS.recipesLabel(plans.join(', ')),
    icon: BOOKS[bookId]?.icon ?? 'book-red',
  };
}
