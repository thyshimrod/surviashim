// @ts-check
import { TEXTS } from '../i18n/fr.js';
import { CenterWindow } from './CenterWindow.js';

/** @typedef {import('./craftView.js').CraftContent} CraftContent */

/**
 * Fenêtre d'artisanat (R-IHM-ART-001), en DOM : une ligne par recette, avec « Fabriquer ».
 * @augments {CenterWindow<CraftContent>}
 */
export class CraftPanel extends CenterWindow {
  /**
   * @param {object} params
   * @param {Document} params.doc
   * @param {HTMLElement} params.container
   * @param {() => void} params.onClose
   * @param {(recipeId: string) => void} params.onCraft Clic sur « Fabriquer ».
   */
  constructor({ doc, container, onClose, onCraft }) {
    super({ doc, container, title: TEXTS.craftTitle, className: 'craft-panel', onClose });
    this.onCraft = onCraft;
  }

  /**
   * @param {CraftContent} content
   */
  fill(content) {
    const entries = content.entries.map((entry) => {
      const item = this.element('li', undefined, 'recipe');
      item.append(
        this.iconLabel(entry.icon, entry.name),
        this.element('p', entry.ingredients, 'ingredients'),
      );
      if (entry.warning !== undefined) {
        item.append(this.element('p', entry.warning, 'warning'));
      }
      item.append(this.button(entry.button, () => this.onCraft(entry.id), entry.isEnabled));
      return item;
    });
    this.body.replaceChildren(this.list(entries, content.empty));
  }
}
