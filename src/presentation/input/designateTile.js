// @ts-check
import { sortByDepth } from '../renderers/depthSort.js';

/** @typedef {{ x: number, y: number }} Point */
/** @typedef {import('../../core/utils/box.js').Box} Box */

/**
 * Ce qu'un clic désigne : une tuile, ou un PNJ.
 * @typedef {{ column: number, row: number } | { npcId: string }} Target
 */

/**
 * Élément debout dessiné : la tuile qui le porte (décor) ou le PNJ qu'il représente, et le
 * rectangle de son sprite.
 * @typedef {object} DrawnElement
 * @property {number} [column]
 * @property {number} [row]
 * @property {string} [npcId] Présent pour un PNJ (R-IHM-INS-005).
 * @property {number} footY
 * @property {Box} sprite Rectangle du sprite (px de monde).
 */

/**
 * R-IHM-INS-001, R-IHM-INS-005 : ce que désigne un point du monde. Un PNJ sous le point l'emporte
 * sur tout le reste ; sinon, le sprite d'un élément debout l'emporte sur la tuile sous le point
 * (on peut cliquer sur le feuillage d'un arbre) ; si plusieurs sprites se superposent, c'est celui
 * qui est dessiné devant (R-IHM-AFF-002).
 * @param {object} params
 * @param {Point} params.point
 * @param {readonly DrawnElement[]} params.elements
 * @param {{ tileAt(point: Point): { column: number, row: number } | undefined }} params.map
 * @returns {Target | undefined} `undefined` hors de la carte.
 */
export function designateTile({ point, elements, map }) {
  const hits = elements.filter(({ sprite }) => contains(sprite, point));
  const npc = hits.find((element) => element.npcId !== undefined);
  if (npc !== undefined) {
    return { npcId: npc.npcId };
  }
  const front = sortByDepth(hits.map((element) => ({ ...element, isCharacter: false }))).at(-1);
  if (front !== undefined) {
    return { column: front.column, row: front.row };
  }
  return map.tileAt(point);
}

/**
 * @param {Box} box
 * @param {Point} point
 * @returns {boolean}
 */
function contains(box, point) {
  return point.x >= box.left && point.x < box.right && point.y >= box.top && point.y < box.bottom;
}
