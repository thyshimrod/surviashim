// @ts-check
import { TEXTS } from '../i18n/fr.js';
import { iconElement } from './iconElement.js';

/**
 * Base des fenêtres centrales en DOM (R-IHM-FEN-001) : un titre, un bouton ×, un corps. Une
 * sous-classe remplit le corps dans `fill` ; la fenêtre ne touche au DOM que si le contenu change.
 * @template Content
 */
export class CenterWindow {
  /**
   * @param {object} params
   * @param {Document} params.doc
   * @param {HTMLElement} params.container
   * @param {string} params.title Titre affiché.
   * @param {string} params.className Classe CSS propre à la fenêtre.
   * @param {() => void} params.onClose Clic sur ×.
   */
  constructor({ doc, container, title, className, onClose }) {
    this.doc = doc;
    this.root = doc.createElement('section');
    this.root.className = `rpg-window center-window ${className}`;
    this.root.hidden = true;
    const closeButton = doc.createElement('button');
    closeButton.className = 'close';
    closeButton.textContent = '×';
    closeButton.title = TEXTS.closeButton;
    closeButton.addEventListener('click', onClose);
    this.title = doc.createElement('h2');
    this.title.textContent = title;
    this.body = doc.createElement('div');
    this.root.append(closeButton, this.title, this.body);
    container.append(this.root);
    this.lastRendered = '';
  }

  /**
   * Affiche la fenêtre avec ce contenu, ou la cache.
   * @param {Content | undefined} content `undefined` : fenêtre fermée.
   */
  render(content) {
    const signature = JSON.stringify(content ?? null);
    if (signature === this.lastRendered) {
      return;
    }
    this.lastRendered = signature;
    this.root.hidden = content === undefined;
    if (content !== undefined) {
      this.fill(content);
    }
  }

  /**
   * Remplit le corps de la fenêtre ; à redéfinir.
   * @param {Content} content
   */
  fill(content) {
    throw new Error(`${this.constructor.name}.fill must be overridden (got ${typeof content})`);
  }

  /**
   * @param {string} tag
   * @param {string} [text]
   * @param {string} [className]
   * @returns {HTMLElement}
   */
  element(tag, text, className) {
    const element = this.doc.createElement(tag);
    if (text !== undefined) {
      element.textContent = text;
    }
    if (className !== undefined) {
      element.className = className;
    }
    return element;
  }

  /**
   * Ligne « icône + libellé ».
   * @param {string} icon Clé de ICONS.
   * @param {string} label
   * @returns {HTMLElement}
   */
  iconLabel(icon, label) {
    const line = this.element('strong');
    line.append(iconElement(this.doc, icon), ` ${label}`);
    return line;
  }

  /**
   * Bouton d'action.
   * @param {string} label
   * @param {() => void} onClick
   * @param {boolean} [isEnabled]
   * @returns {HTMLButtonElement}
   */
  button(label, onClick, isEnabled = true) {
    const button = /** @type {HTMLButtonElement} */ (this.element('button', label, 'rpg-button'));
    button.disabled = !isEnabled;
    button.addEventListener('click', onClick);
    return button;
  }

  /**
   * Liste, ou message si elle est vide.
   * @param {HTMLElement[]} items Éléments `li`.
   * @param {string | undefined} emptyMessage
   * @returns {HTMLUListElement}
   */
  list(items, emptyMessage) {
    const list = /** @type {HTMLUListElement} */ (this.element('ul'));
    list.append(
      ...(emptyMessage === undefined ? items : [this.element('li', emptyMessage, 'empty')]),
    );
    return list;
  }
}
