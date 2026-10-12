// @ts-check
import { BOOKS } from '../../../data/books.js';
import { ITEMS } from '../../../data/items.js';
import { GAME_PARAMETERS } from '../../../data/gameParameters.js';
import { PLACEABLES } from '../../../data/placeables.js';
import { RESOURCES } from '../../../data/resources.js';
import { litFireInReach } from '../../core/commands/campfire.js';
import { SAGE_SMOKE } from '../../core/commands/sage.js';
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

/** @typedef {'resources' | 'tools' | 'items' | 'books'} InventoryTab */

/** @type {readonly InventoryTab[]} Onglets de l'inventaire, dans l'ordre (R-IHM-INV-001). */
const TABS = Object.freeze(['resources', 'tools', 'items', 'books']);

/**
 * Contenu de la fenêtre d'inventaire (R-IHM-INV-001).
 * @typedef {object} InventoryContent
 * @property {InventoryTab} tab Onglet affiché.
 * @property {Array<{ id: InventoryTab, label: string, isActive: boolean }>} tabs
 * @property {Array<InventoryEntry & { eat?: ResourceAction, use?: ResourceAction }>} resources
 *   Dans l'ordre du bandeau ; la nourriture a un bouton « Manger ».
 * @property {NamedItem[]} tools Dans l'ordre d'obtention.
 * @property {string | undefined} noTool Message si aucun outil.
 * @property {Array<NamedItem & { title: string }>} books Livres pas encore lus, dans l'ordre.
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
 * @property {readonly string[]} [readBooks] Livres lus : ils sont aux archives (R-IHM-JRN-004).
 * @property {readonly string[]} [researched] Plans recherchés (la fumée de sauge).
 * @property {readonly string[]} items
 * @property {number} [hunger] Faim (100 si absente).
 * @property {Readonly<Record<string, number>>} placeables
 */

/**
 * Bouton d'une ressource : « Manger » ou « Brûler ».
 * @typedef {{ button: string, isEnabled: boolean }} ResourceAction
 */

/**
 * @param {InventorySource} state
 * @param {import('../../core/state/GameState.js').GameRules} [rules] Pour savoir si un feu est à
 *   portée (« Brûler » la sauge).
 * @param {InventoryTab} [tab] Onglet affiché.
 * @returns {InventoryContent}
 */
export function inventoryView(state, rules, tab = 'resources') {
  const { inventory, tools, items, placeables, hunger = 100, readBooks = [] } = state;
  const books = state.books.filter((id) => !readBooks.includes(id));
  const toPlace = placeableEntries(placeables);
  const canBurn = canBurnSage(state, rules);
  return {
    tab,
    tabs: TABS.map((id) => ({ id, label: TAB_LABELS[id], isActive: id === tab })),
    resources: inventoryEntries(inventory).map((entry) => withAction(entry, { hunger, canBurn })),
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
 * « Brûler » est possible : la fumée de sauge recherchée et un feu allumé à portée.
 * @param {InventorySource} state
 * @param {import('../../core/state/GameState.js').GameRules} [rules]
 * @returns {boolean}
 */
function canBurnSage(state, rules) {
  return (
    (state.researched ?? []).includes(SAGE_SMOKE) &&
    rules !== undefined &&
    litFireInReach(
      /** @type {import('../../core/state/GameState.js').GameState} */ (state),
      rules,
    ) !== undefined
  );
}

/** Libellés des onglets. */
const TAB_LABELS = Object.freeze({
  resources: TEXTS.resourcesTitle,
  tools: TEXTS.toolsTitle,
  items: TEXTS.itemsTitle,
  books: TEXTS.booksTitle,
});

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

/**
 * R-IHM-INV-001 : la nourriture se mange, la sauge se brûle.
 * @param {InventoryEntry} entry
 * @param {{ hunger: number, canBurn: boolean }} context
 * @returns {InventoryEntry & { eat?: ResourceAction, use?: ResourceAction }}
 */
function withAction(entry, { hunger, canBurn }) {
  const hasSome = (entry.amount ?? 0) > 0;
  if (entry.id === 'sage') {
    return { ...entry, use: { button: TEXTS.burnButton, isEnabled: hasSome && canBurn } };
  }
  if (RESOURCES[entry.id]?.food === undefined) {
    return entry;
  }
  return {
    ...entry,
    eat: { button: TEXTS.eatButton, isEnabled: hasSome && hunger < GAME_PARAMETERS.HUNGER_MAX },
  };
}
