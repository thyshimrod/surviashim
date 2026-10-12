// @ts-check

/** @typedef {{ x: number, y: number }} Point */
/** @typedef {{ width: number, height: number }} Size */

/**
 * Rectangle aligné sur les axes (px de monde).
 * @typedef {object} Box
 * @property {number} left
 * @property {number} right
 * @property {number} top
 * @property {number} bottom
 */

/**
 * Boîte de collision d'un personnage (spécification B.3) : centrée horizontalement sur la
 * position, bord inférieur sur la position (les pieds).
 * @param {Point} position
 * @param {Size} size
 * @returns {Box}
 */
export function hitboxAt(position, size) {
  const halfWidth = size.width / 2;
  return {
    left: position.x - halfWidth,
    right: position.x + halfWidth,
    top: position.y - size.height,
    bottom: position.y,
  };
}

/**
 * Deux rectangles se chevauchent s'ils ont une surface commune : se toucher ne suffit pas
 * (R-MON-COL-001, notes).
 * @param {Box} first
 * @param {Box} second
 * @returns {boolean}
 */
export function overlaps(first, second) {
  return (
    first.left < second.right &&
    first.right > second.left &&
    first.top < second.bottom &&
    first.bottom > second.top
  );
}

/**
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number} `value` ramené dans `[min, max]`.
 */
export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
