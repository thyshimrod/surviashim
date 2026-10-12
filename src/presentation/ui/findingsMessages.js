// @ts-check
import { RESOURCES } from '../../../data/resources.js';
import { TEXTS } from '../i18n/fr.js';
import { CONTENT_TEXTS } from '../i18n/frContent.js';
import { resourceNoun } from './InspectionController.js';

/**
 * R-IHM-NOT-002 : une seule notification par fouille : les livres, puis les objets, puis les
 * matériaux dans l'ordre de l'inventaire ; ou « Rien d'intéressant. ».
 * @param {{ books: ReadonlyArray<string>, items?: ReadonlyArray<string>,
 *   resources: Readonly<Record<string, number>> }} findings
 * @returns {string[]}
 */
export function findingsMessages({ books, items = [], resources }) {
  const found = [
    ...books.map((book) => TEXTS.bookLabel(CONTENT_TEXTS.books[book]?.title ?? book)),
    ...items.map((item) => TEXTS.itemNames[item]?.inline ?? item),
    ...Object.keys(RESOURCES)
      .filter((resource) => (resources[resource] ?? 0) > 0)
      .map((resource) => `${resources[resource]} ${resourceNoun(resource, resources[resource])}`),
  ];
  return [found.length > 0 ? TEXTS.materialsFound(found.join(', ')) : TEXTS.nothingFound];
}
