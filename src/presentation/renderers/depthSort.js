// @ts-check

/**
 * Élément debout à dessiner (personnage, arbre, rocher).
 * @typedef {object} StandingElement
 * @property {number} footY y de la position (pieds, ou pied de l'arbre) en px de monde.
 * @property {boolean} isCharacter `true` pour un personnage, `false` pour le décor.
 */

/**
 * R-IHM-AFF-002 : ordre de dessin des éléments debout, du plus petit au plus grand y : un
 * élément plus bas à l'écran passe devant. À y égal, le personnage passe devant le décor.
 * @template {StandingElement} T
 * @param {readonly T[]} elements
 * @returns {T[]} Nouvelle liste, dans l'ordre de dessin.
 */
export function sortByDepth(elements) {
  return [...elements].sort(
    (first, second) =>
      first.footY - second.footY || Number(first.isCharacter) - Number(second.isCharacter),
  );
}
