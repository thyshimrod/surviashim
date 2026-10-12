// @ts-check
import { iconElement } from './iconElement.js';

/** @typedef {import('./inventoryEntries.js').InventoryEntry} InventoryEntry */

/**
 * Bandeau d'inventaire (R-IHM-HUD-001), en DOM en haut à gauche, avec les icônes de l'atlas.
 */
export class InventoryHud {
  /**
   * @param {object} params
   * @param {Document} params.doc
   * @param {HTMLElement} params.container
   */
  constructor({ doc, container }) {
    this.doc = doc;
    this.root = doc.createElement('ul');
    this.root.className = 'rpg-window inventory-hud';
    container.append(this.root);
    this.lastRendered = '';
  }

  /**
   * Met à jour le bandeau ; ne touche au DOM que si le contenu a changé.
   * @param {readonly InventoryEntry[]} entries
   */
  render(entries) {
    const signature = JSON.stringify(entries);
    if (signature === this.lastRendered) {
      return;
    }
    this.lastRendered = signature;
    this.root.replaceChildren(...entries.map((entry) => this.createItem(entry)));
  }

  /**
   * @param {InventoryEntry} entry
   * @returns {HTMLLIElement}
   */
  createItem(entry) {
    const item = this.doc.createElement('li');
    item.dataset.resource = entry.id;
    const label = this.doc.createElement('span');
    label.textContent = entry.amount === undefined ? entry.label : `${entry.label} ${entry.amount}`;
    item.append(iconElement(this.doc, entry.icon), label);
    return item;
  }
}
