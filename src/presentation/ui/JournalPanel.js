// @ts-check
import { TEXTS } from '../i18n/fr.js';
import { iconElement } from './iconElement.js';

/** @typedef {import('./journalView.js').JournalContent} JournalContent */
/** @typedef {import('./journalView.js').JournalLine} JournalLine */

/**
 * Journal (R-IHM-JRN-001, R-IHM-JRN-003, R-IHM-JRN-004), en DOM : les quêtes, les lieux, puis
 * les archives. La touche J ou
 * la barre d'actions l'ouvrent et le ferment (WindowsController).
 */
export class JournalPanel {
  /**
   * @param {object} params
   * @param {Document} params.doc
   * @param {HTMLElement} params.container
   * @param {() => void} params.onClose Clic sur × (R-IHM-JRN-001).
   * @param {(bookId: string) => void} params.onReread Clic sur « Relire » (R-IHM-JRN-004).
   */
  constructor({ doc, container, onClose, onReread }) {
    this.onReread = onReread;
    this.doc = doc;
    this.root = doc.createElement('section');
    this.root.className = 'rpg-window journal-panel';
    this.root.hidden = true;
    const closeButton = doc.createElement('button');
    closeButton.className = 'close';
    closeButton.textContent = '×';
    closeButton.title = TEXTS.closeButton;
    closeButton.addEventListener('click', onClose);
    const title = doc.createElement('h2');
    title.textContent = TEXTS.journalTitle;
    this.places = doc.createElement('ul');
    this.quests = doc.createElement('ul');
    this.archives = doc.createElement('ul');
    this.root.append(
      closeButton,
      title,
      this.heading(TEXTS.questsTitle),
      this.quests,
      this.heading(TEXTS.placesTitle),
      this.places,
      this.heading(TEXTS.archivesTitle),
      this.archives,
    );
    container.append(this.root);
    this.lastRendered = '';
  }

  /**
   * Met à jour le contenu ; ne touche au DOM que s'il a changé.
   * @param {JournalContent | undefined} content `undefined` : journal fermé.
   */
  render(content) {
    const signature = JSON.stringify(content ?? null);
    if (signature === this.lastRendered) {
      return;
    }
    this.lastRendered = signature;
    this.root.hidden = content === undefined;
    if (content === undefined) {
      return;
    }
    this.quests.replaceChildren(
      ...(content.noQuest === undefined
        ? content.quests.map((quest) => this.questItem(quest))
        : [this.emptyItem(content.noQuest)]),
    );
    this.places.replaceChildren(
      ...(content.empty === undefined
        ? content.lines.map((line) => this.placeItem(line))
        : [this.emptyItem(content.empty)]),
    );
    this.archives.replaceChildren(
      ...(content.noArchive === undefined
        ? content.archives.map((book) => this.archiveItem(book))
        : [this.emptyItem(content.noArchive)]),
    );
  }

  /**
   * @param {import('./journalView.js').ArchivedBook} book
   * @returns {HTMLLIElement}
   */
  archiveItem(book) {
    const item = this.doc.createElement('li');
    item.className = 'archive';
    const title = this.doc.createElement('span');
    title.textContent = book.title;
    const button = this.doc.createElement('button');
    button.textContent = book.button;
    button.addEventListener('click', () => this.onReread(book.id));
    item.append(iconElement(this.doc, book.icon), title, button);
    return item;
  }

  /**
   * @param {string} text
   * @returns {HTMLHeadingElement}
   */
  heading(text) {
    const heading = this.doc.createElement('h3');
    heading.textContent = text;
    return heading;
  }

  /**
   * @param {string} text
   * @returns {HTMLLIElement}
   */
  emptyItem(text) {
    const item = this.doc.createElement('li');
    item.className = 'empty';
    item.textContent = text;
    return item;
  }

  /**
   * @param {JournalLine} line
   * @returns {HTMLLIElement}
   */
  placeItem(line) {
    const item = this.doc.createElement('li');
    const heading = this.doc.createElement('strong');
    heading.textContent = `${line.place} — ${line.status}`;
    item.append(heading);
    if (line.hint !== undefined) {
      item.append(this.paragraph(line.hint));
    }
    return item;
  }

  /**
   * @param {import('./journalView.js').JournalQuest} quest
   * @returns {HTMLLIElement}
   */
  questItem(quest) {
    const item = this.doc.createElement('li');
    const heading = this.doc.createElement('strong');
    heading.textContent = quest.heading;
    item.append(heading, this.paragraph(quest.description));
    return item;
  }

  /**
   * @param {string} text
   * @returns {HTMLParagraphElement}
   */
  paragraph(text) {
    const paragraph = this.doc.createElement('p');
    paragraph.textContent = text;
    return paragraph;
  }
}
