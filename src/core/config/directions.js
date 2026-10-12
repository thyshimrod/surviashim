// @ts-check

/**
 * Orientations du joueur (spécification, glossaire : « Orientation »).
 * @typedef {'up' | 'down' | 'left' | 'right'} Facing
 */

/** Orientations possibles. */
export const FACINGS = Object.freeze({
  UP: /** @type {Facing} */ ('up'),
  DOWN: /** @type {Facing} */ ('down'),
  LEFT: /** @type {Facing} */ ('left'),
  RIGHT: /** @type {Facing} */ ('right'),
});

/**
 * Direction demandée : composante horizontale (`dx`) et verticale (`dy`), chacune valant -1, 0
 * ou 1. `dy` = -1 signifie « haut » (y décroissant, spécification B.3).
 * @typedef {{ dx: number, dy: number }} MoveDirection
 */

/** Aucune direction demandée. */
export const NO_DIRECTION = Object.freeze({ dx: 0, dy: 0 });
