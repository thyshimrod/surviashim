// @ts-check
import { BOOKS } from '../../../data/books.js';
import { ITEMS } from '../../../data/items.js';
import { NPCS } from '../../../data/npcs.js';
import { PLACEABLES } from '../../../data/placeables.js';
import { PLACES } from '../../../data/places.js';
import { QUESTS } from '../../../data/quests.js';
import { RECIPES } from '../../../data/recipes.js';
import { RESOURCES } from '../../../data/resources.js';
import { SEARCH_SPOTS } from '../../../data/searchSpots.js';
import { TILE_DEFINITIONS } from '../../../data/tilesets.js';
import { TOOLS } from '../../../data/tools.js';

/** @typedef {import('../../../data/gameParameters.js').GameParameters} GameParameters */
/** @typedef {import('./GameState.js').GameRules} GameRules */

/**
 * Valeurs des règles d'une partie, tirées des paramètres (spécification, partie C) et des
 * données.
 */

/**
 * @param {Readonly<GameParameters>} parameters
 * @returns {GameRules}
 */
export function createGameRules(parameters) {
  return {
    walkSpeed: parameters.PLAYER_WALK_SPEED,
    hitbox: { width: parameters.PLAYER_HITBOX_WIDTH, height: parameters.PLAYER_HITBOX_HEIGHT },
    harvestReach: parameters.HARVEST_REACH,
    talkReach: parameters.TALK_REACH,
    tiles: TILE_DEFINITIONS,
    npcs: NPCS,
    places: PLACES,
    searchSpots: SEARCH_SPOTS,
    searchMaxBooks: parameters.SEARCH_MAX_BOOKS,
    tools: TOOLS,
    recipes: RECIPES,
    books: BOOKS,
    quests: QUESTS,
    items: ITEMS,
    placeables: PLACEABLES,
    resources: RESOURCES,
    time: createTimeRules(parameters),
    vitals: createVitalRules(parameters),
    npcWalk: {
      speed: parameters.NPC_WALK_SPEED,
      pauseMinutes: parameters.NPC_PAUSE_MINUTES,
    },
  };
}

/**
 * @param {Readonly<GameParameters>} parameters
 * @returns {import('../systems/time.js').TimeRules}
 */
function createTimeRules(parameters) {
  return {
    ticksPerMinute: parameters.TICK_PER_GAME_MINUTE,
    dayStart: parameters.DAY_START,
    duskStart: parameters.DUSK_START,
    nightStart: parameters.NIGHT_START,
    dawnStart: parameters.DAWN_START,
    nightDarkness: parameters.NIGHT_DARKNESS,
    heroLightRadius: parameters.HERO_LIGHT_RADIUS,
    campfireLightRadius: parameters.CAMPFIRE_LIGHT_RADIUS,
    campfireBurnMinutes: parameters.CAMPFIRE_BURN_MINUTES,
    campfireRekindleWood: parameters.CAMPFIRE_REKINDLE_WOOD,
    treeRegrowDays: parameters.TREE_REGROW_DAYS,
  };
}

/**
 * @param {Readonly<GameParameters>} parameters
 * @returns {import('../systems/needs.js').VitalRules}
 */
function createVitalRules(parameters) {
  const half = parameters.TILE_SIZE / 2;
  return {
    healthMax: parameters.HEALTH_MAX,
    hungerMax: parameters.HUNGER_MAX,
    hungerMinutes: parameters.HUNGER_MINUTES_PER_POINT,
    healthMinutes: parameters.HEALTH_MINUTES_PER_POINT,
    wellFed: parameters.WELL_FED,
    faintHealth: parameters.FAINT_HEALTH,
    faintHunger: parameters.FAINT_HUNGER,
    sleepStart: parameters.SLEEP_START,
    sleepHunger: parameters.SLEEP_HUNGER,
    startPosition: {
      x: parameters.PLAYER_START_TILE.x * parameters.TILE_SIZE + half,
      y: parameters.PLAYER_START_TILE.y * parameters.TILE_SIZE + half,
    },
  };
}
