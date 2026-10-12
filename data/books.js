// @ts-check

/**
 * Livres que l'on trouve en fouillant (concept C-TEC-06, spécification B.7). Titres, textes et
 * noms des plans sont dans src/presentation/i18n/frContent.js.
 */

/**
 * @typedef {object} BookDefinition
 * @property {string} id Identifiant unique, kebab-case.
 * @property {string} icon Icône (clé de ICONS, data/icons.js).
 * @property {'survival' | 'research'} kind Un livre de survie apprend ses plans à la lecture
 *   (C-TEC-07) ; un livre de recherche les découvre, à rechercher ensuite (C-TEC-08).
 * @property {readonly string[]} plans Plans décrits par le livre (identifiants), dans l'ordre où
 *   la lecture les apprend.
 */

/** @type {Readonly<Record<string, Readonly<BookDefinition>>>} */
export const BOOKS = Object.freeze({
  'flint-knapping': Object.freeze({
    id: 'flint-knapping',
    icon: 'tome-leather',
    kind: 'survival',
    plans: Object.freeze(['flint-axe', 'flint-pickaxe']),
  }),
  'watchman-notebook': Object.freeze({
    id: 'watchman-notebook',
    icon: 'book-brown',
    kind: 'survival',
    plans: Object.freeze(['campfire']),
  }),
  stonework: Object.freeze({
    id: 'stonework',
    icon: 'tome-gold',
    kind: 'research',
    plans: Object.freeze(['stone-axe', 'stone-pickaxe']),
  }),
  'forager-guide': Object.freeze({
    id: 'forager-guide',
    icon: 'book-green',
    kind: 'research',
    plans: Object.freeze(['gatherer-bag', 'grilled-mushroom']),
  }),
});
