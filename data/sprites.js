// @ts-check

/**
 * Découpage des feuilles de sprites (GUIDELINES § 8.3). Aucune coordonnée de découpe n'est écrite
 * dans le code : la présentation lit ces descriptions.
 *
 * Format des feuilles de personnage (RPG Maker) : 3 colonnes d'images × 4 lignes, une ligne par
 * orientation. Les numéros d'image (colonnes) commencent à 1, comme dans la spécification. Une
 * planche peut regrouper plusieurs personnages : `origin` situe le bloc du personnage.
 */

/**
 * @typedef {object} CharacterSheet
 * @property {string} image Chemin de l'image depuis la racine du projet.
 * @property {Readonly<{x: number, y: number}>} origin Coin supérieur gauche du bloc du personnage
 *   dans l'image (px).
 * @property {number} columns Nombre d'images par ligne.
 * @property {number} frameWidth Largeur d'une image dans le fichier (px).
 * @property {number} frameHeight Hauteur d'une image dans le fichier (px).
 * @property {number} displayWidth Largeur affichée (px de monde).
 * @property {number} displayHeight Hauteur affichée (px de monde).
 * @property {Readonly<Record<'down' | 'left' | 'right' | 'up', number>>} rows
 *   Ligne de chaque orientation, à partir de 0.
 * @property {Readonly<{x: number, y: number}>} anchor Point de l'image affichée placé sur la
 *   position du personnage, c'est-à-dire ses pieds (px de monde, depuis le coin supérieur gauche).
 */

const ROWS = Object.freeze({ down: 0, left: 1, right: 2, up: 3 });
const NO_OFFSET = Object.freeze({ x: 0, y: 0 });
const FRAME_COLUMNS = 3;
const DIRECTIONS = 4;

/**
 * Feuille d'un personnage seul.
 * @param {string} image
 * @param {{ frameWidth: number, frameHeight: number, display: [number, number] }} size
 * @returns {Readonly<CharacterSheet>}
 */
function sheet(image, { frameWidth, frameHeight, display: [displayWidth, displayHeight] }) {
  return Object.freeze({
    image,
    origin: NO_OFFSET,
    columns: FRAME_COLUMNS,
    frameWidth,
    frameHeight,
    displayWidth,
    displayHeight,
    rows: ROWS,
    anchor: Object.freeze({ x: displayWidth / 2, y: displayHeight }),
  });
}

/**
 * Habitant d'une planche RPG Maker VX de 8 personnages (4 × 2 blocs), images de 32 × 48 px.
 * @param {string} file Nom du fichier, sans extension, dans assets/images/sprites/villagers/.
 * @param {number} index Rang du personnage dans la planche, de 0 à 7, ligne par ligne.
 * @returns {Readonly<CharacterSheet>}
 */
function vxVillager(file, index) {
  const frame = { width: 32, height: 48 };
  const perRow = 4;
  const base = sheet(`assets/images/sprites/villagers/${file}.png`, {
    frameWidth: frame.width,
    frameHeight: frame.height,
    display: [frame.width, frame.height],
  });
  return Object.freeze({
    ...base,
    origin: Object.freeze({
      x: (index % perRow) * frame.width * FRAME_COLUMNS,
      y: Math.floor(index / perRow) * frame.height * DIRECTIONS,
    }),
  });
}

const VX_FILES = Object.freeze(['01a', '01b', '03a', '03e']);
const VX_PER_SHEET = 8;

/** Les 32 habitants des planches VX, nommés « vx-<planche>-<rang> » (ex. « vx-03e-0 »). */
const VX_VILLAGERS = Object.fromEntries(
  VX_FILES.flatMap((file) =>
    Array.from({ length: VX_PER_SHEET }, (_, index) => [
      `vx-${file}-${index}`,
      vxVillager(`villagers-vx-${file}`, index),
    ]),
  ),
);

/**
 * @param {string} name
 * @returns {Readonly<CharacterSheet>}
 */
function villagerSheet(name) {
  return sheet(`assets/images/sprites/villagers/${name}.png`, {
    frameWidth: 32,
    frameHeight: 32,
    display: [32, 32],
  });
}

/** @type {Readonly<Record<string, Readonly<CharacterSheet>>>} */
export const CHARACTER_SHEETS = Object.freeze({
  // Les pixels du fichier sont doublés : le dessin d'origine fait 32 × 32 px par image (Q10).
  hero: sheet('assets/images/sprites/characters/hero.png', {
    frameWidth: 64,
    frameHeight: 64,
    display: [32, 32],
  }),
  'villager-blond': villagerSheet('villager-blond'),
  'villager-red': villagerSheet('villager-red'),
  'villager-orange': villagerSheet('villager-orange'),
  'villager-green': villagerSheet('villager-green'),
  ...VX_VILLAGERS,
});
