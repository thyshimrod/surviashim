// @ts-check

/**
 * Notifications à durée limitée (R-IHM-NOT-001), comptées en ticks de jeu : elles ne s'écoulent
 * pas quand le jeu est en pause.
 */
export class NotificationQueue {
  /** @param {number} durationTicks Durée d'affichage de chaque notification. */
  constructor(durationTicks) {
    this.durationTicks = durationTicks;
    /** @type {{ text: string, untilTick: number }[]} */
    this.items = [];
  }

  /**
   * @param {string} text
   * @param {number} tick Tick où la notification apparaît.
   */
  push(text, tick) {
    this.items.push({ text, untilTick: tick + this.durationTicks });
  }

  /**
   * Notifications visibles, la plus ancienne d'abord (la plus récente en bas).
   * @param {number} tick
   * @returns {string[]}
   */
  visible(tick) {
    this.items = this.items.filter((item) => tick < item.untilTick);
    return this.items.map((item) => item.text);
  }
}
