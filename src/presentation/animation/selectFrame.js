// @ts-check

/**
 * Réglages de l'animation d'un personnage (spécification, partie C).
 * @typedef {object} WalkAnimation
 * @property {number} frameTicks Durée d'une image de marche (ticks).
 * @property {readonly number[]} sequence Ordre des images de marche (colonnes, à partir de 1).
 * @property {number} idleFrame Image de la pose immobile.
 */

/**
 * Image (colonne, à partir de 1) à afficher pour un personnage.
 * R-IHM-ANI-001 : en marche, la séquence défile depuis son début, une image tous les
 * `frameTicks` ticks, en boucle.
 * R-IHM-ANI-002 : immobile, la pose `idleFrame` est affichée.
 * @param {{ isWalking: boolean, walkingTicks: number }} character
 * @param {WalkAnimation} animation
 * @returns {number}
 */
export function selectCharacterFrame(character, animation) {
  if (!character.isWalking) {
    return animation.idleFrame;
  }
  const step = Math.floor(character.walkingTicks / animation.frameTicks);
  return animation.sequence[step % animation.sequence.length];
}

/**
 * @param {Readonly<import('../../../data/gameParameters.js').GameParameters>} parameters
 * @returns {WalkAnimation}
 */
export function walkAnimationFrom(parameters) {
  return {
    frameTicks: parameters.WALK_FRAME_TICKS,
    sequence: parameters.WALK_FRAME_SEQUENCE,
    idleFrame: parameters.IDLE_FRAME,
  };
}
