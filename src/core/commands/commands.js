// @ts-check

/** Types de commandes que le joueur peut envoyer au jeu (spécification B.5). */
export const COMMAND_TYPES = Object.freeze({
  SET_MOVE_INTENT: 'SET_MOVE_INTENT',
  HARVEST: 'HARVEST',
  SEARCH: 'SEARCH',
  TALK: 'TALK',
  NEXT_PAGE: 'NEXT_PAGE',
  END_DIALOGUE: 'END_DIALOGUE',
  READ_BOOK: 'READ_BOOK',
  CRAFT: 'CRAFT',
  GIVE: 'GIVE',
  PLACE: 'PLACE',
  REKINDLE: 'REKINDLE',
  EAT: 'EAT',
  SLEEP: 'SLEEP',
  RESEARCH: 'RESEARCH',
  BURN_SAGE: 'BURN_SAGE',
});

/** Motifs de refus d'une commande, dans l'ordre où ils sont vérifiés (spécification B.5). */
export const REJECTION_REASONS = Object.freeze({
  NOTHING_TO_HARVEST: 'NOTHING_TO_HARVEST',
  MISSING_TOOL: 'MISSING_TOOL',
  OUT_OF_REACH: 'OUT_OF_REACH',
  NOTHING_TO_SEARCH: 'NOTHING_TO_SEARCH',
  NOBODY_TO_TALK_TO: 'NOBODY_TO_TALK_TO',
  ALREADY_TALKING: 'ALREADY_TALKING',
  NO_DIALOGUE: 'NO_DIALOGUE',
  BOOK_NOT_OWNED: 'BOOK_NOT_OWNED',
  UNKNOWN_RECIPE: 'UNKNOWN_RECIPE',
  ALREADY_OWNED: 'ALREADY_OWNED',
  MISSING_INGREDIENTS: 'MISSING_INGREDIENTS',
  NOTHING_TO_GIVE: 'NOTHING_TO_GIVE',
  NOTHING_TO_PLACE: 'NOTHING_TO_PLACE',
  CANNOT_PLACE: 'CANNOT_PLACE',
  NOTHING_TO_REKINDLE: 'NOTHING_TO_REKINDLE',
  NOT_EDIBLE: 'NOT_EDIBLE',
  NOTHING_TO_EAT: 'NOTHING_TO_EAT',
  ALREADY_FULL: 'ALREADY_FULL',
  NOTHING_TO_SLEEP_BY: 'NOTHING_TO_SLEEP_BY',
  TOO_EARLY: 'TOO_EARLY',
  NEEDS_FIRE: 'NEEDS_FIRE',
  UNKNOWN_PLAN: 'UNKNOWN_PLAN',
  ALREADY_RESEARCHED: 'ALREADY_RESEARCHED',
  MISSING_PREREQUISITE: 'MISSING_PREREQUISITE',
  LEVEL_TOO_LOW: 'LEVEL_TOO_LOW',
  NOT_ENOUGH_POINTS: 'NOT_ENOUGH_POINTS',
  UNKNOWN_TECHNIQUE: 'UNKNOWN_TECHNIQUE',
  NOTHING_TO_BURN: 'NOTHING_TO_BURN',
});

/**
 * @typedef {{ type: 'SET_MOVE_INTENT', dx: number, dy: number }} SetMoveIntentCommand
 * @typedef {{ type: 'HARVEST', column: number, row: number }} HarvestCommand
 * @typedef {{ type: 'SEARCH', column: number, row: number }} SearchCommand
 * @typedef {{ type: 'TALK', npcId: string }} TalkCommand
 * @typedef {{ type: 'NEXT_PAGE' }} NextPageCommand
 * @typedef {{ type: 'END_DIALOGUE' }} EndDialogueCommand
 * @typedef {{ type: 'READ_BOOK', bookId: string }} ReadBookCommand
 * @typedef {{ type: 'CRAFT', recipeId: string }} CraftCommand
 * @typedef {{ type: 'GIVE', npcId: string }} GiveCommand
 * @typedef {{ type: 'PLACE', itemId: string }} PlaceCommand
 * @typedef {{ type: 'REKINDLE', column: number, row: number }} RekindleCommand
 * @typedef {{ type: 'EAT', resource: string }} EatCommand
 * @typedef {{ type: 'SLEEP', column: number, row: number }} SleepCommand
 * @typedef {{ type: 'RESEARCH', planId: string }} ResearchCommand
 * @typedef {{ type: 'BURN_SAGE' }} BurnSageCommand
 * @typedef {SetMoveIntentCommand | HarvestCommand | SearchCommand | TalkCommand | NextPageCommand
 *   | EndDialogueCommand | ReadBookCommand | CraftCommand | GiveCommand | PlaceCommand
 *   | RekindleCommand | EatCommand | SleepCommand | ResearchCommand | BurnSageCommand} Command
 */

/**
 * @typedef {object} CommandResult
 * @property {boolean} ok `true` si la commande est acceptée.
 * @property {string} [reason] Motif du refus (REJECTION_REASONS), si `ok` vaut `false`.
 */

const AXIS_VALUES = Object.freeze([-1, 0, 1]);

/**
 * Crée la commande qui fixe la direction demandée (intention, GUIDELINES § 5.2) : elle est
 * appliquée à chaque tick jusqu'à la commande suivante.
 * @param {import('../config/directions.js').MoveDirection} direction
 * @returns {SetMoveIntentCommand}
 * @throws {RangeError} Si une composante ne vaut pas -1, 0 ou 1.
 */
export function setMoveIntent({ dx, dy }) {
  if (!AXIS_VALUES.includes(dx) || !AXIS_VALUES.includes(dy)) {
    throw new RangeError(`Move intent components must be -1, 0 or 1, got (${dx}, ${dy})`);
  }
  return { type: COMMAND_TYPES.SET_MOVE_INTENT, dx, dy };
}

/**
 * Crée la commande de récolte d'une tuile (R-RES-REC-001 à 004).
 * @param {{ column: number, row: number }} tile
 * @returns {HarvestCommand}
 * @throws {TypeError} Si la colonne ou la ligne n'est pas un entier.
 */
export function harvestTile({ column, row }) {
  if (!Number.isInteger(column) || !Number.isInteger(row)) {
    throw new TypeError(`Tile coordinates must be integers, got (${column}, ${row})`);
  }
  return { type: COMMAND_TYPES.HARVEST, column, row };
}

/**
 * Crée la commande « parler à un PNJ » (R-PNJ-DIA-001).
 * @param {string} npcId
 * @returns {TalkCommand}
 */
export function talkTo(npcId) {
  return { type: COMMAND_TYPES.TALK, npcId };
}

/**
 * Crée la commande « page suivante » (R-PNJ-DIA-002).
 * @returns {NextPageCommand}
 */
export function nextPage() {
  return { type: COMMAND_TYPES.NEXT_PAGE };
}

/**
 * Crée la commande « terminer le dialogue » (R-PNJ-DIA-002).
 * @returns {EndDialogueCommand}
 */
export function endDialogue() {
  return { type: COMMAND_TYPES.END_DIALOGUE };
}

/**
 * Crée la commande de fouille d'une tuile (R-RES-FOU-001 à 004).
 * @param {{ column: number, row: number }} tile
 * @returns {SearchCommand}
 * @throws {TypeError} Si la colonne ou la ligne n'est pas un entier.
 */
export function searchTile({ column, row }) {
  return { ...harvestTile({ column, row }), type: COMMAND_TYPES.SEARCH };
}

/**
 * Crée la commande « lire un livre » (R-INV-LIV-002).
 * @param {string} bookId
 * @returns {ReadBookCommand}
 */
export function readBook(bookId) {
  return { type: COMMAND_TYPES.READ_BOOK, bookId };
}

/**
 * Crée la commande « fabriquer » (R-ART-FAB-001).
 * @param {string} recipeId
 * @returns {CraftCommand}
 */
export function craftItem(recipeId) {
  return { type: COMMAND_TYPES.CRAFT, recipeId };
}

/**
 * Crée la commande « donner à un PNJ » l'objet d'une quête (R-PNJ-QUE-002).
 * @param {string} npcId
 * @returns {GiveCommand}
 */
export function giveTo(npcId) {
  return { type: COMMAND_TYPES.GIVE, npcId };
}

/**
 * Crée la commande « poser un objet » devant le joueur (R-ART-POS-001).
 * @param {string} itemId
 * @returns {PlaceCommand}
 */
export function placeItem(itemId) {
  return { type: COMMAND_TYPES.PLACE, itemId };
}

/**
 * Crée la commande « raviver un feu de camp » (R-ART-FEU-001).
 * @param {{ column: number, row: number }} tile
 * @returns {RekindleCommand}
 * @throws {TypeError} Si la colonne ou la ligne n'est pas un entier.
 */
export function rekindle({ column, row }) {
  return { ...harvestTile({ column, row }), type: COMMAND_TYPES.REKINDLE };
}

/**
 * Crée la commande « manger » (R-JOU-MAN-001).
 * @param {string} resource
 * @returns {EatCommand}
 */
export function eat(resource) {
  return { type: COMMAND_TYPES.EAT, resource };
}

/**
 * Crée la commande « dormir près d'un feu » (R-JOU-SOM-001).
 * @param {{ column: number, row: number }} tile Le feu de camp.
 * @returns {SleepCommand}
 * @throws {TypeError} Si la colonne ou la ligne n'est pas un entier.
 */
export function sleepBy({ column, row }) {
  return { ...harvestTile({ column, row }), type: COMMAND_TYPES.SLEEP };
}

/**
 * Crée la commande « rechercher un plan » (R-TEC-REC-002).
 * @param {string} planId
 * @returns {ResearchCommand}
 */
export function researchPlan(planId) {
  return { type: COMMAND_TYPES.RESEARCH, planId };
}

/**
 * Crée la commande « brûler la sauge » dans un feu à portée (R-MEN-SAU-002).
 * @returns {BurnSageCommand}
 */
export function burnSage() {
  return { type: COMMAND_TYPES.BURN_SAGE };
}
