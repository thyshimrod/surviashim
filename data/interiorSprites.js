// @ts-check

/**
 * Sprites des ruines et des planches d'intérieur (tilesets RPG Maker MV réduits à 32 px) : vestiges,
 * éléments à fouiller, livres, tombes… Même format que SPRITES (data/tileset.js), avec la planche
 * en plus. Positions en tuiles de 32 px.
 */

/** @typedef {import('./tileset.js').SpriteDefinition} SpriteDefinition */
/** @typedef {import('./tileset.js').SpriteCategory} SpriteCategory */

/**
 * @param {string} sheet Clé de TILESETS.
 * @returns {(column: number, row: number, category: SpriteCategory, size?: [number, number]) =>
 *   Readonly<SpriteDefinition>}
 */
function on(sheet) {
  return (column, row, category, [width, height] = [1, 1]) =>
    Object.freeze({ column, row, width, height, category, sheet });
}

const main = on('main');
const abandoned = on('interior-abandoned');
const haunted = on('interior-haunted');
const steampunk = on('interior-steampunk');

/** @type {Readonly<Record<string, Readonly<SpriteDefinition>>>} */
export const INTERIOR_SPRITES = Object.freeze({
  // Vestiges des ruines (C-MON-07).
  'ruin-pillar': main(8, 54, 'building', [1, 2]),
  'ruin-column': main(9, 54, 'building', [1, 2]),
  'ruin-pillar-square': main(10, 54, 'building', [1, 2]),
  'ruin-pillar-mossy': main(11, 54, 'building', [1, 2]),
  'ruin-pillar-carved': main(14, 54, 'building', [1, 2]),
  'ruin-pedestal-orb': main(15, 54, 'building', [1, 2]),
  'ruin-rubble': main(8, 56, 'building'),
  'ruin-rubble-round': main(9, 56, 'building'),
  'ruin-rubble-broken': main(10, 56, 'building'),
  'ruin-rubble-mossy': main(11, 56, 'building'),
  'ruin-rubble-carved': main(14, 56, 'building'),
  'ruin-stub': main(15, 56, 'building'),
  'ruin-column-tall': main(14, 57, 'building', [1, 3]),
  'ruin-pillar-tall': main(15, 57, 'building', [1, 3]),

  // Éléments à fouiller (R-RES-FOU-001), intacts puis fouillés : une colonne d'étagère pleine de
  // livres, puis une colonne voisine envahie de toiles d'araignée. Une tuile de large : les
  // morceaux d'un meuble plus large se lisent mal (la moitié d'une bibliothèque voûtée
  // ressemblait à deux escaliers).
  'ruin-bookshelf': abandoned(7, 8, 'furniture', [1, 2]),
  'ruin-bookshelf-searched': abandoned(5, 8, 'furniture', [1, 2]),
  // Le coffre sombre des intérieurs se confondait avec le sol : le coffre doré de la planche
  // principale se repère tout de suite.
  'ruin-chest': main(30, 50, 'furniture'),
  'ruin-chest-open': main(31, 50, 'furniture'),
  'dark-chest': haunted(0, 11, 'furniture'),
  'dark-chest-empty': haunted(7, 11, 'furniture'),

  // Mobilier abandonné. Les bibliothèques voûtées font 2 tuiles de large : ne pas les couper.
  'vaulted-bookcase-grey': abandoned(1, 0, 'furniture', [2, 2]),
  'vaulted-bookcase': abandoned(3, 0, 'furniture', [2, 2]),
  'cobweb-bookcase': abandoned(6, 8, 'furniture', [2, 2]),
  'cobweb-cabinet': abandoned(4, 8, 'furniture', [2, 2]),
  'old-dresser': abandoned(0, 6, 'furniture', [2, 2]),
  'broken-jar': abandoned(10, 9, 'furniture'),
  'jar-old': abandoned(9, 9, 'furniture'),
  'jar-old-open': abandoned(8, 9, 'furniture'),
  'barrel-broken': abandoned(10, 10, 'furniture'),
  'barrel-old': abandoned(9, 10, 'furniture'),
  'stool-cobweb': abandoned(11, 10, 'furniture'),
  'table-cobweb': abandoned(11, 9, 'furniture'),
  'crate-broken': abandoned(11, 11, 'furniture'),
  'crate-cobweb': abandoned(11, 15, 'furniture'),
  'sack-old': abandoned(8, 15, 'furniture'),
  'sack-open-old': abandoned(9, 15, 'furniture'),
  'sacks-stack-old': abandoned(10, 14, 'furniture', [1, 2]),
  'rubble-grey': abandoned(15, 9, 'rock'),
  'rubble-brown': abandoned(15, 10, 'rock'),
  'rubble-planks': abandoned(15, 11, 'rock'),
  'pillar-old': abandoned(12, 9, 'building', [1, 2]),
  'pillar-old-square': abandoned(13, 9, 'building', [1, 2]),
  'gravestone-old': abandoned(0, 8, 'object'),
  'gravestone-tilted': abandoned(1, 8, 'object'),
  'grave-cross-old': abandoned(2, 8, 'object', [1, 2]),
  'celtic-cross': abandoned(3, 8, 'object', [1, 2]),
  'stained-glass': abandoned(3, 4, 'building', [1, 2]),

  // Livres, papiers et coffres.
  'book-closed-blue': haunted(0, 7, 'item'),
  'book-closed-dark': haunted(1, 7, 'item'),
  'book-open': haunted(4, 7, 'item'),
  'book-open-2': haunted(5, 7, 'item'),
  'book-standing': haunted(6, 7, 'item'),
  'papers-quill': haunted(0, 9, 'item'),
  'map-old': haunted(5, 9, 'item'),
  'letters-scattered': haunted(0, 10, 'item'),
  'scrolls-pile': haunted(3, 10, 'item'),
  'chest-junk': haunted(1, 11, 'furniture'),
  'chest-closed-2': haunted(2, 11, 'furniture'),
  'basket-empty-old': haunted(0, 13, 'furniture'),
  'basket-apples-old': haunted(2, 13, 'furniture'),
  'teddy-bear': haunted(0, 14, 'item'),
  'rag-doll-blue': haunted(5, 14, 'item'),
  'shovel-old': haunted(0, 15, 'item'),
  'pickaxe-old': haunted(1, 15, 'item'),
  'statue-angel': haunted(9, 5, 'building', [1, 2]),
  'statue-gargoyle': haunted(10, 10, 'building', [1, 2]),
  'tombstone-tall': haunted(10, 9, 'object'),
  pedestal: haunted(8, 10, 'building', [1, 2]),

  // Atelier (steampunk) : quelques pièces qui collent au médiéval.
  'clock-tall': steampunk(5, 6, 'furniture', [2, 3]),
  'barrel-iron': steampunk(3, 8, 'furniture'),
  'pipes-corner': steampunk(4, 14, 'object'),
});
