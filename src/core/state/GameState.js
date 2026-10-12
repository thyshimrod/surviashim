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

/** @typedef {import('../model/TileMap.js').TileMap} TileMap */
/** @typedef {import('../model/Player.js').Player} Player */
/** @typedef {import('../utils/box.js').Size} Size */
/** @typedef {import('../../../data/tilesets.js').TileDefinition} TileDefinition */
/** @typedef {import('../../../data/npcs.js').NpcDefinition} NpcDefinition */
/** @typedef {import('../../../data/places.js').PlaceDefinition} PlaceDefinition */
/** @typedef {import('../config/directions.js').Facing} Facing */

/**
 * Quantité de chaque ressource possédée, par identifiant de ressource.
 * @typedef {Record<string, number>} Inventory
 */

/**
 * PNJ présent dans la vallée (R-PNJ-POS-001).
 * @typedef {object} Npc
 * @property {string} id Clé de data/npcs.js.
 * @property {{ x: number, y: number }} position Milieu des pieds (px de monde).
 * @property {Facing} facing
 */

/**
 * Dialogue en cours (R-PNJ-DIA-001, 002).
 * @typedef {object} Dialogue
 * @property {string} npcId
 * @property {number} page Rang de la page en cours, à partir de 0.
 * @property {string[]} [pages] Pages dites, fixées au début du dialogue (R-PNJ-QUE-003) ;
 *   absentes, ce sont toutes les pages du PNJ.
 */

/**
 * Feu de camp posé (R-ART-FEU-001).
 * @typedef {object} Campfire
 * @property {number} column
 * @property {number} row
 * @property {number} burnsUntil Horloge (ticks) où il s'éteint.
 */

/**
 * Souche qui repoussera (R-RES-REC-005).
 * @typedef {object} Regrowth
 * @property {number} column
 * @property {number} row
 * @property {string} tile Type de tuile qui repousse (« tree »).
 * @property {number} at Horloge (ticks) de la repousse.
 */

/**
 * Quête reçue (R-PNJ-QUE-001, 002).
 * @typedef {object} QuestEntry
 * @property {string} questId Clé de data/quests.js.
 * @property {'active' | 'done'} status En cours, ou terminée.
 */

/**
 * Ligne du journal (R-MON-LIE-002, R-PNJ-DIA-004).
 * @typedef {object} JournalEntry
 * @property {string} placeId
 * @property {'rumored' | 'discovered'} status Indice reçu, ou lieu découvert.
 * @property {{ npcId: string, pageId: string }} [hint] Qui a donné l'indice, sur quelle page.
 */

/**
 * Racine de l'état du jeu. Ne contient que des données simples, pour pouvoir être sauvegardée
 * (GUIDELINES P8).
 * @typedef {object} GameState
 * @property {number} tick Nombre de ticks exécutés depuis le début de la partie.
 * @property {TileMap} map Carte de la vallée.
 * @property {Player} player
 * @property {Inventory} inventory
 * @property {Npc[]} npcs
 * @property {Dialogue | undefined} dialogue
 * @property {JournalEntry[]} journal Dans l'ordre d'arrivée.
 * @property {string[]} books Livres trouvés, dans l'ordre (R-INV-LIV-001).
 * @property {string[]} tools Outils possédés, dans l'ordre d'obtention (R-INV-OUT-001).
 * @property {string[]} knownRecipes Plans appris en lisant, dans l'ordre (R-INV-LIV-002).
 * @property {string[]} items Objets possédés, dans l'ordre (R-INV-OBJ-001).
 * @property {QuestEntry[]} quests Quêtes reçues, dans l'ordre (R-PNJ-QUE-001).
 * @property {number} experience Points d'expérience (R-JOU-EXP-001).
 * @property {string[]} currentPlaces Lieux qui contenaient le joueur à la fin du tick précédent
 *   (R-MON-LIE-003).
 * @property {number} clock Horloge : ticks écoulés depuis le jour 1 à 0:00 (R-MON-TPS-001).
 * @property {Record<string, number>} placeables Objets à poser, par sorte (R-INV-POS-001).
 * @property {Campfire[]} campfires Feux de camp posés (R-ART-FEU-001).
 * @property {Regrowth[]} regrowth Souches qui repousseront (R-RES-REC-005).
 */

/**
 * Valeurs des règles, tirées des paramètres (spécification, partie C) et des données.
 * Elles ne font pas partie de l'état : une sauvegarde ne les contient pas.
 * @typedef {object} GameRules
 * @property {number} walkSpeed Distance parcourue par tick de marche (px).
 * @property {Size} hitbox Taille de la boîte de collision du joueur et des PNJ (px).
 * @property {number} harvestReach Portée de récolte (px, R-RES-REC-001).
 * @property {number} [talkReach] Portée de parole (px, R-PNJ-DIA-001).
 * @property {Readonly<Record<string, Readonly<TileDefinition>>>} tiles Types de tuiles.
 * @property {Readonly<Record<string, Readonly<NpcDefinition>>>} [npcs] PNJ et leurs dialogues.
 * @property {Readonly<Record<string, Readonly<PlaceDefinition>>>} [places] Lieux nommés.
 * @property {readonly Readonly<import('../../../data/searchSpots.js').SearchSpot>[]} [searchSpots]
 *   Cachettes et leur contenu (R-RES-FOU-003).
 * @property {number} [searchMaxBooks] Livres au plus par cachette.
 * @property {Readonly<Record<string, Readonly<import('../../../data/tools.js').ToolDefinition>>>}
 *   [tools] Outils (R-RES-OUT-001).
 * @property {Readonly<Record<string, Readonly<import('../../../data/recipes.js').RecipeDefinition>>>}
 *   [recipes] Recettes d'artisanat (R-ART-FAB-001).
 * @property {Readonly<Record<string, Readonly<import('../../../data/books.js').BookDefinition>>>}
 *   [books] Livres et leurs plans (R-INV-LIV-002).
 * @property {Readonly<Record<string, Readonly<import('../../../data/quests.js').QuestDefinition>>>}
 *   [quests] Quêtes (R-PNJ-QUE-001 à 003).
 * @property {Readonly<Record<string, Readonly<import('../../../data/items.js').ItemDefinition>>>}
 *   [items] Objets (R-INV-OBJ-001).
 * @property {Readonly<Record<string, Readonly<import('../../../data/placeables.js').PlaceableDefinition>>>}
 *   [placeables] Objets à poser (R-ART-POS-001).
 * @property {import('../systems/time.js').TimeRules} [time] Temps, nuit, feu de camp, repousse.
 */

/**
 * R-INV-RES-001 : inventaire vide, chaque ressource à 0.
 * @returns {Inventory}
 */
export function createEmptyInventory() {
  return Object.fromEntries(Object.keys(RESOURCES).map((id) => [id, 0]));
}

/**
 * @param {object} params
 * @param {TileMap} params.map
 * @param {Player} params.player
 * @param {Inventory} [params.inventory]
 * @param {Npc[]} [params.npcs]
 * @param {Dialogue} [params.dialogue]
 * @param {JournalEntry[]} [params.journal]
 * @param {string[]} [params.books]
 * @param {string[]} [params.tools]
 * @param {string[]} [params.knownRecipes]
 * @param {string[]} [params.items]
 * @param {QuestEntry[]} [params.quests]
 * @param {number} [params.experience]
 * @param {string[]} [params.currentPlaces]
 * @param {number} [params.clock]
 * @param {Record<string, number>} [params.placeables]
 * @param {Campfire[]} [params.campfires]
 * @param {Regrowth[]} [params.regrowth]
 * @param {number} [params.tick]
 * @returns {GameState}
 */
export function createGameState(params) {
  const { map, player, inventory = createEmptyInventory(), dialogue, tick = 0 } = params;
  return {
    tick,
    map,
    player,
    inventory: { ...inventory },
    dialogue: dialogue === undefined ? undefined : copyDialogue(dialogue),
    ...copyWorld(params),
    ...copyProgress(params),
    ...copyTime(params),
  };
}

/**
 * PNJ, journal et lieux où se trouve le joueur, copiés.
 * @param {{ npcs?: Npc[], journal?: JournalEntry[], currentPlaces?: string[] }} params
 * @returns {Pick<GameState, 'npcs' | 'journal' | 'currentPlaces'>}
 */
function copyWorld({ npcs = [], journal = [], currentPlaces = [] }) {
  return {
    npcs: npcs.map((npc) => ({ ...npc, position: { ...npc.position } })),
    journal: journal.map((entry) => ({ ...entry })),
    currentPlaces: [...currentPlaces],
  };
}

/**
 * Horloge, objets à poser, feux de camp et repousses, copiés.
 * @param {{ clock?: number, placeables?: Record<string, number>, campfires?: Campfire[],
 *   regrowth?: Regrowth[] }} params
 * @returns {Pick<GameState, 'clock' | 'placeables' | 'campfires' | 'regrowth'>}
 */
function copyTime({ clock = 0, placeables = {}, campfires = [], regrowth = [] }) {
  return {
    clock,
    placeables: { ...placeables },
    campfires: campfires.map((fire) => ({ ...fire })),
    regrowth: regrowth.map((entry) => ({ ...entry })),
  };
}

/**
 * Ce que le joueur a acquis (livres, outils, recettes, objets, quêtes, expérience), copié.
 * @param {{ books?: string[], tools?: string[], knownRecipes?: string[], items?: string[],
 *   quests?: QuestEntry[], experience?: number }} params
 * @returns {Pick<GameState, 'books' | 'tools' | 'knownRecipes' | 'items' | 'quests'
 *   | 'experience'>}
 */
function copyProgress({
  books = [],
  tools = [],
  knownRecipes = [],
  items = [],
  quests = [],
  experience = 0,
}) {
  return {
    books: [...books],
    tools: [...tools],
    knownRecipes: [...knownRecipes],
    items: [...items],
    quests: quests.map((quest) => ({ ...quest })),
    experience,
  };
}

/**
 * @param {Readonly<import('../../../data/gameParameters.js').GameParameters>} parameters
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
    time: createTimeRules(parameters),
  };
}

/**
 * @param {Readonly<import('../../../data/gameParameters.js').GameParameters>} parameters
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
 * @param {Dialogue} dialogue
 * @returns {Dialogue}
 */
function copyDialogue(dialogue) {
  return dialogue.pages === undefined
    ? { ...dialogue }
    : { ...dialogue, pages: [...dialogue.pages] };
}

/**
 * R-PNJ-POS-001 : PNJ au centre de sa tuile, orienté comme dans les données.
 * @param {Readonly<NpcDefinition>} definition
 * @param {number} tileSize
 * @returns {Npc}
 */
export function createNpc(definition, tileSize) {
  const half = tileSize / 2;
  return {
    id: definition.id,
    position: {
      x: definition.tile.column * tileSize + half,
      y: definition.tile.row * tileSize + half,
    },
    facing: definition.facing,
  };
}
