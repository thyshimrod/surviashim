// @ts-check
import { GAME_EVENTS } from '../../core/events/gameEvents.js';
import { nextPage } from '../../core/commands/commands.js';
import { TEXTS } from '../i18n/fr.js';
import { CONTENT_TEXTS } from '../i18n/frContent.js';
import { BookPanel } from './BookPanel.js';
import { bookView } from './bookView.js';
import { craftedMessage, learnedMessages } from './craftingMessages.js';
import { CraftPanel } from './CraftPanel.js';
import { craftView } from './craftView.js';
import { DialogueBox } from './DialogueBox.js';
import { dialogueCommandForKey, dialogueView } from './dialogueView.js';
import { findingsMessages } from './findingsMessages.js';
import { InspectPanel } from './InspectPanel.js';
import { experienceEntry, inventoryEntries } from './inventoryEntries.js';
import { InventoryHud } from './InventoryHud.js';
import { InventoryPanel } from './InventoryPanel.js';
import { inventoryView } from './inventoryView.js';
import { JournalPanel } from './JournalPanel.js';
import { journalView } from './journalView.js';
import { NotificationList } from './NotificationList.js';
import { NotificationQueue } from './NotificationQueue.js';
import { questCompletedMessages, questStartedMessage } from './questMessages.js';
import { Toolbar } from './Toolbar.js';
import { toolbarView } from './toolbarView.js';
import { WindowsController } from './WindowsController.js';

/** @typedef {import('../../core/Game.js').Game} Game */
/** @typedef {import('../input/designateTile.js').Target} Target */

/**
 * Interface en DOM au-dessus du canvas : bandeau d'inventaire (R-IHM-HUD-001), fenêtres centrales
 * (R-IHM-FEN-001 : information, inventaire, lecture, artisanat), boîte de dialogue
 * (R-IHM-DIA-001), journal (R-IHM-JRN-001), notifications (R-IHM-NOT-001), barre d'actions
 * (R-IHM-BAR-001). Elle lit l'état et envoie des commandes ; elle ne décide d'aucune règle.
 */
export class GameInterface {
  /**
   * @param {object} params
   * @param {Document} params.doc
   * @param {HTMLElement} params.container
   * @param {Game} params.game
   * @param {number} params.notificationTicks Durée d'une notification (ticks).
   */
  constructor({ doc, container, game, notificationTicks }) {
    this.game = game;
    this.windows = new WindowsController();
    const onClose = () => this.windows.close();
    this.panel = new InspectPanel({
      doc,
      container,
      onConfirm: () => this.windows.inspection.confirm(game),
      onGive: () => this.windows.inspection.give(game),
      onClose,
    });
    this.inventory = new InventoryPanel({
      doc,
      container,
      onClose,
      onRead: (bookId) => this.windows.read(bookId, game),
    });
    this.book = new BookPanel({ doc, container, onClose });
    this.craft = new CraftPanel({
      doc,
      container,
      onClose,
      onCraft: (recipeId) => this.windows.craft(recipeId, game),
    });
    this.hud = new InventoryHud({ doc, container });
    this.toolbar = new Toolbar({ doc, container, onToggle: (id) => this.windows.toggle(id) });
    this.dialogue = new DialogueBox({ doc, container, onNext: () => game.execute(nextPage()) });
    this.journal = new JournalPanel({ doc, container, onClose: () => this.windows.closeJournal() });
    this.notifications = new NotificationQueue(notificationTicks);
    this.notificationList = new NotificationList({ doc, container });
    this.listenToGame();
  }

  /**
   * Notifications : découvertes et indices (R-IHM-NOT-001), trouvailles (R-IHM-NOT-002), recettes
   * apprises (R-IHM-LIV-001), objets fabriqués (R-IHM-ART-001).
   */
  listenToGame() {
    const { events } = this.game;
    const notify = (/** @type {string} */ message) =>
      this.notifications.push(message, this.game.getState().tick);
    const placeName = (/** @type {string} */ id) => CONTENT_TEXTS.placeNames[id] ?? id;
    events.on(GAME_EVENTS.PLACE_DISCOVERED, ({ placeId }) =>
      this.notifications.push(TEXTS.placeDiscovered(placeName(placeId)), this.game.getState().tick),
    );
    events.on(GAME_EVENTS.PLACE_RUMORED, ({ placeId }) =>
      this.notifications.push(TEXTS.placeRumored(placeName(placeId)), this.game.getState().tick),
    );
    // R-IHM-NOT-002 : trouvailles d'une fouille.
    events.on(GAME_EVENTS.ITEMS_FOUND, ({ books, items, resources }) =>
      findingsMessages({ books, items, resources }).forEach(notify),
    );
    events.on(GAME_EVENTS.BOOK_READ, ({ recipes }) => learnedMessages(recipes).forEach(notify));
    events.on(GAME_EVENTS.ITEM_CRAFTED, ({ tool }) => notify(craftedMessage(tool)));
    events.on(GAME_EVENTS.QUEST_STARTED, ({ questId }) => notify(questStartedMessage(questId)));
    events.on(GAME_EVENTS.QUEST_COMPLETED, ({ questId, experience }) =>
      questCompletedMessages(questId, experience).forEach(notify),
    );
  }

  /**
   * Clic sur le monde : pendant un dialogue, il est ignoré ; sinon il désigne un PNJ ou une tuile.
   * @param {Target | undefined} target
   */
  handleWorldClick(target) {
    if (this.game.getState().dialogue === undefined) {
      this.windows.designate(target, this.game);
    }
  }

  /**
   * Touches de l'interface, par ordre de priorité : dialogue, puis fenêtres et journal.
   * @param {string} key Valeur de `KeyboardEvent.key`.
   * @returns {boolean} `true` si la touche a été utilisée.
   */
  handleKey(key) {
    if (this.game.getState().dialogue !== undefined) {
      const command = dialogueCommandForKey(key);
      if (command !== undefined) {
        this.game.execute(command);
      }
      return command !== undefined;
    }
    return this.windows.handleKey(key);
  }

  /**
   * Fenêtres centrales : seule la fenêtre ouverte reçoit un contenu (R-IHM-FEN-001).
   * @param {import('../../core/state/GameState.js').GameState} state
   */
  renderWindows(state) {
    const { windows } = this;
    this.panel.render(windows.inspection.view(this.game));
    this.inventory.render(windows.open === 'inventory' ? inventoryView(state) : undefined);
    this.book.render(windows.bookId === undefined ? undefined : bookView(windows.bookId));
    this.craft.render(windows.open === 'craft' ? craftView(this.game) : undefined);
  }

  /** Met à jour l'interface, à chaque image. */
  render() {
    const state = this.game.getState();
    const { windows } = this;
    this.renderWindows(state);
    this.hud.render([...inventoryEntries(state.inventory), experienceEntry(state.experience)]);
    this.toolbar.render(toolbarView(windows));
    this.dialogue.render(dialogueView(state.dialogue));
    this.journal.render(
      windows.journalOpen ? journalView(state.journal, state.books, state.quests) : undefined,
    );
    this.notificationList.render(this.notifications.visible(state.tick));
  }
}
