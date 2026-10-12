// @ts-check
// Végétation de la vallée (spécification B.10, B.12) : chaque tirage a sa propre graine, pour
// qu'en ajouter un ne change pas le reste de la carte.
import { BLIGHTED_PLACES } from '../../data/blight.js';
import { PLACES } from '../../data/places.js';
import { around, createRng, distanceOutside, isIn } from './mapGrid.js';

// Cueillette (B.10) : quelques buissons à baies dans le Vallon, d'autres épars dans la vallée ;
// des champignons en lisière des bois. Tirage à part, pour ne pas changer le reste de la carte.
function addFood(grid, { seed, start, symbols: S }) {
  const random = createRng(seed + 1);
  grid.forEach((column, row) => {
    if (
      grid.get(column, row) !== S.grass ||
      Math.hypot(column - start.column, row - start.row) < 4
    ) {
      return;
    }
    const inVale = isIn(PLACES.vale.area, column, row);
    const nearTrees = around({ column, row }, 1).some(
      (tile) => grid.get(tile.column, tile.row) === S.tree,
    );
    if (random() < (inVale ? 0.02 : 0.003)) {
      grid.set(column, row, S['berry-bush']);
    } else if (nearTrees && random() < 0.04) {
      grid.set(column, row, S.mushrooms);
    }
  });
}

// Hautes herbes (B.12) : sur l'herbe de toute la vallée, plus rares au Vallon. Tirage à part.
function addTallGrass(grid, { seed, symbols: S }) {
  const random = createRng(seed + 3);
  grid.forEach((column, row) => {
    const chance = isIn(PLACES.vale.area, column, row) ? 0.006 : 0.02;
    if (grid.get(column, row) === S.grass && random() < chance) {
      grid.set(column, row, S['tall-grass']);
    }
  });
}

// Sauge de l'aube (B.12) : sur l'herbe, à 1 ou 2 tuiles des lieux flétris, à l'extérieur. Tirage à
// part, pour ne pas changer le reste de la carte.
function addSage(grid, { seed, symbols: S }) {
  const random = createRng(seed + 2);
  const areas = BLIGHTED_PLACES.map((id) => PLACES[id].area);
  grid.forEach((column, row) => {
    const gaps = areas.map((area) => distanceOutside(area, column, row));
    const nearEdge =
      gaps.some((value) => value >= 1 && value <= 2) && gaps.every((value) => value >= 1);
    if (grid.get(column, row) === S.grass && nearEdge && random() < 0.08) {
      grid.set(column, row, S['dawn-sage']);
    }
  });
}

/**
 * Ajoute la nourriture, la sauge et les hautes herbes.
 * @param {object} grid
 * @param {{ seed: number, start: { column: number, row: number }, symbols: Record<string, string> }} context
 */
export function addPlants(grid, context) {
  addFood(grid, context);
  addSage(grid, context);
  addTallGrass(grid, context);
}
