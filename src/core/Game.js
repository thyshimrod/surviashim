// @ts-check
import { GAME_PARAMETERS } from '../../data/gameParameters.js';
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

/** @typedef {import('./state/GameState.js').GameState} GameState */
/** @typedef {import('./state/GameState.js').GameRules} GameRules */
/** @typedef {import('../../data/gameParameters.js').GameParameters} GameParameters */
/** @typedef {import('./commands/commands.js').Command} Command */
/** @typedef {import('./commands/commands.js').CommandResult} CommandResult */
/** @typedef {import('./commands/harvest.js').TileInspection} TileInspection */
/** @typedef {import('./commands/dialogue.js').NpcInspection} NpcInspection */
/** @typedef {import('./commands/crafting.js').RecipeInspection} RecipeInspection */

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
    if (command.type === COMMAND_TYPES.SET_MOVE_INTENT) {
      this.state.player.moveIntent = { dx: command.dx, dy: command.dy };
      return { ok: true };
    }
    if (command.type === COMMAND_TYPES.HARVEST) {
      return harvest(this.state, this.rules, this.events, command);
    }
    if (command.type === COMMAND_TYPES.SEARCH) {
      return search(this.state, this.rules, this.events, command);
    }
    if (command.type === COMMAND_TYPES.TALK) {
      return talk(this.state, this.rules, this.events, command.npcId);
    }
    if (command.type === COMMAND_TYPES.NEXT_PAGE) {
      return turnPage(this.state, this.rules, this.events);
    }
    if (command.type === COMMAND_TYPES.END_DIALOGUE) {
      return finishDialogue(this.state, this.events);
    }
    if (command.type === COMMAND_TYPES.READ_BOOK) {
      return readBook(this.state, this.rules, this.events, command.bookId);
    }
    if (command.type === COMMAND_TYPES.CRAFT) {
      return craft(this.state, this.rules, this.events, command.recipeId);
    }
    if (command.type === COMMAND_TYPES.GIVE) {
      const { npcId } = command;
      const refusal = talkRefusal(this.state, this.rules, npcId);
      return give(this.state, this.rules, this.events, { npcId, refusal });
    }
    throw new Error(`Unknown command type "${/** @type {{ type: string }} */ (command).type}"`);
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
    movePlayer(this.state, this.rules);
    discoverPlaces(this.state, this.rules, this.events);
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
