// @ts-check
import { GAME_PARAMETERS } from './gameParameters.js';

/**
 * Types de tuiles du terrain et leurs propriétés métier.
 *
 * Le métier ne connaît que ces propriétés, jamais l'image : l'apparence de chaque type est dans
 * data/terrainAppearance.js. Les noms affichés sont dans src/presentation/i18n/fr.js.
 */

/**
 * Ce que donne la récolte d'une tuile (R-RES-ELE-001).
 * @typedef {object} HarvestDefinition
 * @property {'cut' | 'mine' | 'pick'} action Couper, piocher ou ramasser.
 * @property {string} resource Ressource obtenue (clé de data/resources.js).
 * @property {number} amount Rendement.
 * @property {string} becomes Type de tuile laissé après la récolte (R-RES-REC-003).
 * @property {import('./tools.js').ToolKind} [tool] Sorte d'outil exigée (R-RES-OUT-001) ;
 *   absente, la récolte se fait à la main.
 */

/**
 * @typedef {object} TileDefinition
 * @property {string} id Identifiant unique, kebab-case.
 * @property {string} symbol Caractère qui représente la tuile dans les cartes de data/maps/.
 * @property {boolean} isBlocking `true` si la tuile est infranchissable (R-MON-COL-001).
 * @property {boolean} isStanding `true` si la tuile porte un élément debout (arbre, rocher),
 *   dessiné en profondeur avec les personnages (R-IHM-AFF-002).
 * @property {Readonly<HarvestDefinition>} [harvest] Présent si la tuile est récoltable.
 * @property {Readonly<{ becomes: string }>} [search] Présent si la tuile se fouille
 *   (R-RES-FOU-001) : type de tuile laissé après la fouille (R-RES-FOU-004).
 */

/**
 * @param {string} id
 * @param {string} symbol
 * @param {{ isBlocking?: boolean, isStanding?: boolean, harvest?: HarvestDefinition,
 *   search?: { becomes: string } }} [options]
 * @returns {Readonly<TileDefinition>}
 */
function tile(id, symbol, { isBlocking = false, isStanding = false, harvest, search } = {}) {
  return Object.freeze({
    id,
    symbol,
    isBlocking,
    isStanding,
    ...(harvest === undefined ? {} : { harvest: Object.freeze(harvest) }),
    ...(search === undefined ? {} : { search: Object.freeze(search) }),
  });
}

/** Élément debout et infranchissable des ruines. */
const FURNITURE = Object.freeze({ isBlocking: true, isStanding: true });

/** @type {Readonly<Record<string, Readonly<TileDefinition>>>} */
export const TILE_DEFINITIONS = Object.freeze({
  grass: tile('grass', '.'),
  flowers: tile('flowers', ',', {
    harvest: {
      action: 'pick',
      resource: 'flower',
      amount: GAME_PARAMETERS.FLOWERS_YIELD,
      becomes: 'grass',
    },
  }),
  path: tile('path', '='),
  water: tile('water', '~', { isBlocking: true }),
  tree: tile('tree', 'T', {
    isBlocking: true,
    isStanding: true,
    harvest: {
      action: 'cut',
      tool: 'axe',
      resource: 'wood',
      amount: GAME_PARAMETERS.TREE_WOOD_YIELD,
      becomes: 'stump',
    },
  }),
  rock: tile('rock', 'o', {
    isBlocking: true,
    isStanding: true,
    harvest: {
      action: 'mine',
      tool: 'pickaxe',
      resource: 'stone',
      amount: GAME_PARAMETERS.ROCK_STONE_YIELD,
      becomes: 'grass',
    },
  }),
  stump: tile('stump', 's'),
  // Ruines (C-MON-07) : un dallage franchissable et des vestiges debout (piliers, gravats).
  'ruin-floor': tile('ruin-floor', '_'),
  ruin: tile('ruin', '#', { isBlocking: true, isStanding: true }),
  // Éléments à fouiller (R-RES-FOU-001), puis fouillés (R-RES-FOU-004).
  'ruin-bookshelf': tile('ruin-bookshelf', 'B', {
    ...FURNITURE,
    search: { becomes: 'ruin-bookshelf-searched' },
  }),
  'ruin-bookshelf-searched': tile('ruin-bookshelf-searched', 'b', FURNITURE),
  'ruin-chest': tile('ruin-chest', 'C', { ...FURNITURE, search: { becomes: 'ruin-chest-open' } }),
  'ruin-chest-open': tile('ruin-chest-open', 'c', FURNITURE),
  'ruin-crate': tile('ruin-crate', 'K', { ...FURNITURE, search: { becomes: 'ruin-crate-empty' } }),
  'ruin-crate-empty': tile('ruin-crate-empty', 'k', FURNITURE),
});
