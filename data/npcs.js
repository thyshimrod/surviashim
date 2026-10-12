// @ts-check

/**
 * Personnages non joueurs (R-PNJ-POS-001, spécification B.6). Les noms et les textes des pages
 * sont dans src/presentation/i18n/frContent.js, sous l'identifiant de chaque page.
 */

/**
 * @typedef {object} DialoguePage
 * @property {string} id Identifiant de la page (clé du texte).
 * @property {string} [reveals] Lieu dont la page donne un indice (R-PNJ-DIA-004).
 * @property {string} [startsQuest] Quête que la page confie (R-PNJ-QUE-001) ; la page n'est
 *   plus dite une fois la quête terminée (R-PNJ-QUE-003).
 * @property {string} [afterQuest] La page n'est dite qu'une fois cette quête terminée
 *   (R-PNJ-QUE-003).
 */

/**
 * @typedef {object} NpcDefinition
 * @property {string} id Identifiant unique, kebab-case.
 * @property {string} sheet Feuille de sprites (clé de CHARACTER_SHEETS, data/sprites.js).
 * @property {Readonly<{ column: number, row: number }>} tile Tuile où se tient le PNJ.
 * @property {'up' | 'down' | 'left' | 'right'} facing Orientation au repos.
 * @property {readonly Readonly<DialoguePage>[]} pages Dialogue, au moins une page.
 * @property {readonly Readonly<{ column: number, row: number }>[]} route Promenade : tuiles à
 *   visiter, en décalage par rapport à `tile` ; le PNJ repasse chez lui entre deux (R-PNJ-POS-003).
 */

/** @type {Readonly<Record<string, Readonly<NpcDefinition>>>} */
export const NPCS = Object.freeze({
  aldric: Object.freeze({
    id: 'aldric',
    sheet: 'vx-03e-0',
    tile: Object.freeze({ column: 38, row: 90 }),
    facing: 'down',
    route: Object.freeze([Object.freeze({ column: 2, row: 0 })]),
    pages: Object.freeze([
      Object.freeze({ id: 'aldric-1' }),
      Object.freeze({ id: 'aldric-2', reveals: 'watchtower-ruins' }),
      Object.freeze({ id: 'aldric-3' }),
    ]),
  }),
  elwyn: Object.freeze({
    id: 'elwyn',
    sheet: 'vx-03e-5',
    tile: Object.freeze({ column: 84, row: 78 }),
    facing: 'up',
    route: Object.freeze([Object.freeze({ column: -2, row: 0 })]),
    pages: Object.freeze([
      Object.freeze({ id: 'elwyn-1' }),
      Object.freeze({ id: 'elwyn-2', reveals: 'sunken-chapel' }),
    ]),
  }),
  maelle: Object.freeze({
    id: 'maelle',
    sheet: 'vx-03a-3',
    tile: Object.freeze({ column: 100, row: 88 }),
    facing: 'left',
    route: Object.freeze([Object.freeze({ column: 0, row: -2 })]),
    pages: Object.freeze([
      Object.freeze({ id: 'maelle-1' }),
      Object.freeze({ id: 'maelle-2', reveals: 'abandoned-hamlet' }),
      Object.freeze({ id: 'maelle-3', startsQuest: 'blue-doll' }),
      Object.freeze({ id: 'maelle-4', afterQuest: 'blue-doll' }),
    ]),
  }),
});
