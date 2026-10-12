// @ts-check
import { FACINGS, NO_DIRECTION } from '../config/directions.js';

/** @typedef {import('../config/directions.js').Facing} Facing */
/** @typedef {import('../config/directions.js').MoveDirection} MoveDirection */
/** @typedef {import('../utils/box.js').Point} Point */

/**
 * Personnage dirigé par le joueur. État métier pur : aucune information d'affichage.
 */
export class Player {
  /**
   * @param {object} params
   * @param {Point} params.position Milieu des pieds (px de monde).
   * @param {Facing} [params.facing] Orientation ; vers le bas par défaut (R-JOU-ORI-001).
   * @param {MoveDirection} [params.moveIntent] Direction demandée.
   * @param {boolean} [params.isWalking] `true` si une direction était demandée au dernier tick.
   * @param {number} [params.walkingTicks] Ticks de marche continue avant le dernier tick.
   */
  constructor({
    position,
    facing = FACINGS.DOWN,
    moveIntent = NO_DIRECTION,
    isWalking = false,
    walkingTicks = 0,
  }) {
    this.position = { ...position };
    this.facing = facing;
    this.moveIntent = { ...moveIntent };
    this.isWalking = isWalking;
    this.walkingTicks = walkingTicks;
  }
}
