// @ts-check
// Page de consultation des atlas (npm run serve, puis /tools/catalog/) : autotiles, sprites de
// toutes les planches, icônes nommées et personnages.
import { ICON_SET, ICONS } from '../../data/icons.js';
import { CHARACTER_SHEETS } from '../../data/sprites.js';
import { AUTOTILES, SPRITES, TILESETS } from '../../data/tileset.js';
import { drawAutotileCell } from '../../src/presentation/renderers/autotile.js';

const ZOOM = 2;
const ISLAND_SIZE = 3;
const tile = TILESETS.main.tileSize;
const root = /** @type {HTMLElement} */ (document.getElementById('catalog'));

/**
 * @param {string} path Chemin depuis la racine du projet.
 * @returns {Promise<HTMLImageElement>}
 */
async function load(path) {
  const image = new Image();
  image.src = `../../${path}`;
  await image.decode();
  return image;
}

const sheets = Object.fromEntries(
  await Promise.all(
    Object.entries(TILESETS).map(async ([key, sheet]) => [key, await load(sheet.image)]),
  ),
);
const icons = await load(ICON_SET.image);

/**
 * @param {string} title
 * @returns {HTMLElement} Conteneur des vignettes de la section.
 */
function addSection(title) {
  const heading = document.createElement('h2');
  heading.textContent = title;
  const grid = document.createElement('div');
  grid.className = 'grid';
  root.append(heading, grid);
  return grid;
}

/**
 * @param {HTMLElement} grid
 * @param {string} name
 * @param {string} coords
 * @param {{ width: number, height: number }} size Taille (px de monde).
 * @returns {CanvasRenderingContext2D}
 */
function addFigure(grid, name, coords, { width, height }) {
  const figure = document.createElement('figure');
  const canvas = document.createElement('canvas');
  canvas.width = width * ZOOM;
  canvas.height = height * ZOOM;
  const caption = document.createElement('figcaption');
  caption.innerHTML = `${name}<br><span class="coords">${coords}</span>`;
  figure.append(canvas, caption);
  grid.append(figure);
  const context = /** @type {CanvasRenderingContext2D} */ (canvas.getContext('2d'));
  context.imageSmoothingEnabled = false;
  context.scale(ZOOM, ZOOM);
  return context;
}

function showAutotiles() {
  const grid = addSection('autotiles');
  const size = ISLAND_SIZE * tile;
  const isInside = (/** @type {number} */ column, /** @type {number} */ row) =>
    column >= 0 && column < ISLAND_SIZE && row >= 0 && row < ISLAND_SIZE;
  for (const [name, definition] of Object.entries(AUTOTILES)) {
    const context = addFigure(grid, name, `(${definition.column}, ${definition.row})`, {
      width: size,
      height: size,
    });
    for (let row = 0; row < ISLAND_SIZE; row += 1) {
      for (let column = 0; column < ISLAND_SIZE; column += 1) {
        drawAutotileCell(context, {
          image: sheets.main,
          block: definition,
          tileSize: tile,
          target: { x: column * tile, y: row * tile },
          isSame: (dx, dy) => isInside(column + dx, row + dy),
        });
      }
    }
  }
}

function showSprites() {
  /** @type {Map<string, HTMLElement>} */
  const sections = new Map();
  for (const [name, definition] of Object.entries(SPRITES)) {
    if (!sections.has(definition.category)) {
      sections.set(definition.category, addSection(definition.category));
    }
    const width = definition.width * tile;
    const height = definition.height * tile;
    const sheet = definition.sheet ?? 'main';
    const coords = `${sheet} (${definition.column}, ${definition.row}) ${definition.width}×${definition.height}`;
    const context = addFigure(sections.get(definition.category), name, coords, { width, height });
    context.drawImage(
      sheets[sheet],
      definition.column * tile,
      definition.row * tile,
      width,
      height,
      0,
      0,
      width,
      height,
    );
  }
}

function showIcons() {
  const grid = addSection(`icônes nommées (${Object.keys(ICONS).length})`);
  const size = ICON_SET.iconSize;
  for (const [name, icon] of Object.entries(ICONS)) {
    const context = addFigure(grid, name, `ligne ${icon.row}, colonne ${icon.column}`, {
      width: size,
      height: size,
    });
    context.drawImage(icons, icon.column * size, icon.row * size, size, size, 0, 0, size, size);
  }
}

async function showCharacters() {
  const grid = addSection('personnages');
  for (const [name, character] of Object.entries(CHARACTER_SHEETS)) {
    const image = await load(character.image);
    const context = addFigure(grid, name, `${character.displayWidth}×${character.displayHeight}`, {
      width: character.displayWidth,
      height: character.displayHeight,
    });
    // Pose immobile, de face (colonne du milieu, première ligne).
    context.drawImage(
      image,
      character.origin.x + character.frameWidth,
      character.origin.y,
      character.frameWidth,
      character.frameHeight,
      0,
      0,
      character.displayWidth,
      character.displayHeight,
    );
  }
}

showAutotiles();
showSprites();
showIcons();
await showCharacters();
