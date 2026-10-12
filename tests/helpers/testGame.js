import { BOOKS } from '../../data/books.js';
import { GAME_PARAMETERS } from '../../data/gameParameters.js';
import { ITEMS } from '../../data/items.js';
import { NPCS } from '../../data/npcs.js';
import { PLACEABLES } from '../../data/placeables.js';
import { QUESTS } from '../../data/quests.js';
import { RECIPES } from '../../data/recipes.js';
import { TOOLS } from '../../data/tools.js';
import { TILE_DEFINITIONS } from '../../data/tilesets.js';
import {
  craftItem,
  harvestTile,
  readBook,
  searchTile,
  setMoveIntent,
} from '../../src/core/commands/commands.js';
import { Game } from '../../src/core/Game.js';
import { Player } from '../../src/core/model/Player.js';
import { TileMap } from '../../src/core/model/TileMap.js';
import {
  createEmptyInventory,
  createGameRules,
  createGameState,
} from '../../src/core/state/GameState.js';

/** Directions demandées, avec le vocabulaire de la spécification. */
export const DIRECTIONS = Object.freeze({
  aucune: { dx: 0, dy: 0 },
  haut: { dx: 0, dy: -1 },
  bas: { dx: 0, dy: 1 },
  gauche: { dx: -1, dy: 0 },
  droite: { dx: 1, dy: 0 },
  'haut-droite': { dx: 1, dy: -1 },
  'haut-gauche': { dx: -1, dy: -1 },
  'bas-droite': { dx: 1, dy: 1 },
  'bas-gauche': { dx: -1, dy: 1 },
});

/**
 * Carte d'herbe sur mesure, avec des rochers et d'autres types de tuiles aux positions données.
 * @param {object} [options]
 * @param {number} [options.columns]
 * @param {number} [options.rows]
 * @param {number} [options.tileSize]
 * @param {Array<[number, number]>} [options.rocks] Rochers (colonne, ligne).
 * @param {Array<[number, number, string]>} [options.tiles] Autres tuiles (colonne, ligne, type).
 */
export function makeMap({ columns = 40, rows = 30, tileSize = 32, rocks = [], tiles = [] } = {}) {
  const tileIds = Array.from({ length: columns * rows }, () => 'grass');
  for (const [column, row, id] of [
    ...rocks.map(([column, row]) => [column, row, 'rock']),
    ...tiles,
  ]) {
    tileIds[row * columns + column] = id;
  }
  return new TileMap({
    columns,
    rows,
    tileSize,
    tileIds,
    blocking: tileIds.map((id) => TILE_DEFINITIONS[id].isBlocking),
  });
}

/**
 * Partie sur mesure pour un test. Par défaut : carte d'herbe de 40 × 30 tuiles de 32 px, sans
 * obstacle, joueur en (100, 100) orienté vers le bas, vitesse 1,5 px/tick, boîte de 20 × 12 px,
 * portée de récolte 48 px, types de tuiles et rendements de data/tilesets.js, inventaire vide,
 * aucun PNJ ni lieu, portée de parole 64 px, dialogues de data/npcs.js. Le joueur possède
 * tous les outils (convention des exemples, spécification B.8) et ne connaît aucune recette ;
 * un inventaire partiel est complété par des 0. L'horloge marque le jour 1 à 6:00 ; temps, nuit,
 * feu de camp, repousse, faim, santé et promenades suivent la partie C de la spécification
 * (`needs: false` coupe la faim et la santé). Les PNJ commencent par une pause chez eux.
 * @example
 * const { game, state } = createTestGame({ player: { position: { x: 100, y: 100 } } });
 * walk(game, 'droite', 1);
 */
export function createTestGame({
  map = {},
  player = {},
  walkSpeed = 1.5,
  hitbox = { width: 20, height: 12 },
  harvestReach = 48,
  inventory = undefined,
  npcs = [],
  places = {},
  talkReach = 64,
  npcDefinitions = NPCS,
  dialogue = undefined,
  journal = [],
  books = [],
  searchSpots = [],
  searchMaxBooks = 2,
  tools = Object.keys(TOOLS),
  knownRecipes = [],
  items = [],
  quests = [],
  experience = 0,
  clock = at(1, '6:00'),
  placeables = {},
  campfires = [],
  health = 100,
  hunger = 100,
  needs = true,
} = {}) {
  const rules = createGameRules(GAME_PARAMETERS);
  const pauseUntil = clock + rules.npcWalk.pauseMinutes * rules.time.ticksPerMinute;
  const state = createGameState({
    map: makeMap(map),
    player: new Player({ position: { x: 100, y: 100 }, ...player }),
    inventory: inventory === undefined ? undefined : { ...createEmptyInventory(), ...inventory },
    npcs: npcs.map((npc) => ({
      facing: 'down',
      home: { ...npc.position },
      step: 0,
      pauseUntil,
      isWalking: false,
      ...npc,
    })),
    dialogue,
    journal,
    books,
    tools,
    knownRecipes,
    items,
    quests,
    experience,
    clock,
    placeables,
    campfires,
    health,
    hunger,
  });
  const game = new Game(state, {
    rules: {
      walkSpeed,
      hitbox,
      harvestReach,
      talkReach,
      tiles: TILE_DEFINITIONS,
      npcs: npcDefinitions,
      places,
      searchSpots,
      searchMaxBooks,
      tools: TOOLS,
      recipes: RECIPES,
      books: BOOKS,
      quests: QUESTS,
      items: ITEMS,
      placeables: PLACEABLES,
      time: rules.time,
      resources: rules.resources,
      npcWalk: rules.npcWalk,
      ...(needs ? { vitals: rules.vitals } : {}),
    },
  });
  return { game, state };
}

/**
 * Demande une direction pendant un nombre de ticks.
 * @param {Game} game
 * @param {keyof typeof DIRECTIONS} direction
 * @param {number} ticks
 */
export function walk(game, direction, ticks) {
  game.execute(setMoveIntent(DIRECTIONS[direction]));
  game.advanceTicks(ticks);
}

/** Tolérance « à 0,01 près » de la spécification. */
export const TOLERANCE = 0.01;

/**
 * Vérifie qu'une position vaut la valeur attendue à `TOLERANCE` près.
 * @param {{x: number, y: number}} actual
 * @param {{x: number, y: number}} expected
 */
export function isCloseTo(actual, expected) {
  return Math.abs(actual.x - expected.x) < TOLERANCE && Math.abs(actual.y - expected.y) < TOLERANCE;
}

/**
 * Récolte une tuile.
 * @param {Game} game
 * @param {number} column
 * @param {number} row
 */
export function harvestAt(game, column, row) {
  return game.execute(harvestTile({ column, row }));
}

/**
 * Fouille une tuile.
 * @param {Game} game
 * @param {number} column
 * @param {number} row
 */
export function searchAt(game, column, row) {
  return game.execute(searchTile({ column, row }));
}

/**
 * Lit un livre.
 * @param {Game} game
 * @param {string} bookId
 */
export function readAt(game, bookId) {
  return game.execute(readBook(bookId));
}

/**
 * Fabrique l'objet d'une recette.
 * @param {Game} game
 * @param {string} recipeId
 */
export function craftAt(game, recipeId) {
  return game.execute(craftItem(recipeId));
}

/**
 * Horloge (en ticks) au jour et à l'heure donnés : `at(2, '6:30')`.
 * @param {number} day À partir de 1.
 * @param {string} time « H:MM ».
 * @returns {number}
 */
export function at(day, time) {
  const [hours, minutes] = time.split(':').map(Number);
  return ((day - 1) * 1440 + hours * 60 + minutes) * GAME_PARAMETERS.TICK_PER_GAME_MINUTE;
}
