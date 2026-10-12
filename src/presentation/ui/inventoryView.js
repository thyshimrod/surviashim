// @ts-check
import { BOOKS } from '../../../data/books.js';
import { ITEMS } from '../../../data/items.js';
import { TOOLS } from '../../../data/tools.js';
import { TEXTS } from '../i18n/fr.js';
import { CONTENT_TEXTS } from '../i18n/frContent.js';
import { inventoryEntries } from './inventoryEntries.js';

/** @typedef {import('./inventoryEntries.js').InventoryEntry} InventoryEntry */

/**
 * Objet affiché avec son icône (outil ou livre).
 * @typedef {object} NamedItem
 * @property {string} id
 * @property {string} name Nom de l'outil, ou titre du livre.
 * @property {string} icon Icône (clé de ICONS).
 */

/**
 * Contenu de la fenêtre d'inventaire (R-IHM-INV-001).
 * @typedef {object} InventoryContent
 * @property {InventoryEntry[]} resources Dans l'ordre du bandeau.
 * @property {NamedItem[]} tools Dans l'ordre d'obtention.
 * @property {string | undefined} noTool Message si aucun outil.
 * @property {Array<NamedItem & { title: string }>} books Dans l'ordre de la bibliothèque.
 * @property {string | undefined} noBook Message si aucun livre.
 * @property {NamedItem[]} items Objets possédés, dans l'ordre.
 * @property {string | undefined} noItem Message si aucun objet.
 * @property {string} readButton Libellé du bouton de lecture.
 */

/**
 * Ce que la fenêtre lit de l'état du jeu.
 * @typedef {object} InventorySource
 * @property {Readonly<Record<string, number>>} inventory
 * @property {readonly string[]} tools
 * @property {readonly string[]} books
 * @property {readonly string[]} items
 */

/**
 * @param {InventorySource} state
 * @returns {InventoryContent}
 */
export function inventoryView({ inventory, tools, books, items }) {
  return {
    resources: inventoryEntries(inventory),
    tools: tools.map((id) => ({
      id,
      name: TEXTS.toolNames[id] ?? id,
      icon: TOOLS[id]?.icon ?? 'axe',
    })),
    noTool: tools.length === 0 ? TEXTS.toolsEmpty : undefined,
    books: books.map((id) => {
      const title = CONTENT_TEXTS.books[id]?.title ?? id;
      return { id, name: title, title, icon: BOOKS[id]?.icon ?? 'book-red' };
    }),
    noBook: books.length === 0 ? TEXTS.booksEmpty : undefined,
    items: items.map((id) => ({
      id,
      name: TEXTS.itemNames[id]?.title ?? id,
      icon: ITEMS[id]?.icon ?? 'gift',
    })),
    noItem: items.length === 0 ? TEXTS.itemsEmpty : undefined,
    readButton: TEXTS.readButton,
  };
}
