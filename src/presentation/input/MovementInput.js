// @ts-check
import { resolveDirection } from '../../core/utils/direction.js';
import { movementKeyForCode } from './movementKeys.js';

/** @typedef {import('../../core/config/directions.js').MoveDirection} MoveDirection */

/**
 * Suit les touches de déplacement enfoncées (R-IHM-CMD-001) et signale chaque changement de
 * direction demandée (R-JOU-DEP-001). La présentation en fait une commande pour le métier.
 */
export class MovementInput {
  /**
   * @param {object} params
   * @param {EventTarget} params.target Généralement `window`.
   * @param {(direction: MoveDirection) => void} params.onDirectionChange
   */
  constructor({ target, onDirectionChange }) {
    this.target = target;
    this.onDirectionChange = onDirectionChange;
    this.held = { up: false, down: false, left: false, right: false };
    /** @type {MoveDirection} */
    this.direction = { dx: 0, dy: 0 };
    this.onKeyDown = (/** @type {Event} */ event) => this.handleKey(event, true);
    this.onKeyUp = (/** @type {Event} */ event) => this.handleKey(event, false);
    this.onBlur = () => this.releaseAll();
  }

  /**
   * Commence à écouter le clavier.
   * @returns {() => void} Fonction qui arrête l'écoute.
   */
  attach() {
    this.target.addEventListener('keydown', this.onKeyDown);
    this.target.addEventListener('keyup', this.onKeyUp);
    this.target.addEventListener('blur', this.onBlur);
    return () => {
      this.target.removeEventListener('keydown', this.onKeyDown);
      this.target.removeEventListener('keyup', this.onKeyUp);
      this.target.removeEventListener('blur', this.onBlur);
    };
  }

  /**
   * @param {Event} event
   * @param {boolean} isPressed
   */
  handleKey(event, isPressed) {
    if (!(event instanceof KeyboardEvent)) {
      return;
    }
    const key = movementKeyForCode(event.code);
    if (key === undefined) {
      return;
    }
    event.preventDefault();
    this.held[key] = isPressed;
    this.publish();
  }

  /** Relâche toutes les touches (la fenêtre perd le focus : les `keyup` ne viendront pas). */
  releaseAll() {
    this.held = { up: false, down: false, left: false, right: false };
    this.publish();
  }

  /** Signale la direction demandée si elle a changé. */
  publish() {
    const direction = resolveDirection(this.held);
    if (direction.dx !== this.direction.dx || direction.dy !== this.direction.dy) {
      this.direction = direction;
      this.onDirectionChange(direction);
    }
  }
}
