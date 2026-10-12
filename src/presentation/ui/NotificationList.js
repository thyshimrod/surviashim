// @ts-check

/**
 * Notifications (R-IHM-NOT-001), en DOM en haut au centre de l'écran.
 */
export class NotificationList {
  /**
   * @param {object} params
   * @param {Document} params.doc
   * @param {HTMLElement} params.container
   */
  constructor({ doc, container }) {
    this.doc = doc;
    this.root = doc.createElement('ul');
    this.root.className = 'notifications';
    container.append(this.root);
    this.lastRendered = '';
  }

  /**
   * Met à jour la liste ; ne touche au DOM que si elle a changé.
   * @param {readonly string[]} texts La plus ancienne d'abord.
   */
  render(texts) {
    const signature = JSON.stringify(texts);
    if (signature === this.lastRendered) {
      return;
    }
    this.lastRendered = signature;
    this.root.replaceChildren(
      ...texts.map((text) => {
        const item = this.doc.createElement('li');
        item.className = 'rpg-window';
        item.textContent = text;
        return item;
      }),
    );
  }
}
