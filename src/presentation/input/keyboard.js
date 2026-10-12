// @ts-check

/**
 * Associe des touches à des actions. Les touches sont comparées en minuscules.
 * @param {EventTarget} target Généralement `window`.
 * @param {Record<string, () => void>} bindings Exemple : `{ r: restart }`.
 * @returns {() => void} Fonction qui retire l'écouteur.
 */
export function bindKeyboard(target, bindings) {
  /** @param {Event} event */
  const onKeyDown = (event) => {
    if (!(event instanceof KeyboardEvent)) {
      return;
    }
    const action = bindings[event.key.toLowerCase()];
    if (action !== undefined) {
      event.preventDefault();
      action();
    }
  };
  target.addEventListener('keydown', onKeyDown);
  return () => target.removeEventListener('keydown', onKeyDown);
}
