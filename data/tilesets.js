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
 * @property {number} [regrowDays] Jours de jeu avant que l'élément repousse (R-RES-REC-005).
 * @property {import('./tools.js').ToolKind} [boostedBy] Sorte d'outil dont le bonus s'ajoute au
 *   rendement (R-RES-OUT-002).
 * @property {import('./tools.js').ToolKind} [tool] Sorte d'outil exigée (R-RES-OUT-001) ;
 *   absente, la récolte se fait à la main.
 * @property {Readonly<{ resource: string, amount: number }>} [extra] Ce que l'élément donne en
 *   plus, sans bonus d'outil (les branches d'un arbre, R-RES-REC-002).
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
 * @property {boolean} [canPlace] `true` si l'on peut y poser un objet (R-ART-POS-001).
 * @property {boolean} [isCampfire] `true` pour un feu de camp posé (R-ART-FEU-001).
 * @property {boolean} [isHearth] `true` pour le Foyer (R-MON-FOY-001).
 */

/**
 * @param {string} id
 * @param {string} symbol
 * @param {{ isBlocking?: boolean, isStanding?: boolean, harvest?: HarvestDefinition,
 *   search?: { becomes: string }, canPlace?: boolean, isCampfire?: boolean,
 *   isHearth?: boolean }} [options]
 * @returns {Readonly<TileDefinition>}
 */
function tile(id, symbol, options = {}) {
  const { isBlocking = false, isStanding = false, harvest, search, ...flags } = options;
  return Object.freeze({
    id,
    symbol,
    isBlocking,
    isStanding,
    ...flags,
    ...(harvest === undefined ? {} : { harvest: Object.freeze(harvest) }),
    ...(search === undefined ? {} : { search: Object.freeze(search) }),
  });
}

/** Élément debout et infranchissable des ruines. */
const FURNITURE = Object.freeze({ isBlocking: true, isStanding: true });

/** @type {Readonly<Record<string, Readonly<TileDefinition>>>} */
export const TILE_DEFINITIONS = Object.freeze({
  grass: tile('grass', '.', { canPlace: true }),
  flowers: tile('flowers', ',', {
    harvest: {
      action: 'pick',
      resource: 'flower',
      amount: GAME_PARAMETERS.FLOWERS_YIELD,
      becomes: 'grass',
    },
  }),
  path: tile('path', '=', { canPlace: true }),
  water: tile('water', '~', { isBlocking: true }),
  tree: tile('tree', 'T', {
    isBlocking: true,
    isStanding: true,
    harvest: {
      action: 'cut',
      tool: 'axe',
      boostedBy: 'axe',
      resource: 'wood',
      amount: GAME_PARAMETERS.TREE_WOOD_YIELD,
      extra: Object.freeze({ resource: 'branch', amount: GAME_PARAMETERS.TREE_BRANCH_YIELD }),
      becomes: 'stump',
      regrowDays: GAME_PARAMETERS.TREE_REGROW_DAYS,
    },
  }),
  rock: tile('rock', 'o', {
    isBlocking: true,
    isStanding: true,
    harvest: {
      action: 'mine',
      tool: 'pickaxe',
      boostedBy: 'pickaxe',
      resource: 'stone',
      amount: GAME_PARAMETERS.ROCK_STONE_YIELD,
      becomes: 'grass',
    },
  }),
  stump: tile('stump', 's'),
  // Cueillette (C-RES-09) : un buisson à baies, puis sans baies ; des champignons.
  'berry-bush': tile('berry-bush', 'u', {
    isBlocking: true,
    isStanding: true,
    harvest: {
      action: 'pick',
      resource: 'berry',
      boostedBy: 'bag',
      amount: GAME_PARAMETERS.BERRY_YIELD,
      becomes: 'bush',
      regrowDays: GAME_PARAMETERS.BUSH_REGROW_DAYS,
    },
  }),
  bush: tile('bush', 'v', { isBlocking: true, isStanding: true }),
  mushrooms: tile('mushrooms', 'm', {
    harvest: {
      action: 'pick',
      resource: 'mushroom',
      boostedBy: 'bag',
      amount: GAME_PARAMETERS.MUSHROOM_YIELD,
      becomes: 'grass',
      regrowDays: GAME_PARAMETERS.MUSHROOM_REGROW_DAYS,
    },
  }),
  // Hautes herbes (C-RES-10) : des fibres, à la main.
  'tall-grass': tile('tall-grass', '"', {
    harvest: {
      action: 'pick',
      resource: 'fiber',
      amount: GAME_PARAMETERS.TALL_GRASS_FIBER_YIELD,
      becomes: 'grass',
      regrowDays: GAME_PARAMETERS.TALL_GRASS_REGROW_DAYS,
    },
  }),
  // Objet posé (R-ART-POS-001) : un feu de camp, allumé ou éteint selon l'horloge (R-ART-FEU-001).
  campfire: tile('campfire', 'F', { isBlocking: true, isCampfire: true }),
  // Le Foyer du Vallon (R-MON-FOY-001), toujours allumé.
  hearth: tile('hearth', 'H', { isBlocking: true, isHearth: true }),
  // Sauge de l'aube (C-MEN-08), en lisière des zones flétries.
  'dawn-sage': tile('dawn-sage', 'w', {
    harvest: {
      action: 'pick',
      resource: 'sage',
      amount: GAME_PARAMETERS.SAGE_YIELD,
      becomes: 'grass',
      regrowDays: GAME_PARAMETERS.SAGE_REGROW_DAYS,
    },
  }),
  // Ruines (C-MON-07) : un dallage franchissable et des vestiges debout (piliers, gravats).
  'ruin-floor': tile('ruin-floor', '_', { canPlace: true }),
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
