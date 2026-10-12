// @ts-check

/**
 * Apparence des types de tuiles (data/tilesets.js), dessinés avec la planche de data/tileset.js.
 */

/**
 * @typedef {object} TerrainAppearance
 * @property {string} [autotile] Terrain dessiné au sol (clé de AUTOTILES).
 * @property {string} [ground] Sol dessiné avec une tuile simple (clé de SPRITES), sans bordure,
 *   à la place d'un autotile.
 * @property {boolean} [seamless] Toujours dessiné en intérieur, sans bordure.
 * @property {string} [under] Terrain dessiné dessous (clé de AUTOTILES).
 * @property {readonly string[]} [decor] Petits sprites au sol, l'un d'eux tiré par tuile.
 * @property {readonly string[]} [standing] Sprites debout, l'un d'eux tiré par tuile.
 * @property {readonly string[]} [sprinkle] Sprites semés sur une partie des tuiles.
 */

/**
 * Apparence de chaque type de tuile de data/tilesets.js.
 * - `autotile` : terrain dessiné au sol ; `seamless` : toujours dessiné en intérieur, sans bordure
 *   (les bordures viennent alors des terrains voisins) ; `under` : sol dessiné dessous ;
 * - `decor` : petits sprites posés au sol (l'un d'eux est tiré pour chaque tuile) ;
 * - `standing` : sprites debout possibles (l'un d'eux est tiré pour chaque tuile) ;
 * - `sprinkle` : sprites semés sur une partie des tuiles, pour varier le sol.
 * Les tirages sont stables : une tuile garde toujours le même aspect.
 * @type {Readonly<Record<string, Readonly<TerrainAppearance>>>}
 */
export const TERRAIN_APPEARANCE = Object.freeze({
  grass: Object.freeze({
    autotile: 'grass',
    sprinkle: Object.freeze(['grass-tuft', 'fern-small', 'clover', 'weeds']),
  }),
  flowers: Object.freeze({
    autotile: 'grass',
    decor: Object.freeze([
      'flowers-yellow',
      'flowers-white',
      'flower-red',
      'flowers-orange',
      'flowers-white-patch',
      'mushrooms',
    ]),
  }),
  path: Object.freeze({ autotile: 'dirt', seamless: true }),
  stump: Object.freeze({ autotile: 'grass', decor: Object.freeze(['stump-cut']) }),
  campfire: Object.freeze({ autotile: 'grass', decor: Object.freeze(['campfire']) }),
  'ruin-floor': Object.freeze({
    ground: 'ground-flagstone',
    sprinkle: Object.freeze(['pebbles', 'grass-tuft', 'weeds']),
  }),
  'ruin-bookshelf': Object.freeze({
    ground: 'ground-flagstone',
    standing: Object.freeze(['ruin-bookshelf']),
  }),
  'ruin-bookshelf-searched': Object.freeze({
    ground: 'ground-flagstone',
    standing: Object.freeze(['ruin-bookshelf-searched']),
  }),
  'ruin-chest': Object.freeze({
    ground: 'ground-flagstone',
    standing: Object.freeze(['ruin-chest']),
  }),
  'ruin-chest-open': Object.freeze({
    ground: 'ground-flagstone',
    standing: Object.freeze(['ruin-chest-open']),
  }),
  'ruin-crate': Object.freeze({ ground: 'ground-flagstone', standing: Object.freeze(['crate']) }),
  'ruin-crate-empty': Object.freeze({
    ground: 'ground-flagstone',
    standing: Object.freeze(['crate-empty']),
  }),
  ruin: Object.freeze({
    ground: 'ground-flagstone',
    standing: Object.freeze([
      'ruin-pillar',
      'ruin-column',
      'ruin-pillar-square',
      'ruin-pillar-mossy',
      'ruin-rubble',
      'ruin-rubble-round',
      'ruin-rubble-broken',
      'ruin-rubble-mossy',
      'ruin-stub',
      'ruin-column-tall',
    ]),
  }),
  water: Object.freeze({ autotile: 'shallow-water', under: 'dirt' }),
  tree: Object.freeze({
    autotile: 'grass',
    standing: Object.freeze([
      'tree-round',
      'tree-leafy',
      'cypress',
      'bush-cone',
      'bush-round-big',
      'tree-big',
      'pine-big',
    ]),
  }),
  rock: Object.freeze({
    autotile: 'grass',
    standing: Object.freeze(['rock-grey', 'rock-brown', 'rock-white', 'boulder-mossy']),
  }),
});

/** Proportion des tuiles qui reçoivent un sprite `sprinkle`. */
export const SPRINKLE_RATIO = 0.08;
