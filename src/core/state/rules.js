// @ts-check
import { BLIGHTED_PLACES } from '../../../data/blight.js';
import { BOOKS } from '../../../data/books.js';
import { ITEMS } from '../../../data/items.js';
import { NPCS } from '../../../data/npcs.js';
import { PLACEABLES } from '../../../data/placeables.js';
import { PLACES } from '../../../data/places.js';
import { QUESTS } from '../../../data/quests.js';
import { RECIPES } from '../../../data/recipes.js';
import { RESEARCH_PLANS } from '../../../data/research.js';
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
    handHarvestTicks: parameters.HAND_HARVEST_TICKS,
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
    research: RESEARCH_PLANS,
    ...createProgressRules(parameters),
  };
}

/**
 * Expérience (R-JOU-EXP-*), Flétrissure (R-MEN-*) et Foyer (R-MON-FOY-001).
 * @param {Readonly<GameParameters>} parameters
 * @returns {Pick<GameRules, 'experience' | 'blight' | 'hearth'>}
 */
function createProgressRules(parameters) {
  return {
    experience: {
      harvest: parameters.XP_HARVEST,
      search: parameters.XP_SEARCH,
      craft: parameters.XP_CRAFT,
      discover: parameters.XP_DISCOVER,
      firstLevel: parameters.LEVEL_FIRST_XP,
      step: parameters.LEVEL_XP_STEP,
    },
    blight: {
      areas: BLIGHTED_PLACES.map((id) => PLACES[id].area),
      sageRadius: parameters.SAGE_RADIUS,
    },
    hearth: {
      column: parameters.HEARTH_TILE.x,
      row: parameters.HEARTH_TILE.y,
      reach: parameters.HEARTH_REACH,
      lightRadius: parameters.HEARTH_LIGHT_RADIUS,
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
    energyMax: parameters.ENERGY_MAX,
    energyDrainMinutes: parameters.ENERGY_DRAIN_MINUTES,
    blightHealthMinutes: parameters.BLIGHT_HEALTH_MINUTES,
    energyRegenMinutes: parameters.ENERGY_REGEN_MINUTES,
    faintEnergy: parameters.FAINT_ENERGY,
    startPosition: {
      x: parameters.PLAYER_START_TILE.x * parameters.TILE_SIZE + half,
      y: parameters.PLAYER_START_TILE.y * parameters.TILE_SIZE + half,
    },
  };
}
