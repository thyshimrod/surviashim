// @ts-check
import { TEXTS } from '../i18n/fr.js';
import { CenterWindow } from './CenterWindow.js';

/** @typedef {import('./researchView.js').ResearchContent} ResearchContent */

/**
 * Fenêtre de recherche (R-IHM-REC-001), en DOM : points, puis un plan par ligne.
 * @augments {CenterWindow<ResearchContent>}
 */
export class ResearchPanel extends CenterWindow {
  /**
   * @param {object} params
   * @param {Document} params.doc
   * @param {HTMLElement} params.container
   * @param {() => void} params.onClose
   * @param {(planId: string) => void} params.onResearch Clic sur « Rechercher ».
   */
  constructor({ doc, container, onClose, onResearch }) {
    super({ doc, container, title: TEXTS.researchTitle, className: 'research-panel', onClose });
    this.onResearch = onResearch;
  }

  /**
   * @param {ResearchContent} content
   */
  fill(content) {
    const entries = content.entries.map((entry) => {
      const item = this.element('li', undefined, 'recipe');
      item.append(this.iconLabel(entry.icon, entry.name), this.element('p', entry.cost));
      if (entry.warning !== undefined) {
        item.append(this.element('p', entry.warning, 'warning'));
      }
      item.append(this.button(entry.button, () => this.onResearch(entry.id), entry.isEnabled));
      return item;
    });
    this.body.replaceChildren(
      this.element('p', content.points, 'plans'),
      this.list(entries, content.empty),
    );
  }
}
