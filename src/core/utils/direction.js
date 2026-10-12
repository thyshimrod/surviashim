// @ts-check
import { FACINGS } from '../config/directions.js';

/** @typedef {import('../config/directions.js').Facing} Facing */
/** @typedef {import('../config/directions.js').MoveDirection} MoveDirection */

/**
 * Touches de déplacement enfoncées.
 * @typedef {object} HeldDirections
 * @property {boolean} [up]
 * @property {boolean} [down]
 * @property {boolean} [left]
 * @property {boolean} [right]
 */

/**
 * R-JOU-DEP-001 : combine les touches enfoncées en une direction demandée ; deux touches
 * opposées s'annulent.
 * @param {HeldDirections} held
 * @returns {MoveDirection}
 */
export function resolveDirection(held) {
  return {
    dx: Number(Boolean(held.right)) - Number(Boolean(held.left)),
    dy: Number(Boolean(held.down)) - Number(Boolean(held.up)),
  };
}

/**
 * @param {MoveDirection} direction
 * @returns {boolean} `true` si aucune direction n'est demandée.
 */
export function isStill(direction) {
  return direction.dx === 0 && direction.dy === 0;
}

/**
 * R-JOU-ORI-001 : orientation du joueur après un tick où `direction` est demandée.
 * En diagonale, l'orientation est conservée si elle fait partie de la diagonale, sinon le joueur
 * prend la composante horizontale.
 * @param {Facing} facing Orientation actuelle.
 * @param {MoveDirection} direction
 * @returns {Facing}
 */
export function nextFacing(facing, direction) {
  const horizontal = horizontalFacing(direction.dx);
  const vertical = verticalFacing(direction.dy);
  if (horizontal === undefined) {
    return vertical ?? facing;
  }
  if (vertical === undefined) {
    return horizontal;
  }
  return facing === vertical || facing === horizontal ? facing : horizontal;
}

/**
 * @param {number} dx
 * @returns {Facing | undefined}
 */
function horizontalFacing(dx) {
  if (dx === 0) {
    return undefined;
  }
  return dx > 0 ? FACINGS.RIGHT : FACINGS.LEFT;
}

/**
 * @param {number} dy
 * @returns {Facing | undefined}
 */
function verticalFacing(dy) {
  if (dy === 0) {
    return undefined;
  }
  return dy > 0 ? FACINGS.DOWN : FACINGS.UP;
}

/**
 * R-JOU-DEP-002, R-JOU-DEP-003 : déplacement sur chaque axe pour un tick. En diagonale, chaque
 * axe reçoit `speed / √2`, pour parcourir la même distance qu'en ligne droite.
 * @param {MoveDirection} direction
 * @param {number} speed Distance parcourue par tick (px).
 * @returns {{ x: number, y: number }}
 */
export function stepFor(direction, speed) {
  const isDiagonal = direction.dx !== 0 && direction.dy !== 0;
  const axisSpeed = isDiagonal ? speed / Math.SQRT2 : speed;
  return { x: direction.dx * axisSpeed, y: direction.dy * axisSpeed };
}
