// @ts-check
import { craftItem, eat, placeItem, readBook } from '../../core/commands/commands.js';
import { InspectionController } from './InspectionController.js';

/** @typedef {import('../input/designateTile.js').Target} Target */
/** @typedef {import('./InspectionController.js').InspectableGame} InspectableGame */
/** @typedef {import('../../core/commands/commands.js').CommandResult} CommandResult */

/**
 * Fenêtre centrale ouverte (R-IHM-FEN-001).
 * @typedef {'inspection' | 'inventory' | 'book' | 'craft' | 'journal' | 'game'} WindowName
 */

/** Touches qui ouvrent et ferment une fenêtre (R-IHM-INV-001, R-IHM-ART-001, R-IHM-JRN-001). */
const TOGGLE_KEYS = Object.freeze({ i: 'inventory', c: 'craft', j: 'journal' });
const CLOSE_KEY = 'Escape';

/**
 * Logique des fenêtres centrales, sans DOM (R-IHM-FEN-001) : fenêtre d'information, inventaire,
 * lecture, artisanat. Une seule est ouverte à la fois.
 */
export class WindowsController {
  /** Crée un contrôleur sans fenêtre ouverte. */
  constructor() {
    this.inspection = new InspectionController();
    /** @type {'inventory' | 'book' | 'craft' | 'journal' | 'game' | undefined} */
    this.panel = undefined;
    /** La fenêtre « Partie » demande confirmation d'une nouvelle partie (R-IHM-SAU-001). */
    this.confirmingNewGame = false;
    /** @type {string | undefined} Livre affiché par la fenêtre de lecture. */
    this.bookId = undefined;
  }

  /** `true` si le journal est ouvert. */
  get journalOpen() {
    return this.panel === 'journal';
  }

  /**
   * @returns {WindowName | undefined} La fenêtre ouverte.
   */
  get open() {
    return this.inspection.isOpen ? 'inspection' : this.panel;
  }

  /**
   * Désigne un élément du monde : la fenêtre d'information remplace la fenêtre ouverte, si elle
   * s'ouvre (R-IHM-INS-002).
   * @param {Target | undefined} target
   * @param {InspectableGame} game
   */
  designate(target, game) {
    this.inspection.designate(target, game);
    if (this.inspection.isOpen) {
      this.panel = undefined;
    }
  }

  /**
   * I et C ouvrent ou ferment leur fenêtre ; Échap ferme la fenêtre ouverte.
   * @param {string} key Valeur de `KeyboardEvent.key`.
   * @returns {boolean} `true` si la touche a été utilisée.
   */
  handleKey(key) {
    if (key === CLOSE_KEY) {
      const wasOpen = this.open !== undefined;
      this.close();
      return wasOpen;
    }
    const panel = TOGGLE_KEYS[/** @type {keyof typeof TOGGLE_KEYS} */ (key.toLowerCase())];
    if (panel === undefined) {
      return false;
    }
    this.toggle(panel);
    return true;
  }

  /**
   * Ouvre ou ferme une fenêtre : touche ou clic sur la barre d'actions (R-IHM-BAR-001).
   * @param {'inventory' | 'craft' | 'journal' | 'game'} name
   */
  toggle(name) {
    this.show(this.panel === name ? undefined : name);
  }

  /** R-IHM-JRN-001 : ferme le journal (bouton ×). */
  closeJournal() {
    if (this.journalOpen) {
      this.close();
    }
  }

  /**
   * R-IHM-LIV-001 : lit un livre et ouvre la fenêtre de lecture.
   * @param {string} bookId
   * @param {InspectableGame} game
   * @returns {CommandResult}
   */
  read(bookId, game) {
    const result = game.execute(readBook(bookId));
    if (result.ok) {
      this.show('book');
      this.bookId = bookId;
    }
    return result;
  }

  /**
   * R-IHM-ART-001 : fabrique l'objet d'une recette ; la fenêtre d'artisanat reste ouverte.
   * @param {string} recipeId
   * @param {InspectableGame} game
   * @returns {CommandResult}
   */
  craft(recipeId, game) {
    return game.execute(craftItem(recipeId));
  }

  /**
   * R-IHM-INV-001 : pose un objet devant le joueur ; la fenêtre se ferme s'il a été posé.
   * @param {string} itemId
   * @param {InspectableGame} game
   * @returns {CommandResult}
   */
  place(itemId, game) {
    const result = game.execute(placeItem(itemId));
    if (result.ok) {
      this.close();
    }
    return result;
  }

  /**
   * R-IHM-INV-001 : mange une ressource ; la fenêtre reste ouverte.
   * @param {string} resource
   * @param {InspectableGame} game
   * @returns {CommandResult}
   */
  eat(resource, game) {
    return game.execute(eat(resource));
  }

  /** R-IHM-SAU-001 : « Nouvelle partie » demande confirmation. */
  askNewGame() {
    this.confirmingNewGame = true;
  }

  /** R-IHM-SAU-001 : « Annuler » revient au premier état de la fenêtre. */
  cancelNewGame() {
    this.confirmingNewGame = false;
  }

  /** Ferme la fenêtre ouverte (× ou Échap). */
  close() {
    this.show(undefined);
  }

  /**
   * @param {'inventory' | 'book' | 'craft' | 'journal' | 'game' | undefined} panel
   */
  show(panel) {
    this.inspection.close();
    this.panel = panel;
    this.bookId = undefined;
    this.confirmingNewGame = false;
  }
}
