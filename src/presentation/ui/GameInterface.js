// @ts-check
import { nextPage } from '../../core/commands/commands.js';
import { TEXTS } from '../i18n/fr.js';
import { BookPanel } from './BookPanel.js';
import { bookView } from './bookView.js';
import { CraftPanel } from './CraftPanel.js';
import { craftView } from './craftView.js';
import { DialogueBox } from './DialogueBox.js';
import { gameMenuView } from './gameMenuView.js';
import { GamePanel } from './GamePanel.js';
import { dialogueCommandForKey, dialogueView } from './dialogueView.js';
import { NOTIFIED_EVENTS, notificationsFor } from './gameNotifications.js';
import { InspectPanel } from './InspectPanel.js';
import { hudEntries } from './inventoryEntries.js';
import { InventoryHud } from './InventoryHud.js';
import { InventoryPanel } from './InventoryPanel.js';
import { inventoryView } from './inventoryView.js';
import { JournalPanel } from './JournalPanel.js';
import { journalView } from './journalView.js';
import { NotificationList } from './NotificationList.js';
import { NotificationQueue } from './NotificationQueue.js';
import { ResearchPanel } from './ResearchPanel.js';
import { researchView } from './researchView.js';
import { Toolbar } from './Toolbar.js';
import { toolbarView } from './toolbarView.js';
import { WindowsController } from './WindowsController.js';

/** @typedef {import('../../core/Game.js').Game} Game */
/** @typedef {import('../input/designateTile.js').Target} Target */

/**
 * Interface en DOM au-dessus du canvas : bandeau de l'essentiel (R-IHM-HUD-003), fenêtres centrales
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
   * @param {number} [params.importantNotificationTicks] Durée d'une notification importante.
   * @param {() => number | undefined} [params.savedDay] Jour de la sauvegarde (R-IHM-SAU-001).
   * @param {() => void} [params.onRestart] Efface la sauvegarde et relance une partie.
   */
  constructor({
    doc,
    container,
    game,
    notificationTicks,
    importantNotificationTicks,
    savedDay = () => undefined,
    onRestart,
  }) {
    this.game = game;
    this.savedDay = savedDay;
    this.windows = new WindowsController();
    this.createWindows({ doc, container, onRestart });
    this.hud = new InventoryHud({ doc, container });
    this.toolbar = new Toolbar({ doc, container, onToggle: (id) => this.windows.toggle(id) });
    this.dialogue = new DialogueBox({ doc, container, onNext: () => game.execute(nextPage()) });
    this.notifications = new NotificationQueue(notificationTicks, importantNotificationTicks);
    this.notificationList = new NotificationList({
      doc,
      container,
      onDismiss: (id) => this.notifications.dismiss(id),
    });
    this.listenToGame();
  }

  /**
   * Fenêtres : information, inventaire, lecture, artisanat, partie, journal (R-IHM-FEN-001).
   * @param {{ doc: Document, container: HTMLElement, onRestart: (() => void) | undefined }} params
   */
  createWindows({ doc, container, onRestart }) {
    const { game } = this;
    const onClose = () => this.windows.close();
    this.panel = new InspectPanel({
      doc,
      container,
      onConfirm: () => this.windows.inspection.confirm(game),
      onSecondary: () => this.windows.inspection.secondary(game),
      onClose,
    });
    this.inventory = this.createInventory(doc, container);
    this.book = new BookPanel({ doc, container, onClose });
    this.craft = new CraftPanel({
      doc,
      container,
      onClose,
      onCraft: (recipeId) => this.windows.craft(recipeId, game),
    });
    this.gamePanel = new GamePanel({
      doc,
      container,
      onClose,
      onButton: (label) => this.onGameButton(label, onRestart),
    });
    this.journal = new JournalPanel({
      doc,
      container,
      onClose: () => this.windows.closeJournal(),
      onReread: (bookId) => this.windows.read(bookId, game),
    });
    this.research = new ResearchPanel({
      doc,
      container,
      onClose,
      onResearch: (planId) => this.windows.research(planId, game),
    });
  }

  /**
   * Fenêtre d'inventaire (R-IHM-INV-001).
   * @param {Document} doc
   * @param {HTMLElement} container
   * @returns {InventoryPanel}
   */
  createInventory(doc, container) {
    const { game, windows } = this;
    return new InventoryPanel({
      doc,
      container,
      onClose: () => windows.close(),
      onRead: (bookId) => windows.read(bookId, game),
      onPlace: (itemId) => windows.place(itemId, game),
      onEat: (resource) => windows.eat(resource, game),
      onUse: (resource) => windows.use(resource, game),
      onTab: (tab) => windows.showTab(tab),
    });
  }

  /**
   * Notifications : découvertes et indices (R-IHM-NOT-001), trouvailles (R-IHM-NOT-002), recettes
   * apprises (R-IHM-LIV-001), objets fabriqués (R-IHM-ART-001).
   */
  listenToGame() {
    for (const eventName of NOTIFIED_EVENTS) {
      this.game.events.on(eventName, (payload) => {
        for (const { text, important } of notificationsFor(eventName, payload)) {
          this.notifications.push(text, this.game.getState().tick, { important });
        }
      });
    }
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
   * R-IHM-SAU-001 : boutons de la fenêtre « Partie ».
   * @param {string} label
   * @param {(() => void) | undefined} onRestart
   */
  onGameButton(label, onRestart) {
    if (label === TEXTS.newGameButton) {
      this.windows.askNewGame();
    } else if (label === TEXTS.restartButton) {
      onRestart?.();
    } else {
      this.windows.cancelNewGame();
    }
  }

  /**
   * Fenêtres centrales : seule la fenêtre ouverte reçoit un contenu (R-IHM-FEN-001).
   * @param {import('../../core/state/GameState.js').GameState} state
   */
  renderWindows(state) {
    const { windows } = this;
    this.panel.render(windows.inspection.view(this.game));
    this.inventory.render(
      windows.open === 'inventory'
        ? inventoryView(state, this.game.rules, windows.inventoryTab)
        : undefined,
    );
    this.book.render(windows.bookId === undefined ? undefined : bookView(windows.bookId));
    this.craft.render(windows.open === 'craft' ? craftView(this.game) : undefined);
    this.research.render(windows.open === 'research' ? researchView(this.game) : undefined);
    this.gamePanel.render(
      windows.open === 'game'
        ? gameMenuView({ savedDay: this.savedDay(), confirming: windows.confirmingNewGame })
        : undefined,
    );
  }

  /** Met à jour l'interface, à chaque image. */
  render() {
    const state = this.game.getState();
    const { windows } = this;
    this.renderWindows(state);
    this.hud.render(hudEntries(state, this.game.time()));
    this.toolbar.render(toolbarView(windows));
    this.dialogue.render(dialogueView(state.dialogue));
    this.journal.render(
      windows.journalOpen ? journalView(state.journal, state.quests, state.readBooks) : undefined,
    );
    this.notificationList.render(this.notifications.entries(state.tick));
  }
}
