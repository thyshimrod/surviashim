// @ts-check

/**
 * Atlas d'icônes (concept C-IHM-11) : la planche assets/images/ui/iconset.png contient environ
 * 10 000 icônes de 24 px, 16 par ligne. On nomme ici celles dont le jeu se sert ou se servira ;
 * les autres se parcourent dans tools/catalog/ (numéro de ligne et de colonne).
 */

/**
 * @typedef {object} IconDefinition
 * @property {number} row Ligne de l'icône dans la planche, à partir de 0.
 * @property {number} column Colonne, de 0 à 15.
 * @property {string} category Famille (pour le catalogue).
 */

/** Planche d'icônes. */
export const ICON_SET = Object.freeze({
  image: 'assets/images/ui/iconset.png',
  iconSize: 24,
  columns: 16,
  rows: 629,
});

/**
 * @param {string} category
 * @returns {(row: number, column: number) => Readonly<IconDefinition>}
 */
function family(category) {
  return (row, column) => Object.freeze({ row, column, category });
}

const weapon = family('arme');
const armor = family('armure');
const potion = family('potion');
const plant = family('plante');
const material = family('matériau');
const food = family('nourriture');
const book = family('livre');
const tool = family('outil');
const misc = family('divers');

/** @type {Readonly<Record<string, Readonly<IconDefinition>>>} */
export const ICONS = Object.freeze({
  // Ressources de l'inventaire (R-IHM-HUD-001).
  wood: material(64, 9),
  stone: material(9, 2),
  flower: plant(68, 10),
  flint: material(63, 6),
  branch: material(62, 4),
  fiber: plant(4, 9),

  // Barre d'actions (R-IHM-BAR-001), expérience (R-IHM-HUD-002), objets de quête (B.9).
  hammer: tool(35, 9),
  experience: misc(6, 14),
  doll: misc(8, 9),
  // Flamme des feux de camp allumés (R-IHM-NUI-001).
  flame: misc(6, 8),

  // Matériaux.
  log: material(12, 0),
  'log-birch': material(77, 3),
  'log-burning': material(64, 11),
  coal: material(63, 4),
  'ore-iron': material(63, 7),
  'ore-copper': material(63, 9),
  'ore-gold': material(63, 11),
  'ingot-iron': material(74, 5),
  'ingot-dark': material(74, 6),
  'ingot-gold': material(74, 7),
  'gold-bar': material(12, 2),
  leather: material(12, 3),
  cloth: material(65, 1),
  feather: material(71, 9),
  horn: material(12, 5),
  fang: material(75, 12),
  ruby: material(12, 8),
  pearl: material(12, 9),
  crystal: material(12, 10),
  amethyst: material(12, 12),
  coin: material(12, 13),

  // Plantes.
  herb: plant(4, 8),
  clover: plant(4, 10),
  lavender: plant(4, 11),
  'herb-yellow': plant(4, 13),
  'flower-purple': plant(69, 15),
  'flower-rose': plant(68, 13),
  'leaf-red': plant(68, 5),
  mushroom: food(10, 5),
  'mushroom-green': plant(66, 11),
  berries: food(13, 6),
  cherries: food(13, 7),

  // Nourriture.
  carrot: food(10, 0),
  onion: food(10, 1),
  potato: food(10, 2),
  meat: food(10, 3),
  fish: food(10, 4),
  orange: food(10, 7),
  grapes: food(10, 8),
  apple: food(10, 9),
  bread: food(10, 10),
  egg: food(10, 11),
  cheese: food(10, 12),

  // Livres et papiers (C-TEC-06).
  'book-red': book(11, 0),
  'book-black': book(11, 1),
  'book-green': book(11, 2),
  'book-brown': book(110, 0),
  'book-yellow': book(110, 4),
  'book-teal': book(110, 9),
  'book-blue': book(110, 10),
  'book-purple': book(110, 11),
  'tome-leather': book(112, 0),
  'tome-gold': book(112, 1),
  'tome-red': book(112, 2),
  'tome-blue': book(112, 3),
  'book-open': book(113, 0),
  'book-open-2': book(8, 5),
  scroll: book(9, 6),
  'scroll-old': book(11, 3),
  'scroll-ribbon': book(114, 12),
  letter: book(9, 4),
  note: book(9, 5),
  map: book(9, 9),

  // Outils.
  axe: tool(1, 14),
  pickaxe: tool(11, 8),
  shovel: tool(11, 9),
  scythe: tool(1, 15),
  rope: tool(11, 7),
  lantern: tool(11, 4),
  torch: tool(11, 5),
  candle: tool(11, 6),
  mortar: tool(11, 11),
  hourglass: tool(11, 12),
  key: tool(5, 0),
  'key-gold': tool(5, 3),
  sack: tool(9, 0),

  // Armes et armures.
  sword: weapon(0, 1),
  'sword-long': weapon(0, 2),
  greatsword: weapon(0, 3),
  spear: weapon(0, 5),
  'battle-axe': weapon(0, 6),
  dagger: weapon(0, 8),
  club: weapon(0, 14),
  whip: weapon(0, 12),
  bow: weapon(1, 0),
  crossbow: weapon(1, 8),
  helmet: armor(2, 0),
  shield: armor(3, 4),
  boots: armor(3, 1),
  gloves: armor(3, 2),
  ring: armor(2, 1),
  necklace: armor(3, 11),

  // Potions.
  'potion-red': potion(4, 0),
  'potion-blue': potion(4, 1),
  'potion-green': potion(4, 2),
  'potion-dark': potion(4, 3),
  vial: potion(11, 14),

  // Divers.
  gift: misc(9, 8),
  mirror: misc(9, 12),
  skull: misc(9, 13),
  cross: misc(11, 13),
});
