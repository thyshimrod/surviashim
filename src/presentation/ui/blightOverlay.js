// @ts-check
import { isBlighted } from '../../core/systems/blight.js';

/** @typedef {import('../../core/state/GameState.js').GameState} GameState */
/** @typedef {import('../../core/state/GameState.js').GameRules} GameRules */

/**
 * R-IHM-FLE-001 : tuiles flétries d'un rectangle du monde, à voiler de brume violette.
 * @param {{ getState: () => GameState, rules: GameRules }} game
 * @param {{ left: number, top: number, right: number, bottom: number }} view En px de monde.
 * @returns {{ column: number, row: number }[]}
 */
export function blightOverlay(game, view) {
  const state = game.getState();
  const size = state.map.tileSize;
  const tiles = [];
  const firstRow = Math.max(0, Math.floor(view.top / size));
  const lastRow = Math.min(state.map.rows - 1, Math.floor((view.bottom - 1) / size));
  const firstColumn = Math.max(0, Math.floor(view.left / size));
  const lastColumn = Math.min(state.map.columns - 1, Math.floor((view.right - 1) / size));
  for (let row = firstRow; row <= lastRow; row += 1) {
    for (let column = firstColumn; column <= lastColumn; column += 1) {
      if (isBlighted(state, game.rules, { column, row })) {
        tiles.push({ column, row });
      }
    }
  }
  return tiles;
}
