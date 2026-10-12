// @ts-check
import { RESOURCES } from '../../../data/resources.js';
import { TEXTS } from '../i18n/fr.js';
import { CONTENT_TEXTS } from '../i18n/frContent.js';
import { resourceNoun } from './InspectionController.js';

/**
 * R-IHM-NOT-002 : notifications d'une fouille : un livre par notification, puis un objet par
 * notification, puis les matériaux dans l'ordre de l'inventaire, ou « Rien d'intéressant. ».
 * @param {{ books: ReadonlyArray<string>, items?: ReadonlyArray<string>,
 *   resources: Readonly<Record<string, number>> }} findings
 * @returns {string[]}
 */
export function findingsMessages({ books, items = [], resources }) {
  const messages = [
    ...books.map((book) => TEXTS.bookFound(CONTENT_TEXTS.books[book]?.title ?? book)),
    ...items.map((item) => TEXTS.itemFound(TEXTS.itemNames[item]?.title ?? item)),
  ];
  const materials = Object.keys(RESOURCES)
    .filter((resource) => (resources[resource] ?? 0) > 0)
    .map((resource) => `${resources[resource]} ${resourceNoun(resource, resources[resource])}`);
  if (materials.length > 0) {
    messages.push(TEXTS.materialsFound(materials.join(', ')));
  }
  return messages.length > 0 ? messages : [TEXTS.nothingFound];
}
