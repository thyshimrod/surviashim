// @ts-check
import { blightOverlay } from '../ui/blightOverlay.js';

/** Brume violette des tuiles flétries (R-IHM-FLE-001). */
const BLIGHT_COLOR = 'rgba(78, 40, 104, 0.38)';

/**
 * Voile les tuiles flétries visibles.
 * @param {CanvasRenderingContext2D} context
 * @param {{ x: number, y: number }} origin Coin supérieur gauche de la vue (px de monde).
 * @param {Parameters<typeof blightOverlay>[0]} game
 */
export function drawBlight(context, origin, game) {
  const { width, height } = context.canvas;
  const size = game.getState().map.tileSize;
  const view = {
    left: origin.x,
    top: origin.y,
    right: origin.x + width,
    bottom: origin.y + height,
  };
  context.fillStyle = BLIGHT_COLOR;
  for (const { column, row } of blightOverlay(game, view)) {
    context.fillRect(column * size - origin.x, row * size - origin.y, size, size);
  }
}
