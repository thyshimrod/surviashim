// @ts-check
import { iconElement } from './iconElement.js';

/** @typedef {import('./toolbarView.js').ToolbarButton} ToolbarButton */

/**
 * Barre d'actions (R-IHM-BAR-001), en DOM : une colonne d'icônes à gauche, sous le bandeau.
 * Le nom et la touche s'affichent au survol (attribut `title`).
 */
export class Toolbar {
  /**
   * @param {object} params
   * @param {Document} params.doc
   * @param {HTMLElement} params.container
   * @param {(id: ToolbarButton['id']) => void} params.onToggle Clic sur une icône.
   */
  constructor({ doc, container, onToggle }) {
    this.doc = doc;
    this.onToggle = onToggle;
    this.root = doc.createElement('nav');
    this.root.className = 'rpg-window toolbar';
    container.append(this.root);
    this.lastRendered = '';
  }

  /**
   * Met à jour la barre ; ne touche au DOM que si elle a changé.
   * @param {readonly ToolbarButton[]} buttons
   */
  render(buttons) {
    const signature = JSON.stringify(buttons);
    if (signature === this.lastRendered) {
      return;
    }
    this.lastRendered = signature;
    this.root.replaceChildren(...buttons.map((button) => this.createButton(button)));
  }

  /**
   * @param {ToolbarButton} button
   * @returns {HTMLButtonElement}
   */
  createButton({ id, icon, label, isActive }) {
    const element = this.doc.createElement('button');
    element.className = isActive ? 'active' : '';
    element.title = label;
    element.setAttribute('aria-label', label);
    element.append(iconElement(this.doc, icon));
    element.addEventListener('click', () => {
      element.blur(); // Les touches du jeu ne doivent pas réactiver le bouton.
      this.onToggle(id);
    });
    return element;
  }
}
