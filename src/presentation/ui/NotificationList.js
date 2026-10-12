// @ts-check
import { TEXTS } from '../i18n/fr.js';

/** @typedef {import('./NotificationQueue.js').Notification} Notification */

/**
 * Notifications (R-IHM-NOT-001), en DOM au-dessus du héros, chacune avec un bouton ×.
 */
export class NotificationList {
  /**
   * @param {object} params
   * @param {Document} params.doc
   * @param {HTMLElement} params.container
   * @param {(id: number) => void} params.onDismiss Clic sur ×.
   */
  constructor({ doc, container, onDismiss }) {
    this.doc = doc;
    this.onDismiss = onDismiss;
    this.root = doc.createElement('ul');
    this.root.className = 'notifications';
    container.append(this.root);
    this.lastRendered = '';
  }

  /**
   * Met à jour la liste ; ne touche au DOM que si elle a changé.
   * @param {readonly Notification[]} notifications La plus ancienne d'abord.
   */
  render(notifications) {
    const signature = JSON.stringify(notifications);
    if (signature === this.lastRendered) {
      return;
    }
    this.lastRendered = signature;
    this.root.replaceChildren(
      ...notifications.map((notification) => this.createItem(notification)),
    );
  }

  /**
   * @param {Notification} notification
   * @returns {HTMLLIElement}
   */
  createItem({ id, text }) {
    const item = this.doc.createElement('li');
    item.className = 'rpg-window';
    const label = this.doc.createElement('span');
    label.textContent = text;
    const close = this.doc.createElement('button');
    close.className = 'close';
    close.textContent = '×';
    close.title = TEXTS.closeButton;
    close.addEventListener('click', () => this.onDismiss(id));
    item.append(label, close);
    return item;
  }
}
