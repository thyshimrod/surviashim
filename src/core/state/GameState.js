// @ts-check
import { RESOURCES } from '../../../data/resources.js';

export { createGameRules } from './rules.js';

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
 * @property {{ x: number, y: number }} [home] Centre de sa tuile (R-PNJ-POS-001).
 * @property {number} [step] Étape de sa promenade vers laquelle il va (R-PNJ-POS-003).
 * @property {number} [pauseUntil] Horloge (ticks) jusqu'à laquelle il attend.
 * @property {boolean} [isWalking]
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
 * @property {Harvesting | undefined} harvesting Récolte en cours (R-RES-REC-006).
 * @property {Travel | undefined} travel Chemin suivi (R-JOU-DEP-004, R-JOU-DEP-005).
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
 * @property {Regrowth[]} regrowth Éléments qui repousseront (R-RES-REC-005).
 * @property {number} health PV (R-JOU-VIE-001).
 * @property {number} hunger Faim, de 0 à HUNGER_MAX (R-JOU-VIE-002).
 * @property {string[]} discoveredPlans Plans des livres de recherche lus (R-INV-LIV-002).
 * @property {string[]} readBooks Livres lus, dans l'ordre : les archives (R-IHM-JRN-004).
 * @property {string[]} researched Plans recherchés, dans l'ordre (R-TEC-REC-002).
 * @property {number} energy Énergie, de 0 à ENERGY_MAX (R-JOU-ENE-001).
 * @property {number[]} purified Tuiles purifiées (indices ligne × colonnes + colonne).
 * @property {boolean} inBlight `true` si le joueur était sur une tuile flétrie au tick précédent.
 */

/**
 * Chemin suivi par le héros (R-JOU-DEP-004), et l'action à faire en arrivant (R-JOU-DEP-005).
 * @typedef {object} Travel
 * @property {{ column: number, row: number }[]} path Tuiles qui restent à atteindre.
 * @property {import('../commands/commands.js').Command} [action]
 * @property {number} attempts Essais déjà faits pour rejoindre l'élément.
 * @property {number} stuckTicks Ticks sans avancer.
 * @property {{ x: number, y: number }} last Position au tick précédent.
 */

/**
 * Récolte en cours (R-RES-REC-006).
 * @typedef {object} Harvesting
 * @property {number} column
 * @property {number} row
 * @property {string | undefined} toolId Outil utilisé ; `undefined` à la main.
 * @property {number} startTick
 * @property {number} endTick Tick où la récolte s'achève.
 */

/**
 * Valeurs des règles, tirées des paramètres (spécification, partie C) et des données.
 * Elles ne font pas partie de l'état : une sauvegarde ne les contient pas.
 * @typedef {object} GameRules
 * @property {number} walkSpeed Distance parcourue par tick de marche (px).
 * @property {Size} hitbox Taille de la boîte de collision du joueur et des PNJ (px).
 * @property {number} harvestReach Portée de récolte (px, R-RES-REC-001).
 * @property {{ stuckTicks: number, attempts: number }} [travel] Chemins (R-JOU-DEP-004, 005).
 * @property {number} [handHarvestTicks] Durée d'une récolte à la main (R-RES-REC-006) ; absente,
 *   elle est immédiate.
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
 * @property {Readonly<Record<string, Readonly<import('../../../data/resources.js').ResourceDefinition>>>}
 *   [resources] Ressources, et ce qu'elles rendent de faim (R-JOU-MAN-001).
 * @property {import('../systems/needs.js').VitalRules} [vitals] Faim, santé, sommeil.
 * @property {{ speed: number, pauseMinutes: number }} [npcWalk] Promenades (R-PNJ-POS-003).
 * @property {import('../systems/experience.js').ExperienceRules} [experience] Expérience, niveaux.
 * @property {Readonly<Record<string, Readonly<import('../../../data/research.js').ResearchPlan>>>}
 *   [research] Plans de recherche (R-TEC-REC-002).
 * @property {import('../systems/blight.js').BlightRules} [blight] Lieux flétris, sauge.
 * @property {{ column: number, row: number, reach: number, lightRadius: number }} [hearth] Foyer.
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
 * @param {Harvesting} [params.harvesting]
 * @param {Travel} [params.travel]
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
 * @param {number} [params.health]
 * @param {number} [params.hunger]
 * @param {number} [params.energy]
 * @param {number[]} [params.purified]
 * @param {boolean} [params.inBlight]
 * @param {number} [params.tick]
 * @returns {GameState}
 */
export function createGameState(params) {
  const { map, player, inventory = createEmptyInventory(), dialogue, tick = 0 } = params;
  const { health = 100, hunger = 100, energy = 100, purified = [], inBlight = false } = params;
  return {
    tick,
    map,
    player,
    health,
    hunger,
    energy,
    purified: [...purified],
    inBlight,
    inventory: { ...inventory },
    dialogue: dialogue === undefined ? undefined : copyDialogue(dialogue),
    ...copyActivity(params),
    ...copyWorld(params),
    ...copyProgress(params),
    ...copyTime(params),
  };
}

/**
 * Ce que le héros est en train de faire : récolte et chemin, copiés.
 * @param {{ harvesting?: Harvesting, travel?: Travel }} params
 * @returns {Pick<GameState, 'harvesting' | 'travel'>}
 */
function copyActivity({ harvesting, travel }) {
  return {
    harvesting: harvesting === undefined ? undefined : { ...harvesting },
    travel:
      travel === undefined
        ? undefined
        : { ...travel, path: travel.path.map((tile) => ({ ...tile })), last: { ...travel.last } },
  };
}

/**
 * PNJ, journal et lieux où se trouve le joueur, copiés.
 * @param {{ npcs?: Npc[], journal?: JournalEntry[], currentPlaces?: string[] }} params
 * @returns {Pick<GameState, 'npcs' | 'journal' | 'currentPlaces'>}
 */
function copyWorld({ npcs = [], journal = [], currentPlaces = [] }) {
  return {
    npcs: npcs.map((npc) => ({
      ...npc,
      position: { ...npc.position },
      ...(npc.home === undefined ? {} : { home: { ...npc.home } }),
    })),
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
 *   quests?: QuestEntry[], experience?: number, discoveredPlans?: string[],
 *   researched?: string[], readBooks?: string[] }} params
 * @returns {Pick<GameState, 'books' | 'tools' | 'knownRecipes' | 'items' | 'quests'
 *   | 'experience' | 'discoveredPlans' | 'researched' | 'readBooks'>}
 */
function copyProgress({
  books = [],
  tools = [],
  knownRecipes = [],
  items = [],
  quests = [],
  experience = 0,
  discoveredPlans = [],
  researched = [],
  readBooks = [],
}) {
  return {
    readBooks: [...readBooks],
    discoveredPlans: [...discoveredPlans],
    researched: [...researched],
    books: [...books],
    tools: [...tools],
    knownRecipes: [...knownRecipes],
    items: [...items],
    quests: quests.map((quest) => ({ ...quest })),
    experience,
  };
}

/**
 * R-PNJ-POS-001 : PNJ au centre de sa tuile, orienté comme dans les données ; il commence sa
 * promenade par une pause (R-PNJ-POS-003).
 * @param {Readonly<NpcDefinition>} definition
 * @param {number} tileSize
 * @param {number} [pauseUntil] Horloge (ticks) de fin de la première pause.
 * @returns {Npc}
 */
export function createNpc(definition, tileSize, pauseUntil = 0) {
  const half = tileSize / 2;
  const home = {
    x: definition.tile.column * tileSize + half,
    y: definition.tile.row * tileSize + half,
  };
  return {
    id: definition.id,
    position: { ...home },
    facing: definition.facing,
    home,
    step: 0,
    pauseUntil,
    isWalking: false,
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
