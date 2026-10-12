// @ts-check

/**
 * @callback EventListener
 * @param {object} payload Données de l'événement (catalogue : gameEvents.js).
 * @returns {void}
 */

/**
 * @callback AnyEventListener
 * @param {string} type
 * @param {object} payload
 * @returns {void}
 */

/**
 * Bus d'événements synchrone : le métier y publie ce qui se passe, la présentation s'y abonne.
 */
export class EventBus {
  /** @type {Map<string, Set<EventListener>>} */
  #listeners = new Map();

  /** @type {Set<AnyEventListener>} */
  #anyListeners = new Set();

  /**
   * Abonne un écouteur à un type d'événement.
   * @param {string} type
   * @param {EventListener} listener
   * @returns {() => void} Fonction de désabonnement.
   */
  on(type, listener) {
    if (!this.#listeners.has(type)) {
      this.#listeners.set(type, new Set());
    }
    this.#listeners.get(type).add(listener);
    return () => this.off(type, listener);
  }

  /**
   * @param {string} type
   * @param {EventListener} listener
   */
  off(type, listener) {
    this.#listeners.get(type)?.delete(listener);
  }

  /**
   * Abonne un écouteur à tous les événements (utile pour le journal de debug).
   * @param {AnyEventListener} listener
   * @returns {() => void} Fonction de désabonnement.
   */
  onAny(listener) {
    this.#anyListeners.add(listener);
    return () => this.#anyListeners.delete(listener);
  }

  /**
   * Publie un événement, de façon synchrone.
   * @param {string} type
   * @param {object} [payload]
   */
  emit(type, payload = {}) {
    for (const listener of this.#listeners.get(type) ?? []) {
      listener(payload);
    }
    for (const listener of this.#anyListeners) {
      listener(type, payload);
    }
  }
}
