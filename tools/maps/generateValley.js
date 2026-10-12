// @ts-check
// Usage : node tools/maps/generateValley.js
// Génère la vallée (spécification B.6) dans data/maps/valley.js. L'aléatoire est seedé : relancer
// l'outil redonne exactement la même carte, qu'on peut ensuite retoucher à la main.
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GAME_PARAMETERS } from '../../data/gameParameters.js';
import { NPCS } from '../../data/npcs.js';
import { PLACES } from '../../data/places.js';
import { SEARCH_SPOTS } from '../../data/searchSpots.js';
import { TILE_DEFINITIONS } from '../../data/tilesets.js';
import {
  around,
  createGrid,
  createNoise,
  createRng,
  fill,
  inEllipse,
  isIn,
  line,
} from './mapGrid.js';
import { findUnreachable } from './reachability.js';

const SEED = 20261012;
const WIDTH = GAME_PARAMETERS.MAP_WIDTH;
const HEIGHT = GAME_PARAMETERS.MAP_HEIGHT;
const START = {
  column: GAME_PARAMETERS.PLAYER_START_TILE.x,
  row: GAME_PARAMETERS.PLAYER_START_TILE.y,
};
const S = Object.fromEntries(Object.values(TILE_DEFINITIONS).map((tile) => [tile.id, tile.symbol]));

/** @type {Array<Array<[number, number]>>} */
const PATHS = [
  [
    [34, 92],
    [34, 70],
    [30, 50],
    [29, 33],
  ],
  [
    [34, 92],
    [60, 92],
    [100, 90],
    [122, 96],
    [122, 104],
  ],
  [
    [100, 90],
    [100, 82],
    [84, 80],
  ],
  [
    [100, 82],
    [108, 76],
    [116, 70],
    [120, 67],
  ],
];

const WATERS = [
  { center: { column: 83, row: 62 }, radii: { x: 16, y: 12 } }, // Lac d'Argent
  { center: { column: 26, row: 86 }, radii: { x: 3.5, y: 2.5 } }, // étang du Vallon
  { center: { column: 111, row: 61 }, radii: { x: 6, y: 7 } }, // anse qui a englouti la chapelle
];

const HAMLET_HOUSES = [
  { column: 113, row: 95, width: 6, height: 5 },
  { column: 124, row: 94, width: 7, height: 5 },
  { column: 113, row: 103, width: 6, height: 5 },
  { column: 125, row: 103, width: 6, height: 5 },
];

// Arbres, rochers et fleurs, selon le bruit et les lieux ; une lisière d'arbres au bord.
function scatterNature(grid, random) {
  const forest = createNoise(random, { width: WIDTH, height: HEIGHT, step: 9 });
  const detail = createNoise(random, { width: WIDTH, height: HEIGHT, step: 3 });
  grid.forEach((column, row) => {
    const density = forest(column, row) * 0.7 + detail(column, row) * 0.3;
    grid.set(column, row, natureAt(column, row, density, random));
  });
}

function natureAt(column, row, density, random) {
  const edge = Math.min(column, row, WIDTH - 1 - column, HEIGHT - 1 - row);
  if (edge < 2 || (edge < 4 && random() < 0.6)) {
    return S.tree;
  }
  const inVale = isIn(PLACES.vale.area, column, row);
  const treeThreshold = isIn(PLACES['whispering-wood'].area, column, row) ? 0.38 : 0.6;
  if (!inVale && density > treeThreshold) {
    return S.tree;
  }
  const rockChance = isIn(PLACES['rocky-hills'].area, column, row) ? 0.1 : 0.006;
  if (random() < rockChance) {
    return S.rock;
  }
  const flowerChance = inVale ? 0.07 : 0.025;
  return random() < flowerChance ? S.flowers : S.grass;
}

// Plans d'eau aux bords irréguliers.
function addWater(grid, random) {
  const ripple = createNoise(random, { width: WIDTH, height: HEIGHT, step: 4 });
  grid.forEach((column, row) => {
    const wobble = 1 + (ripple(column, row) - 0.5) * 0.3;
    const isWater = WATERS.some(({ center, radii }) =>
      inEllipse(center, { x: radii.x * wobble, y: radii.y * wobble }, column, row),
    );
    if (isWater) {
      grid.set(column, row, S.water);
    }
  });
}

// Clairière du Vallon : herbe et fleurs au centre, une lisière d'arbres sur le pourtour.
function clearVale(grid, random) {
  const center = { column: 34, row: 92 };
  grid.forEach((column, row) => {
    const inner = inEllipse(center, { x: 13, y: 10 }, column, row);
    const outer = inEllipse(center, { x: 16, y: 13 }, column, row);
    if (inner && grid.get(column, row) !== S.water) {
      grid.set(column, row, random() < 0.08 ? S.flowers : S.grass);
    } else if (outer && !inner && random() < 0.35) {
      grid.set(column, row, S.tree);
    }
  });
}

// Chemins de terre, en dégageant arbres et rochers de part et d'autre.
function addPaths(grid) {
  for (const path of PATHS) {
    for (let index = 1; index < path.length; index += 1) {
      line(path[index - 1], path[index], (column, row) => {
        clearObstacles(grid, around({ column, row }, 1));
        grid.set(column, row, S.path);
      });
    }
  }
}

function clearObstacles(grid, tiles) {
  for (const { column, row } of tiles) {
    const symbol = grid.get(column, row);
    if (symbol === S.tree || symbol === S.rock) {
      grid.set(column, row, S.grass);
    }
  }
}

// Bâtiment en ruine : un dallage, des murs réduits à des vestiges (certains manquent), une porte
// au milieu du mur sud.
function ruinedBuilding(grid, random, area, missingWalls = 0.3) {
  const margin = {
    column: area.column - 1,
    row: area.row - 1,
    width: area.width + 2,
    height: area.height + 2,
  };
  fill(grid, margin, S.grass);
  fill(grid, area, S['ruin-floor']);
  const door = {
    column: area.column + Math.floor(area.width / 2),
    row: area.row + area.height - 1,
  };
  const lastColumn = area.column + area.width - 1;
  grid.forEach((column, row) => {
    const isEdge =
      row === area.row || row === door.row || column === area.column || column === lastColumn;
    const isDoor = column === door.column && row === door.row;
    if (isIn(area, column, row) && isEdge && !isDoor && random() >= missingWalls) {
      grid.set(column, row, S.ruin);
    }
  });
}

// Les trois ruines : la tour de guet, la chapelle, le hameau.
function addRuins(grid, random) {
  ruinedBuilding(grid, random, { column: 25, row: 23, width: 9, height: 9 }, 0.25);
  fill(grid, { column: 28, row: 26, width: 3, height: 3 }, S.ruin); // base de la tour
  ruinedBuilding(grid, random, { column: 116, row: 56, width: 9, height: 11 }, 0.35);
  for (let row = 58; row <= 64; row += 2) {
    grid.set(118, row, S.ruin); // colonnes de la nef
    grid.set(122, row, S.ruin);
  }
  for (const house of HAMLET_HOUSES) {
    ruinedBuilding(grid, random, house);
  }
}

// Devant une cachette (les deux tuiles au sud), pas de vestige debout : un pilier haut de 3 tuiles
// la masquerait.
function clearInFront(grid, { column, row }) {
  for (const below of [row + 1, row + 2]) {
    if (grid.get(column, below) === S.ruin) {
      grid.set(column, below, S['ruin-floor']);
    }
  }
}

// Le départ et les abords des PNJ restent dégagés.
function clearPeople(grid) {
  const centers = [START, ...Object.values(NPCS).map((npc) => npc.tile)];
  for (const { column, row } of centers.flatMap((center) => around(center, 1))) {
    if (grid.get(column, row) !== S.path) {
      grid.set(column, row, S.grass);
    }
  }
}

function generate() {
  const random = createRng(SEED);
  const grid = createGrid(WIDTH, HEIGHT, S.grass);
  scatterNature(grid, random);
  addWater(grid, random);
  clearVale(grid, random);
  addPaths(grid);
  addRuins(grid, random);
  addPaths(grid);
  for (const { column, row, tile } of SEARCH_SPOTS) {
    grid.set(column, row, S[tile]); // cachettes des ruines (B.7)
    clearInFront(grid, { column, row });
  }
  clearPeople(grid);
  return grid.rows();
}

// Abords de chaque PNJ et au moins une tuile de chaque lieu doivent être accessibles.
function reachabilityTargets() {
  const tilesOf = (area) => {
    const tiles = [];
    for (let row = area.row; row < area.row + area.height; row += 1) {
      for (let column = area.column; column < area.column + area.width; column += 1) {
        tiles.push({ column, row });
      }
    }
    return tiles;
  };
  return [
    ...Object.values(NPCS).map((npc) => ({ name: `PNJ ${npc.id}`, tiles: around(npc.tile, 1) })),
    ...Object.values(PLACES).map((place) => ({
      name: `lieu ${place.id}`,
      tiles: tilesOf(place.area),
    })),
  ];
}

const rows = generate();
const unreachable = findUnreachable({ rows, start: START, targets: reachabilityTargets() });
if (unreachable.length > 0) {
  throw new Error(`Unreachable from the start: ${unreachable.join(', ')}`);
}

const output = `// @ts-check
// Fichier généré par tools/maps/generateValley.js (graine ${SEED}) ; peut être retouché à la main.

/**
 * La vallée (R-MON-CAR-001, spécification B.6), une ligne de texte par ligne de tuiles.
 * Chaque caractère est le \`symbol\` d'un type de tuile de data/tilesets.js :
 * \`.\` herbe, \`,\` fleurs, \`=\` chemin, \`~\` eau, \`T\` arbre, \`o\` rocher, \`_\` dallage, \`#\` ruine,
 * \`B\`/\`b\` bibliothèque (fouillée), \`C\`/\`c\` coffre (ouvert), \`K\`/\`k\` caisse (vide).
 */

/**
 * @typedef {object} MapDefinition
 * @property {string} id Identifiant unique, kebab-case.
 * @property {readonly string[]} rows Lignes de la carte, de haut en bas.
 */

/** @type {Readonly<MapDefinition>} */
export const VALLEY_MAP = Object.freeze({
  id: 'valley',
  rows: Object.freeze([
${rows.map((row) => `    '${row}',`).join('\n')}
  ]),
});
`;
const target = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  'data',
  'maps',
  'valley.js',
);
writeFileSync(target, output);
console.log(`Vallée de ${WIDTH} × ${HEIGHT} tuiles écrite dans data/maps/valley.js`);
