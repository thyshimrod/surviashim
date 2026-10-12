// @ts-check
import { TEXTS } from '../i18n/fr.js';

/** @typedef {import('./InspectionController.js').InspectionView} InspectionView */

/**
 * Fenêtre d'information (R-IHM-INS-002 à 005), en DOM au-dessus du canvas. Elle affiche ce que
 * lui donne InspectionController et lui renvoie les clics ; elle ne décide de rien.
 */
export class InspectPanel {
  /**
   * @param {object} params
   * @param {Document} params.doc
   * @param {HTMLElement} params.container Élément qui reçoit la fenêtre.
   * @param {() => void} params.onConfirm Clic sur le bouton d'action (« Récolter », « Parler »).
   * @param {() => void} params.onSecondary Clic sur le second bouton (« Donner », « Dormir »).
   * @param {() => void} params.onClose Clic sur ×.
   */
  constructor({ doc, container, onConfirm, onSecondary, onClose }) {
    this.root = doc.createElement('section');
    this.root.className = 'rpg-window inspect-panel';
    this.root.hidden = true;
    this.title = doc.createElement('h2');
    this.action = doc.createElement('p');
    this.warning = doc.createElement('p');
    this.warning.className = 'warning';
    this.actionButton = doc.createElement('button');
    this.actionButton.className = 'rpg-button';
    this.actionButton.addEventListener('click', onConfirm);
    this.giveAction = doc.createElement('p');
    this.giveButton = doc.createElement('button');
    this.giveButton.className = 'rpg-button';
    this.giveButton.addEventListener('click', onSecondary);
    const closeButton = doc.createElement('button');
    closeButton.className = 'close';
    closeButton.textContent = '×';
    closeButton.title = TEXTS.closeButton;
    closeButton.addEventListener('click', onClose);
    const buttons = doc.createElement('div');
    buttons.className = 'buttons';
    buttons.append(this.actionButton, this.giveButton);
    this.root.append(closeButton, this.title, this.action, this.giveAction, this.warning, buttons);
    container.append(this.root);
    this.lastRendered = '';
  }

  /**
   * Met à jour la fenêtre ; ne touche au DOM que si le contenu a changé.
   * @param {InspectionView | undefined} view `undefined` : fenêtre fermée.
   */
  render(view) {
    const signature = JSON.stringify(view ?? null);
    if (signature === this.lastRendered) {
      return;
    }
    this.lastRendered = signature;
    this.root.hidden = view === undefined;
    if (view === undefined) {
      return;
    }
    this.title.textContent = view.title;
    this.action.textContent = view.action;
    this.warning.textContent = view.warning ?? '';
    this.warning.hidden = view.warning === undefined;
    this.actionButton.textContent = view.button;
    this.actionButton.disabled = !view.isActionEnabled;
    this.renderSecondary(view.give ?? view.sleep);
  }

  /**
   * Second bouton, « Donner » (R-IHM-INS-005) ou « Dormir » (R-IHM-INS-008), avec son texte ;
   * caché s'il n'y en a pas.
   * @param {{ action?: string, warning?: string, button: string, isEnabled: boolean } | undefined} secondary
   */
  renderSecondary(secondary) {
    const text = secondary?.action ?? secondary?.warning;
    this.giveAction.hidden = text === undefined;
    this.giveButton.hidden = secondary === undefined;
    this.giveAction.textContent = text ?? '';
    this.giveButton.textContent = secondary?.button ?? '';
    this.giveButton.disabled = !(secondary?.isEnabled ?? false);
  }
}
