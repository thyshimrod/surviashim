// @ts-check
import { hitboxAt } from '../utils/box.js';
import { moveAlongAxis } from '../utils/collision.js';
import { isStill, nextFacing, stepFor } from '../utils/direction.js';

/** @typedef {import('../state/GameState.js').GameState} GameState */
/** @typedef {import('../state/GameState.js').GameRules} GameRules */

/**
 * Applique la direction demandée au joueur pendant un tick : marche, orientation, collisions.
 * Les axes sont traités l'un après l'autre (x puis y) : quand un seul axe est bloqué, le joueur
 * glisse le long de l'obstacle (R-MON-COL-002). Les PNJ sont des obstacles (R-PNJ-POS-002) et le
 * joueur ne bouge pas pendant un dialogue (R-PNJ-DIA-003).
 * @param {GameState} state
 * @param {GameRules} rules
 */
export function movePlayer(state, rules) {
  const { player, map } = state;
  const direction = player.moveIntent;
  if (isStill(direction) || state.dialogue !== undefined) {
    player.isWalking = false;
    player.walkingTicks = 0;
    return;
  }
  // R-IHM-ANI-001 : compteur de marche continue, conservé quand l'orientation change.
  player.walkingTicks = player.isWalking ? player.walkingTicks + 1 : 0;
  player.isWalking = true;
  player.facing = nextFacing(player.facing, direction); // R-JOU-ORI-001

  const step = stepFor(direction, rules.walkSpeed); // R-JOU-DEP-002, R-JOU-DEP-003
  const size = rules.hitbox;
  const obstacles = state.npcs.map((npc) => hitboxAt(npc.position, size));
  for (const axis of /** @type {const} */ (['x', 'y'])) {
    player.position[axis] = moveAlongAxis({
      map,
      position: player.position,
      size,
      axis,
      delta: step[axis],
      obstacles,
    });
  }
}
