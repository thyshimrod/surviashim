// @ts-check

/**
 * Notification affichée.
 * @typedef {object} Notification
 * @property {number} id Identifiant, pour la fermer.
 * @property {string} text
 */

/**
 * Notifications (R-IHM-NOT-001), comptées en ticks de jeu : elles ne s'écoulent pas quand le jeu
 * est en pause. Une notification importante reste plus longtemps.
 */
export class NotificationQueue {
  /**
   * @param {number} durationTicks Durée d'affichage d'une notification ordinaire.
   * @param {number} [importantTicks] Durée d'une notification importante.
   */
  constructor(durationTicks, importantTicks = durationTicks) {
    this.durationTicks = durationTicks;
    this.importantTicks = importantTicks;
    /** @type {{ id: number, text: string, untilTick: number }[]} */
    this.items = [];
    this.nextId = 1;
  }

  /**
   * @param {string} text
   * @param {number} tick Tick où la notification apparaît.
   * @param {{ important?: boolean }} [options] `important` : reste `importantTicks` ticks.
   * @returns {number} Identifiant de la notification.
   */
  push(text, tick, { important = false } = {}) {
    const id = this.nextId;
    this.nextId += 1;
    this.items.push({
      id,
      text,
      untilTick: tick + (important ? this.importantTicks : this.durationTicks),
    });
    return id;
  }

  /**
   * Ferme une notification (bouton ×).
   * @param {number} id
   */
  dismiss(id) {
    this.items = this.items.filter((item) => item.id !== id);
  }

  /**
   * Notifications visibles, la plus ancienne d'abord (la plus récente en bas).
   * @param {number} tick
   * @returns {Notification[]}
   */
  entries(tick) {
    this.items = this.items.filter((item) => tick < item.untilTick);
    return this.items.map(({ id, text }) => ({ id, text }));
  }

  /**
   * Textes visibles, la plus ancienne d'abord.
   * @param {number} tick
   * @returns {string[]}
   */
  visible(tick) {
    return this.entries(tick).map((item) => item.text);
  }
}
