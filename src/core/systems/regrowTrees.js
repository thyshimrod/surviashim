// @ts-check
import { GAME_EVENTS } from '../events/gameEvents.js';
import { hitboxAt, overlaps } from '../utils/box.js';

/** @typedef {import('../state/GameState.js').GameState} GameState */
/** @typedef {import('../state/GameState.js').GameRules} GameRules */
/** @typedef {import('../events/EventBus.js').EventBus} EventBus */

/**
 * R-RES-REC-005 : les souches arrivées à échéance redeviennent des arbres, sauf si le joueur ou
 * un PNJ se tient dessus (elles attendent alors que la tuile soit libre).
 * @param {GameState} state
 * @param {GameRules} rules
 * @param {EventBus} events
 */
export function regrowTrees(state, rules, events) {
  const bodies = [state.player.position, ...state.npcs.map((npc) => npc.position)].map((position) =>
    hitboxAt(position, rules.hitbox),
  );
  state.regrowth = state.regrowth.filter((entry) => {
    if (state.clock < entry.at) {
      return true;
    }
    const bounds = state.map.boundsOf(entry.column, entry.row);
    if (bodies.some((body) => overlaps(body, bounds))) {
      return true;
    }
    state.map.setTile(entry.column, entry.row, rules.tiles[entry.tile]);
    events.emit(GAME_EVENTS.TILE_CHANGED, {
      column: entry.column,
      row: entry.row,
      tileId: entry.tile,
    });
    return false;
  });
}
