// @ts-check

/** @typedef {'up' | 'down' | 'left' | 'right'} MovementKey */

/**
 * R-IHM-CMD-001 : touches de déplacement, reconnues par leur emplacement physique
 * (`KeyboardEvent.code`). La touche Z d'un clavier AZERTY a le code `KeyW`, comme la touche W
 * d'un clavier QWERTY.
 * @type {Readonly<Record<string, MovementKey>>}
 */
export const MOVEMENT_KEY_CODES = Object.freeze({
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  KeyW: 'up',
  KeyS: 'down',
  KeyA: 'left',
  KeyD: 'right',
});

/**
 * @param {string} code Valeur de `KeyboardEvent.code`.
 * @returns {MovementKey | undefined} Touche de déplacement, ou `undefined` pour une autre touche.
 */
export function movementKeyForCode(code) {
  return Object.hasOwn(MOVEMENT_KEY_CODES, code) ? MOVEMENT_KEY_CODES[code] : undefined;
}
