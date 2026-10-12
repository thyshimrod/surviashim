// @ts-check
import { GAME_PARAMETERS } from '../../data/gameParameters.js';
import { lightSources, place, rekindle } from './commands/campfire.js';
import { eat, sleep } from './commands/rest.js';
import { COMMAND_TYPES } from './commands/commands.js';
import { craft, inspectRecipe, readBook } from './commands/crafting.js';
import { finishDialogue, inspectNpc, talk, talkRefusal, turnPage } from './commands/dialogue.js';
import { harvest, inspectTile } from './commands/harvest.js';
import { give } from './commands/quests.js';
import { search } from './commands/search.js';
import { EventBus } from './events/EventBus.js';
import { GAME_EVENTS } from './events/gameEvents.js';
import { createInitialState } from './state/createInitialState.js';
import { createGameRules } from './state/GameState.js';
import { discoverPlaces } from './systems/discoverPlaces.js';
import { movePlayer } from './systems/movePlayer.js';
import { updateNeeds } from './systems/needs.js';
import { regrowTrees } from './systems/regrowTrees.js';
import { walkNpcs } from './systems/walkNpcs.js';
import { advanceClock, timeOf } from './systems/time.js';

/** @typedef {import('./state/GameState.js').GameState} GameState */
/** @typedef {import('./state/GameState.js').GameRules} GameRules */
/** @typedef {import('../../data/gameParameters.js').GameParameters} GameParameters */
/** @typedef {import('./commands/commands.js').Command} Command */
/** @typedef {import('./commands/commands.js').CommandResult} CommandResult */
/** @typedef {import('./commands/harvest.js').TileInspection} TileInspection */
/** @typedef {import('./commands/dialogue.js').NpcInspection} NpcInspection */
/** @typedef {import('./commands/crafting.js').RecipeInspection} RecipeInspection */

/**
 * Champs de toutes les commandes : chaque traitement ne lit que ceux de son type.
 * @typedef {{ type: string, dx: number, dy: number, column: number, row: number, npcId: string,
 *   bookId: string, recipeId: string, itemId: string, resource: string }} CommandFields
 */

/**
 * Traitement de chaque commande (spécification B.5).
 * @type {Readonly<Record<string, (game: Game, command: CommandFields) => CommandResult>>}
 */
const HANDLERS = Object.freeze({
  [COMMAND_TYPES.SET_MOVE_INTENT]: (game, { dx, dy }) => {
    game.state.player.moveIntent = { dx, dy };
    return { ok: true };
  },
  [COMMAND_TYPES.HARVEST]: (game, command) => harvest(game.state, game.rules, game.events, command),
  [COMMAND_TYPES.SEARCH]: (game, command) => search(game.state, game.rules, game.events, command),
  [COMMAND_TYPES.TALK]: (game, { npcId }) => talk(game.state, game.rules, game.events, npcId),
  [COMMAND_TYPES.NEXT_PAGE]: (game) => turnPage(game.state, game.rules, game.events),
  [COMMAND_TYPES.END_DIALOGUE]: (game) => finishDialogue(game.state, game.events),
  [COMMAND_TYPES.READ_BOOK]: (game, { bookId }) =>
    readBook(game.state, game.rules, game.events, bookId),
  [COMMAND_TYPES.CRAFT]: (game, { recipeId }) =>
    craft(game.state, game.rules, game.events, recipeId),
  [COMMAND_TYPES.PLACE]: (game, { itemId }) => place(game.state, game.rules, game.events, itemId),
  [COMMAND_TYPES.REKINDLE]: (game, command) =>
    rekindle(game.state, game.rules, game.events, command),
  [COMMAND_TYPES.EAT]: (game, { resource }) => eat(game.state, game.rules, game.events, resource),
  [COMMAND_TYPES.SLEEP]: (game, command) => sleep(game.state, game.rules, game.events, command),
  [COMMAND_TYPES.GIVE]: (game, { npcId }) => {
    const refusal = talkRefusal(game.state, game.rules, npcId);
    return give(game.state, game.rules, game.events, { npcId, refusal });
  },
});

/**
 * Façade du métier : seul point d'entrée utilisé par la présentation et par les tests.
 * Le jeu peut tourner sans navigateur, en appelant `execute()` et `update()`.
 */
export class Game {
  /**
   * @param {GameState} state État de départ (voir `Game.create` pour une partie standard).
   * @param {object} options
   * @param {GameRules} options.rules Valeurs des règles (voir `createGameRules`).
   * @param {EventBus} [options.events]
   */
  constructor(state, { rules, events = new EventBus() }) {
    this.state = state;
    this.rules = rules;
    this.events = events;
  }

  /**
   * Crée une nouvelle partie à partir des paramètres de la spécification.
   * @param {Readonly<GameParameters>} [parameters]
   * @returns {Game}
   */
  static create(parameters = GAME_PARAMETERS) {
    return new Game(createInitialState(parameters), { rules: createGameRules(parameters) });
  }

  /**
   * Traite immédiatement une commande du joueur, entre deux ticks (spécification B.5).
   * Une commande refusée ne modifie rien et publie COMMAND_REJECTED.
   * @param {Command} command Créée avec les fabriques de commands/commands.js.
   * @returns {CommandResult}
   * @throws {Error} Si le type de commande est inconnu.
   */
  execute(command) {
    const result = this.apply(command);
    if (!result.ok) {
      this.events.emit(GAME_EVENTS.COMMAND_REJECTED, { command, reason: result.reason });
    }
    return result;
  }

  /**
   * @param {Command} command
   * @returns {CommandResult}
   */
  apply(command) {
    const handler = HANDLERS[command.type];
    if (handler === undefined) {
      throw new Error(`Unknown command type "${/** @type {{ type: string }} */ (command).type}"`);
    }
    return handler(this, /** @type {CommandFields} */ (/** @type {unknown} */ (command)));
  }

  /**
   * Décrit une tuile (ce qu'on peut en récolter, si elle est à portée) sans rien modifier.
   * @param {{ column: number, row: number }} tile
   * @returns {TileInspection}
   */
  inspect(tile) {
    return inspectTile(this.state, this.rules, tile);
  }

  /**
   * Décrit un PNJ (existe-t-il, est-il à portée de parole ?) sans rien modifier.
   * @param {string} npcId
   * @returns {NpcInspection}
   */
  inspectNpc(npcId) {
    return inspectNpc(this.state, this.rules, npcId);
  }

  /**
   * Décrit une recette (connue ? outil déjà possédé ? ingrédients ?) sans rien modifier.
   * @param {string} recipeId
   * @returns {RecipeInspection}
   */
  inspectRecipe(recipeId) {
    return inspectRecipe(this.state, this.rules, recipeId);
  }

  /** Exécute un tick de logique, dans l'ordre de la spécification B.4. */
  update() {
    this.state.tick += 1;
    advanceClock(this.state);
    movePlayer(this.state, this.rules);
    discoverPlaces(this.state, this.rules, this.events);
    regrowTrees(this.state, this.rules, this.events);
    updateNeeds(this.state, this.rules, this.events);
    walkNpcs(this.state, this.rules);
  }

  /**
   * R-MON-TPS-001 : jour (à partir de 1) et minute du jour.
   * @returns {{ day: number, minute: number }}
   */
  time() {
    return timeOf(this.state.clock, this.rules.time?.ticksPerMinute ?? 1);
  }

  /**
   * R-IHM-NUI-001 : sources de lumière de la nuit (héros, feux allumés).
   * @returns {{ x: number, y: number, radius: number }[]}
   */
  lights() {
    return lightSources(this.state, this.rules);
  }

  /**
   * Exécute plusieurs ticks d'affilée.
   * @param {number} count
   */
  advanceTicks(count) {
    for (let tick = 0; tick < count; tick += 1) {
      this.update();
    }
  }

  /**
   * État courant, en lecture seule par convention : la présentation ne doit pas le modifier.
   * @returns {GameState}
   */
  getState() {
    return this.state;
  }
}
