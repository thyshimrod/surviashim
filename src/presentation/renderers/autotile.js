// @ts-check

/**
 * Autotiles au format RPG Maker VX : un bloc de 2 × 3 tuiles (4 × 6 quarts de tuile) décrit un
 * terrain et ses bordures. Chaque tuile affichée est recomposée de 4 quarts, choisis selon que
 * les tuiles voisines sont du même terrain.
 *
 * Disposition du bloc, en quarts (colonne, ligne) :
 * - lignes 0-1, colonnes 2-3 : coins intérieurs ;
 * - lignes 2-5 : un îlot de 2 × 2 tuiles (coins extérieurs, bords, intérieur).
 */

/** @typedef {{ qx: number, qy: number }} Quarter */
/** @typedef {(dx: number, dy: number) => boolean} SameTerrainAt */

/**
 * Quarts sources de chaque coin, selon la forme locale du terrain.
 * `vertical` : bord du côté haut ou bas ; `horizontal` : bord du côté gauche ou droit.
 */
const CORNERS = Object.freeze([
  // Haut-gauche
  {
    dx: -1,
    dy: -1,
    interior: { qx: 2, qy: 4 },
    innerCorner: { qx: 2, qy: 0 },
    vertical: { qx: 2, qy: 2 },
    horizontal: { qx: 0, qy: 4 },
    outer: { qx: 0, qy: 2 },
  },
  // Haut-droit
  {
    dx: 1,
    dy: -1,
    interior: { qx: 1, qy: 4 },
    innerCorner: { qx: 3, qy: 0 },
    vertical: { qx: 1, qy: 2 },
    horizontal: { qx: 3, qy: 4 },
    outer: { qx: 3, qy: 2 },
  },
  // Bas-gauche
  {
    dx: -1,
    dy: 1,
    interior: { qx: 2, qy: 3 },
    innerCorner: { qx: 2, qy: 1 },
    vertical: { qx: 2, qy: 5 },
    horizontal: { qx: 0, qy: 3 },
    outer: { qx: 0, qy: 5 },
  },
  // Bas-droit
  {
    dx: 1,
    dy: 1,
    interior: { qx: 1, qy: 3 },
    innerCorner: { qx: 3, qy: 1 },
    vertical: { qx: 1, qy: 5 },
    horizontal: { qx: 3, qy: 3 },
    outer: { qx: 3, qy: 5 },
  },
]);

/**
 * Choisit les 4 quarts (haut-gauche, haut-droit, bas-gauche, bas-droit) d'une tuile.
 * @param {SameTerrainAt} isSame Indique si la tuile voisine (décalage dx, dy) est du même terrain.
 * @returns {Quarter[]}
 */
export function selectAutotileQuarters(isSame) {
  return CORNERS.map((corner) => {
    const hasVertical = isSame(0, corner.dy);
    const hasHorizontal = isSame(corner.dx, 0);
    if (hasVertical && hasHorizontal) {
      return isSame(corner.dx, corner.dy) ? corner.interior : corner.innerCorner;
    }
    if (hasHorizontal) {
      return corner.vertical;
    }
    return hasVertical ? corner.horizontal : corner.outer;
  });
}

/**
 * Dessine une tuile d'autotile.
 * @param {CanvasRenderingContext2D} context
 * @param {object} params
 * @param {CanvasImageSource} params.image Planche de tuiles.
 * @param {{ column: number, row: number }} params.block Bloc de l'autotile (en tuiles).
 * @param {number} params.tileSize
 * @param {{ x: number, y: number }} params.target Coin supérieur gauche de destination (px).
 * @param {SameTerrainAt} params.isSame
 * @param {number} [params.frame] Image d'animation (blocs côte à côte), 0 par défaut.
 */
export function drawAutotileCell(context, { image, block, tileSize, target, isSame, frame = 0 }) {
  const half = tileSize / 2;
  const blockX = (block.column + frame * 2) * tileSize;
  const blockY = block.row * tileSize;
  selectAutotileQuarters(isSame).forEach((quarter, index) => {
    const offsetX = (index % 2) * half;
    const offsetY = Math.floor(index / 2) * half;
    context.drawImage(
      image,
      blockX + quarter.qx * half,
      blockY + quarter.qy * half,
      half,
      half,
      target.x + offsetX,
      target.y + offsetY,
      half,
      half,
    );
  });
}
