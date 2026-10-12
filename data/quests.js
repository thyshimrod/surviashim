// @ts-check

/**
 * Quêtes confiées par les PNJ (concept C-VIL-09, spécification B.9). La page qui confie la quête
 * et la page « après la quête » sont marquées dans data/npcs.js ; titres, descriptions et textes
 * sont dans src/presentation/i18n/frContent.js.
 */

/**
 * @typedef {object} QuestDefinition
 * @property {string} id Identifiant unique, kebab-case.
 * @property {string} giver PNJ qui confie la quête et reçoit l'objet (clé de data/npcs.js).
 * @property {string} item Objet à rapporter (clé de data/items.js).
 * @property {number} experience Récompense (R-JOU-EXP-001).
 * @property {readonly string[]} thanks Pages du dialogue de remerciement (R-PNJ-QUE-002).
 */

/** @type {Readonly<Record<string, Readonly<QuestDefinition>>>} */
export const QUESTS = Object.freeze({
  'blue-doll': Object.freeze({
    id: 'blue-doll',
    giver: 'maelle',
    item: 'blue-doll',
    experience: 50,
    thanks: Object.freeze(['maelle-thanks']),
  }),
});
