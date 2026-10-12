// @ts-check
import { TEXTS } from '../i18n/fr.js';
import { CenterWindow } from './CenterWindow.js';

/** @typedef {import('./inventoryView.js').InventoryContent} InventoryContent */

/**
 * Fenêtre d'inventaire (R-IHM-INV-001), en DOM : ressources, outils, livres avec « Lire ».
 * @augments {CenterWindow<InventoryContent>}
 */
export class InventoryPanel extends CenterWindow {
  /**
   * @param {object} params
   * @param {Document} params.doc
   * @param {HTMLElement} params.container
   * @param {() => void} params.onClose
   * @param {(bookId: string) => void} params.onRead Clic sur « Lire ».
   */
  constructor({ doc, container, onClose, onRead }) {
    super({ doc, container, title: TEXTS.inventoryTitle, className: 'inventory-panel', onClose });
    this.onRead = onRead;
  }

  /**
   * @param {InventoryContent} content
   */
  fill(content) {
    const resources = content.resources.map((entry) => {
      const item = this.element('li');
      item.append(this.iconLabel(entry.icon, `${entry.label} ${entry.amount}`));
      return item;
    });
    const tools = content.tools.map((tool) => {
      const item = this.element('li');
      item.append(this.iconLabel(tool.icon, tool.name));
      return item;
    });
    const books = content.books.map((book) => {
      const item = this.element('li', undefined, 'book');
      item.append(
        this.iconLabel(book.icon, book.title),
        this.button(content.readButton, () => this.onRead(book.id)),
      );
      return item;
    });
    const items = content.items.map((entry) => {
      const item = this.element('li');
      item.append(this.iconLabel(entry.icon, entry.name));
      return item;
    });
    const resourceList = this.list(resources, undefined);
    resourceList.className = 'resources';
    this.body.replaceChildren(
      this.element('h3', TEXTS.resourcesTitle),
      resourceList,
      this.element('h3', TEXTS.toolsTitle),
      this.list(tools, content.noTool),
      this.element('h3', TEXTS.booksTitle),
      this.list(books, content.noBook),
      this.element('h3', TEXTS.itemsTitle),
      this.list(items, content.noItem),
    );
  }
}
