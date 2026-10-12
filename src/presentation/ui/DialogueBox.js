// @ts-check

/** @typedef {import('./dialogueView.js').DialogueView} DialogueView */

/**
 * Boîte de dialogue (R-IHM-DIA-001), en DOM en bas de l'écran. Un clic sur la boîte demande la
 * page suivante.
 */
export class DialogueBox {
  /**
   * @param {object} params
   * @param {Document} params.doc
   * @param {HTMLElement} params.container
   * @param {() => void} params.onNext Clic sur la boîte.
   */
  constructor({ doc, container, onNext }) {
    this.root = doc.createElement('section');
    this.root.className = 'rpg-window dialogue-box';
    this.root.hidden = true;
    this.speaker = doc.createElement('h2');
    this.text = doc.createElement('p');
    this.more = doc.createElement('span');
    this.more.className = 'more';
    this.root.append(this.speaker, this.text, this.more);
    this.root.addEventListener('click', onNext);
    container.append(this.root);
    this.lastRendered = '';
  }

  /**
   * Met à jour la boîte ; ne touche au DOM que si le contenu a changé.
   * @param {DialogueView | undefined} view `undefined` : pas de dialogue.
   */
  render(view) {
    const signature = JSON.stringify(view ?? null);
    if (signature === this.lastRendered) {
      return;
    }
    this.lastRendered = signature;
    this.root.hidden = view === undefined;
    if (view !== undefined) {
      this.speaker.textContent = view.speaker;
      this.text.textContent = view.text;
      this.more.textContent = view.more ?? '';
    }
  }
}
