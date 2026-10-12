// @ts-check

/** @typedef {{ x: number, y: number }} Point */

/**
 * R-IHM-CAM-001 : coin supérieur gauche de la vue (px de monde). La vue est toujours centrée sur
 * le joueur, même près des bords de la carte : le joueur reste au milieu de l'écran.
 * @param {object} params
 * @param {Point} params.focus Position suivie (le joueur).
 * @param {number} params.viewWidth
 * @param {number} params.viewHeight
 * @returns {Point}
 */
export function computeViewOrigin({ focus, viewWidth, viewHeight }) {
  return { x: focus.x - viewWidth / 2, y: focus.y - viewHeight / 2 };
}

/**
 * R-IHM-INS-001 : point du monde sous un pixel de l'écran.
 * @param {Point} pixel Position du clic sur l'écran (px physiques).
 * @param {Point} origin Coin supérieur gauche de la vue (px de monde).
 * @returns {Point}
 */
export function screenToWorld(pixel, origin) {
  return { x: origin.x + pixel.x, y: origin.y + pixel.y };
}
