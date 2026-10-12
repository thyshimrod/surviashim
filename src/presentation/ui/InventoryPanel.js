// @ts-check
import { TEXTS } from '../i18n/fr.js';
import { CenterWindow } from './CenterWindow.js';

/** @typedef {import('./inventoryView.js').InventoryContent} InventoryContent */

/**
 * Fenêtre d'inventaire (R-IHM-INV-001), en DOM : des onglets, puis le contenu de l'onglet affiché.
 * @augments {CenterWindow<InventoryContent>}
 */
export class InventoryPanel extends CenterWindow {
  /**
   * @param {object} params
   * @param {Document} params.doc
   * @param {HTMLElement} params.container
   * @param {() => void} params.onClose
   * @param {(bookId: string) => void} params.onRead Clic sur « Lire ».
   * @param {(itemId: string) => void} params.onPlace Clic sur « Poser ».
   * @param {(resource: string) => void} params.onEat Clic sur « Manger ».
   * @param {(resource: string) => void} params.onUse Clic sur « Brûler ».
   * @param {(tab: import('./inventoryView.js').InventoryTab) => void} params.onTab Clic sur un
   *   onglet.
   */
  constructor({ doc, container, onClose, onRead, onPlace, onEat, onUse, onTab }) {
    super({ doc, container, title: TEXTS.inventoryTitle, className: 'inventory-panel', onClose });
    this.onRead = onRead;
    this.onPlace = onPlace;
    this.onEat = onEat;
    this.onUse = onUse;
    this.onTab = onTab;
  }

  /**
   * @param {InventoryContent} content
   */
  fill(content) {
    const tabs = this.element('div', undefined, 'tabs');
    tabs.append(
      ...content.tabs.map((tab) => {
        const button = this.button(tab.label, () => this.onTab(tab.id));
        button.classList.toggle('active', tab.isActive);
        return button;
      }),
    );
    this.body.replaceChildren(tabs, this.tabContent(content));
  }

  /**
   * Contenu de l'onglet affiché.
   * @param {InventoryContent} content
   * @returns {HTMLElement}
   */
  tabContent(content) {
    const resources = content.resources.map((entry) =>
      this.line(entry.icon, `${entry.label} ${entry.amount}`, this.resourceButton(entry)),
    );
    const tools = content.tools.map((tool) => this.line(tool.icon, tool.name));
    const books = content.books.map((book) =>
      this.line(
        book.icon,
        book.title,
        this.button(content.readButton, () => this.onRead(book.id)),
      ),
    );
    const items = content.items.map((entry) => this.line(entry.icon, entry.name));
    const placeables = content.placeables.map((entry) =>
      this.line(
        entry.icon,
        entry.label,
        this.button(entry.button, () => this.onPlace(entry.id)),
      ),
    );
    if (content.tab === 'tools') {
      return this.list(tools, content.noTool);
    }
    if (content.tab === 'books') {
      return this.list(books, content.noBook);
    }
    if (content.tab === 'items') {
      return this.list([...items, ...placeables], content.noItem);
    }
    const resourceList = this.list(resources, undefined);
    resourceList.className = 'resources';
    return resourceList;
  }

  /**
   * Ligne « icône + libellé », avec un bouton éventuel.
   * @param {string} icon
   * @param {string} label
   * @param {HTMLButtonElement} [button]
   * @returns {HTMLElement}
   */
  line(icon, label, button) {
    const item = this.element('li', undefined, button === undefined ? undefined : 'book');
    item.append(this.iconLabel(icon, label), ...(button === undefined ? [] : [button]));
    return item;
  }

  /**
   * Bouton d'une ressource : « Manger » ou « Brûler », s'il y en a un.
   * @param {import('./inventoryView.js').InventoryContent['resources'][number]} entry
   * @returns {HTMLButtonElement | undefined}
   */
  resourceButton(entry) {
    if (entry.eat !== undefined) {
      return this.button(entry.eat.button, () => this.onEat(entry.id), entry.eat.isEnabled);
    }
    if (entry.use !== undefined) {
      return this.button(entry.use.button, () => this.onUse(entry.id), entry.use.isEnabled);
    }
    return undefined;
  }
}
