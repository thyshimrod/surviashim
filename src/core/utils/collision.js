// @ts-check
import { clamp, hitboxAt, overlaps } from './box.js';

/** @typedef {import('./box.js').Point} Point */
/** @typedef {import('./box.js').Size} Size */
/** @typedef {import('./box.js').Box} Box */
/** @typedef {import('../model/TileMap.js').TileMap} TileMap */

/**
 * Géométrie de la boîte de collision par axe (spécification B.3).
 * `ahead` : distance de la position au bord rencontré en avançant (coordonnée croissante) ;
 * `behind` : distance au bord opposé ; `near` / `far` : bords correspondants d'une tuile.
 */
const AXES = Object.freeze({
  x: {
    ahead: (/** @type {Size} */ size) => size.width / 2,
    behind: (/** @type {Size} */ size) => size.width / 2,
    length: (/** @type {TileMap} */ map) => map.widthPx,
    near: /** @type {'left'} */ ('left'),
    far: /** @type {'right'} */ ('right'),
  },
  y: {
    ahead: () => 0,
    behind: (/** @type {Size} */ size) => size.height,
    length: (/** @type {TileMap} */ map) => map.heightPx,
    near: /** @type {'top'} */ ('top'),
    far: /** @type {'bottom'} */ ('bottom'),
  },
});

/**
 * Déplace une boîte de collision sur un seul axe, sans sortir de la carte (R-MON-CAR-003) ni
 * chevaucher une tuile infranchissable (R-MON-COL-001) : le déplacement s'arrête au contact.
 * @param {object} params
 * @param {TileMap} params.map
 * @param {Point} params.position Position de départ (pieds).
 * @param {Size} params.size Taille de la boîte de collision.
 * @param {'x' | 'y'} params.axis
 * @param {number} params.delta Déplacement souhaité sur cet axe (px, signé).
 * @param {readonly Box[]} [params.obstacles] Autres obstacles : boîtes des PNJ (R-PNJ-POS-002).
 * @returns {number} Nouvelle coordonnée sur cet axe.
 */
export function moveAlongAxis({ map, position, size, axis, delta, obstacles = [] }) {
  const current = position[axis];
  if (delta === 0) {
    return current;
  }
  const geometry = AXES[axis];
  const target = clamp(
    current + delta,
    geometry.behind(size),
    geometry.length(map) - geometry.ahead(size),
  );
  const box = hitboxAt({ ...position, [axis]: target }, size);
  const blockers = [
    ...map.blockingTilesOverlapping(box),
    ...obstacles.filter((obstacle) => overlaps(box, obstacle)),
  ];
  if (blockers.length === 0) {
    return target;
  }
  // Si la boîte chevauchait déjà un obstacle, on ne la fait jamais reculer : elle reste sur place.
  if (delta > 0) {
    const edge = Math.min(...blockers.map((tile) => tile[geometry.near]));
    return Math.max(current, edge - geometry.ahead(size));
  }
  const edge = Math.max(...blockers.map((tile) => tile[geometry.far]));
  return Math.min(current, edge + geometry.behind(size));
}
