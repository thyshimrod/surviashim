// @ts-check
import { TEXTS } from '../i18n/fr.js';
import { CenterWindow } from './CenterWindow.js';

/** @typedef {import('./gameMenuView.js').GameMenuContent} GameMenuContent */

/**
 * Fenêtre « Partie » (R-IHM-SAU-001), en DOM : état de la sauvegarde et nouvelle partie.
 * @augments {CenterWindow<GameMenuContent>}
 */
export class GamePanel extends CenterWindow {
  /**
   * @param {object} params
   * @param {Document} params.doc
   * @param {HTMLElement} params.container
   * @param {() => void} params.onClose
   * @param {(label: string) => void} params.onButton Clic sur un bouton, par son libellé.
   */
  constructor({ doc, container, onClose, onButton }) {
    super({ doc, container, title: TEXTS.gameTitle, className: 'game-panel', onClose });
    this.onButton = onButton;
  }

  /**
   * @param {GameMenuContent} content
   */
  fill(content) {
    const buttons = this.element('div', undefined, 'buttons');
    buttons.append(
      ...content.buttons.map((label) => this.button(label, () => this.onButton(label))),
    );
    this.body.replaceChildren(
      this.element('p', content.status),
      ...(content.question === undefined ? [] : [this.element('p', content.question, 'warning')]),
      buttons,
    );
  }
}
