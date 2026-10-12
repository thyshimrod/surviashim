// @ts-check
import { BOOKS } from '../../../data/books.js';
import { ITEMS } from '../../../data/items.js';
import { GAME_PARAMETERS } from '../../../data/gameParameters.js';
import { PLACEABLES } from '../../../data/placeables.js';
import { RESOURCES } from '../../../data/resources.js';
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
 * @property {Array<InventoryEntry & { eat?: { button: string, isEnabled: boolean } }>} resources
 *   Dans l'ordre du bandeau ; la nourriture a un bouton « Manger ».
 * @property {NamedItem[]} tools Dans l'ordre d'obtention.
 * @property {string | undefined} noTool Message si aucun outil.
 * @property {Array<NamedItem & { title: string }>} books Dans l'ordre de la bibliothèque.
 * @property {string | undefined} noBook Message si aucun livre.
 * @property {NamedItem[]} items Objets possédés, dans l'ordre.
 * @property {Array<NamedItem & { label: string, count: number, button: string }>} placeables
 *   Objets à poser, avec leur quantité (« Feu de camp ×2 »).
 * @property {string | undefined} noItem Message s'il n'y a ni objet ni objet à poser.
 * @property {string} readButton Libellé du bouton de lecture.
 */

/**
 * Ce que la fenêtre lit de l'état du jeu.
 * @typedef {object} InventorySource
 * @property {Readonly<Record<string, number>>} inventory
 * @property {readonly string[]} tools
 * @property {readonly string[]} books
 * @property {readonly string[]} items
 * @property {number} [hunger] Faim (100 si absente).
 * @property {Readonly<Record<string, number>>} placeables
 */

/**
 * @param {InventorySource} state
 * @returns {InventoryContent}
 */
export function inventoryView({ inventory, tools, books, items, placeables, hunger = 100 }) {
  const toPlace = placeableEntries(placeables);
  return {
    resources: inventoryEntries(inventory).map((entry) =>
      RESOURCES[entry.id]?.food === undefined
        ? entry
        : {
            ...entry,
            eat: {
              button: TEXTS.eatButton,
              isEnabled: (entry.amount ?? 0) > 0 && hunger < GAME_PARAMETERS.HUNGER_MAX,
            },
          },
    ),
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
    placeables: toPlace,
    noItem: items.length === 0 && toPlace.length === 0 ? TEXTS.itemsEmpty : undefined,
    readButton: TEXTS.readButton,
  };
}

/**
 * Objets à poser possédés, dans l'ordre de data/placeables.js.
 * @param {Readonly<Record<string, number>>} placeables
 * @returns {InventoryContent['placeables']}
 */
function placeableEntries(placeables) {
  return Object.values(PLACEABLES)
    .filter(({ id }) => (placeables[id] ?? 0) > 0)
    .map(({ id, icon }) => {
      const plan = CONTENT_TEXTS.plans[id] ?? id;
      const name = plan.charAt(0).toUpperCase() + plan.slice(1);
      const count = placeables[id];
      return {
        id,
        name,
        icon,
        count,
        label: TEXTS.placeableCount(name, count),
        button: TEXTS.placeButton,
      };
    });
}
