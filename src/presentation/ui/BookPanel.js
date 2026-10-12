// @ts-check
import { CenterWindow } from './CenterWindow.js';

/** @typedef {import('./bookView.js').BookContent} BookContent */

/**
 * Fenêtre de lecture (R-IHM-LIV-001), en DOM : titre, texte, recettes.
 * @augments {CenterWindow<BookContent>}
 */
export class BookPanel extends CenterWindow {
  /**
   * @param {object} params
   * @param {Document} params.doc
   * @param {HTMLElement} params.container
   * @param {() => void} params.onClose
   */
  constructor({ doc, container, onClose }) {
    super({ doc, container, title: '', className: 'book-panel', onClose });
  }

  /**
   * @param {BookContent} content
   */
  fill(content) {
    this.title.replaceChildren(this.iconLabel(content.icon, content.title));
    this.body.replaceChildren(
      this.element('p', content.text, 'book-text'),
      this.element('p', content.recipes, 'plans'),
    );
  }
}
