// @ts-check
import { INTERIOR_SPRITES } from './interiorSprites.js';

/**
 * Catalogue de la planche de tuiles principale (assets/images/tilesets/tileset-main.png,
 * 1024 × 2016 px = 32 × 63 tuiles de 32 px), issue de RPG Maker.
 *
 * Les positions sont en **tuiles** (colonne, ligne, à partir de 0) ; une entrée peut couvrir
 * plusieurs tuiles (`width` × `height`). Le catalogue se parcourt visuellement dans
 * tools/catalog/index.html.
 *
 * Deux sortes d'entrées :
 * - `AUTOTILES` : blocs de 2 × 3 tuiles au format RPG Maker VX, d'où l'on recompose les bordures
 *   d'un terrain quart de tuile par quart de tuile (src/presentation/renderers/autotile.js) ;
 * - `SPRITES` : tuiles et objets dessinés tels quels, ancrés par le milieu de leur bord inférieur.
 */

/**
 * @typedef {'ground' | 'texture' | 'plant' | 'flower' | 'tree' | 'rock' | 'crop' | 'object'
 *   | 'building' | 'furniture' | 'item'} SpriteCategory
 */

/**
 * @typedef {object} SpriteDefinition
 * @property {number} column Colonne de la tuile en haut à gauche.
 * @property {number} row Ligne de la tuile en haut à gauche.
 * @property {number} width Largeur (tuiles).
 * @property {number} height Hauteur (tuiles).
 * @property {SpriteCategory} category
 * @property {string} [sheet] Planche (clé de TILESETS) ; la planche principale par défaut.
 */

/**
 * @typedef {object} AutotileDefinition
 * @property {number} column Colonne du bloc de 2 × 3 tuiles (première image s'il est animé).
 * @property {number} row Ligne du bloc.
 * @property {number} frames Nombre d'images d'animation, côte à côte (1 si fixe).
 */

/**
 * @param {number} column
 * @param {number} row
 * @param {SpriteCategory} category
 * @param {[number, number]} [size] Largeur et hauteur (tuiles), 1 × 1 par défaut.
 * @returns {Readonly<SpriteDefinition>}
 */
function sprite(column, row, category, [width, height] = [1, 1]) {
  return Object.freeze({ column, row, width, height, category });
}

/**
 * @param {number} column
 * @param {number} row
 * @param {number} [frames]
 * @returns {Readonly<AutotileDefinition>}
 */
function autotile(column, row, frames = 1) {
  return Object.freeze({ column, row, frames });
}

/** Planche : image et dimensions. */
export const TILESET_MAIN = Object.freeze({
  image: 'assets/images/tilesets/tileset-main.png',
  tileSize: 32,
  columns: 32,
  rows: 63,
});

/**
 * Planches de tuiles de 32 px, par clé. Les planches « interior-* » sont des planches RPG Maker MV
 * de 48 px réduites à 32 px par tools/assets/downscaleTileset.js (originaux dans mv-48px/).
 */
export const TILESETS = Object.freeze({
  main: TILESET_MAIN,
  'interior-abandoned': interiorSheet('interior-abandoned'),
  'interior-haunted': interiorSheet('interior-haunted'),
  'interior-steampunk': interiorSheet('interior-steampunk'),
});

/**
 * @param {string} name
 * @returns {Readonly<{ image: string, tileSize: number, columns: number, rows: number }>}
 */
function interiorSheet(name) {
  return Object.freeze({
    image: `assets/images/tilesets/${name}.png`,
    tileSize: 32,
    columns: 16,
    rows: 16,
  });
}

/** @type {Readonly<Record<string, Readonly<AutotileDefinition>>>} */
export const AUTOTILES = Object.freeze({
  grass: autotile(0, 15),
  dirt: autotile(0, 18),
  bush: autotile(2, 15),
  wheat: autotile(2, 18),
  'deep-water': autotile(16, 28, 3),
  'shallow-water': autotile(24, 28, 3),
});

/** @type {Readonly<Record<string, Readonly<SpriteDefinition>>>} */
export const SPRITES = Object.freeze({
  ...INTERIOR_SPRITES,
  // Sols : une tuile qui se répète sans raccord visible.
  'ground-flagstone': sprite(0, 2, 'ground'),
  'ground-cobble-orange': sprite(1, 2, 'ground'),
  'ground-tiles-yellow': sprite(2, 2, 'ground'),
  'ground-flagstone-yellow': sprite(3, 2, 'ground'),
  'ground-cobble-beige': sprite(4, 2, 'ground'),
  'ground-cobble-grey': sprite(5, 2, 'ground'),
  'ground-grass-light': sprite(6, 2, 'ground'),
  'ground-water': sprite(7, 2, 'ground'),
  'ground-grass': sprite(8, 2, 'ground'),
  'ground-sand': sprite(9, 2, 'ground'),
  'ground-gravel': sprite(10, 2, 'ground'),
  'ground-planks': sprite(12, 2, 'ground'),
  'ground-wicker': sprite(13, 2, 'ground'),
  'ground-parquet': sprite(14, 2, 'ground'),
  'ground-cobble-dark': sprite(15, 2, 'ground'),
  'ground-field': sprite(8, 3, 'ground'),
  'ground-stone-blocks': sprite(12, 3, 'ground'),
  'ground-dirt-stones': sprite(0, 12, 'ground'),
  'ground-rubble': sprite(1, 12, 'ground'),
  'ground-lava': sprite(2, 12, 'ground'),
  'ground-ice': sprite(3, 12, 'ground'),

  // Textures de 2 × 2 tuiles, qui se répètent par blocs.
  'texture-sand': sprite(16, 10, 'texture', [2, 2]),
  'texture-scree': sprite(18, 10, 'texture', [2, 2]),
  'texture-magma': sprite(20, 10, 'texture', [2, 2]),
  'texture-ice': sprite(22, 10, 'texture', [2, 2]),
  'texture-vines': sprite(24, 10, 'texture', [2, 2]),
  'texture-crystal': sprite(26, 10, 'texture', [2, 2]),
  'texture-red-earth': sprite(28, 10, 'texture', [2, 2]),
  'texture-blight': sprite(30, 10, 'texture', [2, 2]),
  'texture-moss': sprite(28, 0, 'texture', [2, 2]),
  'texture-roof-red': sprite(16, 20, 'texture', [2, 2]),
  'texture-roof-yellow': sprite(18, 20, 'texture', [2, 2]),
  'texture-roof-green': sprite(20, 20, 'texture', [2, 2]),
  'texture-thatch': sprite(28, 20, 'texture', [2, 2]),

  // Petites plantes et fleurs (au sol, franchissables).
  'grass-tuft': sprite(0, 32, 'plant'),
  'fern-small': sprite(1, 32, 'plant'),
  weeds: sprite(2, 32, 'plant'),
  clover: sprite(3, 32, 'plant'),
  'grass-clump': sprite(0, 38, 'plant'),
  'grass-clump-2': sprite(1, 38, 'plant'),
  'grass-clump-3': sprite(2, 38, 'plant'),
  'grass-clump-4': sprite(3, 38, 'plant'),
  'grass-tall': sprite(3, 41, 'plant'),
  'grass-dry': sprite(7, 35, 'plant'),
  'grass-yellow': sprite(7, 36, 'plant'),
  'fern-sprouts': sprite(0, 42, 'plant'),
  agave: sprite(1, 42, 'plant'),
  'bush-leafy': sprite(2, 42, 'plant'),
  'bush-dense': sprite(3, 42, 'plant'),
  fern: sprite(6, 36, 'plant'),
  'bush-dry': sprite(3, 37, 'plant'),
  'dead-leaves': sprite(4, 37, 'plant'),
  'lily-pads': sprite(5, 37, 'plant'),
  'lotus-flowers': sprite(6, 37, 'plant'),
  'lily-pad': sprite(7, 37, 'plant'),
  'big-leaves': sprite(5, 52, 'plant'),
  'grass-bush': sprite(5, 53, 'plant'),
  'flowers-yellow': sprite(0, 33, 'flower'),
  'flowers-white': sprite(1, 33, 'flower'),
  'flower-red': sprite(2, 33, 'flower'),
  'flowers-yellow-bush': sprite(3, 33, 'flower'),
  'flowers-orange': sprite(2, 37, 'flower'),
  'flowers-pink-bush': sprite(5, 36, 'flower'),
  'flowers-white-patch': sprite(4, 42, 'flower'),
  'flowers-yellow-patch': sprite(5, 42, 'flower'),
  rafflesia: sprite(2, 36, 'flower'),
  mushrooms: sprite(2, 35, 'plant'),
  'mushrooms-red': sprite(3, 35, 'plant'),
  'vine-green': sprite(0, 40, 'plant', [1, 2]),
  'vine-dead': sprite(1, 40, 'plant', [1, 2]),
  'vine-climbing': sprite(2, 40, 'plant', [1, 2]),

  // Arbres et buissons (debout).
  'tree-round': sprite(5, 32, 'tree', [1, 2]),
  'bush-cone': sprite(6, 33, 'tree'),
  'tree-big': sprite(6, 42, 'tree', [2, 2]),
  'forest-canopy': sprite(6, 44, 'tree', [2, 2]),
  cypress: sprite(2, 44, 'tree', [1, 2]),
  'bush-round-big': sprite(4, 44, 'tree'),
  'tree-leafy': sprite(5, 44, 'tree', [1, 2]),
  'bush-pink-flowers': sprite(3, 44, 'tree'),
  'tree-dead': sprite(0, 45, 'tree', [2, 2]),
  'pine-big': sprite(0, 47, 'tree', [2, 2]),
  'pine-grove': sprite(2, 46, 'tree', [2, 2]),
  'bush-round': sprite(0, 39, 'tree'),
  'bush-round-2': sprite(1, 39, 'tree'),
  'bush-round-3': sprite(2, 39, 'tree'),
  'tree-bare': sprite(3, 39, 'tree'),
  palm: sprite(4, 38, 'tree'),
  'palm-light': sprite(5, 38, 'tree'),
  'tree-dead-tangle': sprite(4, 39, 'tree'),
  'tree-dead-mossy': sprite(5, 39, 'tree'),
  'pine-snowy': sprite(6, 38, 'tree', [1, 2]),
  'palm-big': sprite(3, 51, 'tree', [2, 3]),
  'dead-bush': sprite(0, 35, 'tree'),
  'dead-bush-2': sprite(1, 35, 'tree'),
  'tree-dead-small': sprite(0, 36, 'tree'),
  'palm-small': sprite(4, 35, 'tree'),
  'palm-small-2': sprite(5, 35, 'tree'),
  cactus: sprite(6, 35, 'tree'),
  'cactus-big': sprite(7, 51, 'tree'),
  'cactus-flat': sprite(6, 51, 'tree'),
  stump: sprite(4, 32, 'tree'),
  'stump-mossy': sprite(2, 43, 'tree'),
  'stump-cut': sprite(3, 43, 'tree'),
  'stump-axe': sprite(4, 43, 'tree'),
  'stump-tall': sprite(5, 43, 'tree'),
  'log-small': sprite(4, 33, 'tree'),
  'log-mossy': sprite(4, 46, 'tree', [2, 1]),
  'log-hollow': sprite(6, 46, 'tree', [2, 1]),

  // Rochers et minerais (debout).
  'rock-grey': sprite(7, 32, 'rock'),
  'rock-brown': sprite(7, 33, 'rock'),
  'rock-white': sprite(4, 47, 'rock'),
  'rocks-white-small': sprite(5, 47, 'rock'),
  pebbles: sprite(3, 34, 'rock'),
  'ore-copper': sprite(0, 58, 'rock'),
  'ore-iron': sprite(1, 58, 'rock'),
  'ore-coal': sprite(2, 58, 'rock'),
  'ore-silver': sprite(3, 58, 'rock'),
  'ore-emerald': sprite(4, 58, 'rock'),
  'ore-sapphire': sprite(5, 58, 'rock'),
  'ore-amber': sprite(6, 58, 'rock'),
  'ore-amethyst': sprite(7, 58, 'rock'),
  'crystal-copper': sprite(0, 56, 'rock'),
  'crystal-iron': sprite(1, 56, 'rock'),
  'crystal-coal': sprite(2, 56, 'rock'),
  'crystal-silver': sprite(3, 56, 'rock'),
  'crystal-emerald': sprite(4, 56, 'rock'),
  'crystal-sapphire': sprite(5, 56, 'rock'),
  'crystal-amber': sprite(6, 56, 'rock'),
  'crystal-amethyst': sprite(7, 56, 'rock'),
  'nuggets-copper': sprite(0, 57, 'rock'),
  'nuggets-iron': sprite(1, 57, 'rock'),
  'nuggets-coal': sprite(2, 57, 'rock'),
  'nuggets-silver': sprite(3, 57, 'rock'),
  'boulder-grey': sprite(8, 57, 'rock'),
  'boulder-mossy': sprite(9, 57, 'rock'),
  'boulder-pale': sprite(10, 57, 'rock'),

  // Cultures.
  'crop-tomato': sprite(4, 34, 'crop'),
  'crop-tomato-2': sprite(5, 34, 'crop'),
  'crop-sprouts': sprite(6, 34, 'crop'),
  'crop-cabbage': sprite(7, 34, 'crop'),
  'crop-young': sprite(6, 52, 'crop'),
  'crop-lettuce': sprite(7, 52, 'crop'),
  'crop-seedlings': sprite(6, 53, 'crop'),
  'crop-tomato-ripe': sprite(7, 53, 'crop'),
  melon: sprite(5, 51, 'crop'),

  // Objets d'extérieur.
  'fence-rail': sprite(0, 31, 'object'),
  'sign-board': sprite(1, 31, 'object'),
  'wood-basket': sprite(2, 31, 'object'),
  'well-stone': sprite(3, 31, 'object'),
  'stepping-stones': sprite(4, 31, 'object'),
  barrel: sprite(5, 31, 'object'),
  'grave-cross': sprite(6, 31, 'object'),
  tombstone: sprite(7, 31, 'object'),
  scarecrow: sprite(0, 34, 'object'),
  'hole-dug': sprite(1, 34, 'object'),
  'woodpile-stack': sprite(2, 34, 'object'),
  'hay-pile': sprite(0, 37, 'object'),
  'signpost-arrow': sprite(0, 43, 'object'),
  signpost: sprite(1, 43, 'object'),
  noticeboard: sprite(0, 44, 'object', [2, 1]),
  'grave-wood': sprite(6, 47, 'object'),
  'grave-flowers': sprite(7, 47, 'object'),
  'well-frame': sprite(2, 48, 'object', [2, 3]),
  'well-open': sprite(0, 49, 'object', [2, 2]),
  lamppost: sprite(4, 48, 'object', [1, 3]),
  'firewood-stumps': sprite(5, 48, 'object'),
  'firewood-split': sprite(6, 48, 'object'),
  woodpile: sprite(7, 48, 'object'),
  'planter-empty': sprite(5, 49, 'object'),
  'flower-box': sprite(6, 49, 'object'),
  'flower-box-2': sprite(7, 49, 'object'),
  'pots-empty': sprite(5, 50, 'object'),
  'pots-dry': sprite(6, 50, 'object'),
  'pots-planted': sprite(7, 50, 'object'),
  'bench-planks': sprite(0, 51, 'object', [1, 3]),
  'scarecrow-straw': sprite(1, 51, 'object', [1, 2]),
  'logs-standing': sprite(2, 51, 'object', [1, 2]),
  'logs-lying': sprite(1, 53, 'object', [2, 1]),
  'mound-dirt': sprite(0, 54, 'object'),
  'mound-sand': sprite(1, 54, 'object'),
  'gate-wood': sprite(2, 54, 'object'),
  'easel-wood': sprite(3, 54, 'object'),
  'campfire-ring': sprite(2, 55, 'object'),
  campfire: sprite(3, 55, 'object'),
  pit: sprite(4, 55, 'object'),
  'pit-dark': sprite(5, 55, 'object'),
  'bucket-water': sprite(10, 48, 'object'),
  'bucket-empty': sprite(11, 48, 'object'),
  'basket-hay': sprite(12, 48, 'object'),
  'basin-grass': sprite(8, 49, 'object'),
  'basin-fern': sprite(9, 49, 'object'),
  pitchfork: sprite(10, 49, 'object'),
  haystack: sprite(11, 49, 'object', [2, 2]),
  clothesline: sprite(13, 48, 'object', [3, 2]),
  'bush-trimmed': sprite(10, 50, 'object'),
  'rose-bush': sprite(10, 51, 'object'),
  'rose-branch': sprite(11, 51, 'object'),
  'statue-hooded': sprite(8, 50, 'object', [1, 2]),
  'pillar-broken': sprite(9, 50, 'object', [1, 2]),
  'tub-wood': sprite(13, 50, 'object'),
  fireplace: sprite(12, 52, 'building', [2, 2]),
  'oven-stone': sprite(14, 52, 'building', [1, 2]),
  'oven-brick': sprite(15, 52, 'building', [1, 2]),
  'fence-wood': sprite(8, 58, 'object', [4, 2]),

  // Mobilier et réserves.
  sack: sprite(20, 37, 'furniture'),
  'sack-grain': sprite(21, 37, 'furniture'),
  'sacks-stacked': sprite(22, 36, 'furniture', [1, 2]),
  crate: sprite(23, 36, 'furniture'),
  'crate-dark': sprite(23, 37, 'furniture'),
  'crate-empty': sprite(21, 40, 'furniture'),
  'crate-corn': sprite(20, 36, 'furniture'),
  'crate-fish': sprite(21, 36, 'furniture'),
  'barrels-pile': sprite(24, 38, 'furniture', [2, 2]),
  'barrel-big': sprite(26, 38, 'furniture'),
  'barrel-big-2': sprite(26, 39, 'furniture'),
  'jars-stacked': sprite(27, 38, 'furniture', [1, 2]),
  jar: sprite(24, 40, 'furniture'),
  'jar-lidded': sprite(25, 40, 'furniture'),
  'jar-broken': sprite(26, 40, 'furniture'),
  'basket-wicker': sprite(26, 41, 'furniture'),
  'basket-apples': sprite(27, 41, 'furniture'),
  'crates-apples': sprite(22, 40, 'furniture'),
  'crates-potatoes': sprite(20, 41, 'furniture'),
  'crates-fish': sprite(21, 41, 'furniture'),
  'crates-greens': sprite(22, 41, 'furniture'),
  'bed-pink': sprite(16, 44, 'furniture', [1, 2]),
  'bed-double': sprite(17, 44, 'furniture', [2, 2]),
  'bed-straw': sprite(19, 44, 'furniture', [1, 2]),
  'cupboard-green': sprite(16, 48, 'furniture', [2, 2]),
  'table-small': sprite(18, 48, 'furniture'),
  'table-flowers': sprite(19, 48, 'furniture'),
  'flowers-vase': sprite(20, 48, 'furniture'),
  'potted-tulips': sprite(21, 48, 'furniture'),
  'roast-chicken': sprite(22, 48, 'item'),
  'meal-plate': sprite(23, 48, 'item'),
  'basket-bread': sprite(25, 48, 'item'),
  'basket-potatoes': sprite(26, 48, 'item'),
  'bucket-wood': sprite(27, 48, 'furniture'),
  'potted-palm': sprite(18, 57, 'furniture', [1, 2]),
  'potted-plant': sprite(19, 57, 'furniture', [1, 2]),
  'chair-wood': sprite(20, 50, 'furniture'),

  // Objets et outils.
  shovel: sprite(13, 60, 'item'),
  pickaxe: sprite(14, 60, 'item'),
  rope: sprite(15, 60, 'item'),
  hammers: sprite(16, 60, 'item'),
  'gold-pile': sprite(22, 61, 'item', [2, 2]),
  'gold-bars': sprite(20, 62, 'item', [2, 1]),
  'gold-small-pile': sprite(16, 61, 'item'),
  'silver-small-pile': sprite(17, 61, 'item'),
  'wood-small-pile': sprite(16, 62, 'item'),
  'stone-small-pile': sprite(17, 62, 'item'),
  'coins-gold': sprite(23, 58, 'item'),
  'shield-red': sprite(28, 50, 'item'),
  'shield-round': sprite(29, 50, 'item'),
  'chest-gold': sprite(30, 50, 'item'),
  'chest-open': sprite(31, 50, 'item'),
  'swords-rack': sprite(28, 52, 'item'),
  'swords-crossed': sprite(29, 52, 'item'),
});
