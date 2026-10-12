// @ts-check
import { THEME } from '../theme.js';
import { computeViewSize } from './viewSize.js';

/**
 * Écran du jeu : un canvas qui a la taille de la fenêtre en pixels physiques (R-IHM-AFF-001).
 * Un pixel de monde occupe un pixel de l'écran, sans lissage.
 */
export class Screen {
  /**
   * @param {Document} doc
   * @param {string} canvasId Identifiant du canvas d'index.html.
   * @throws {Error} Si le canvas est introuvable.
   */
  constructor(doc, canvasId) {
    const element = doc.getElementById(canvasId);
    if (!(element instanceof HTMLCanvasElement)) {
      throw new Error(`Canvas #${canvasId} not found in index.html`);
    }
    this.canvas = element;
    const context = element.getContext('2d');
    if (context === null) {
      throw new Error(`Canvas #${canvasId} has no 2D context`);
    }
    this.context = context;
    this.pixelRatio = 1;
  }

  /** Largeur de la vue (px). */
  get width() {
    return this.canvas.width;
  }

  /** Hauteur de la vue (px). */
  get height() {
    return this.canvas.height;
  }

  /**
   * @param {number} cssWidth `window.innerWidth`.
   * @param {number} cssHeight `window.innerHeight`.
   * @param {number} pixelRatio `window.devicePixelRatio`.
   */
  resize(cssWidth, cssHeight, pixelRatio) {
    const size = computeViewSize({ cssWidth, cssHeight, pixelRatio });
    this.pixelRatio = pixelRatio;
    this.canvas.width = size.width;
    this.canvas.height = size.height;
    // Changer la taille d'un canvas réinitialise son contexte.
    this.context.imageSmoothingEnabled = false;
  }

  /**
   * Position d'un clic en pixels physiques de l'écran.
   * @param {MouseEvent} event
   * @returns {{ x: number, y: number }}
   */
  pixelOf(event) {
    return { x: event.offsetX * this.pixelRatio, y: event.offsetY * this.pixelRatio };
  }

  /** Efface l'écran avec la couleur du fond (hors de la carte, R-IHM-CAM-001). */
  clear() {
    this.context.fillStyle = THEME.colors.band;
    this.context.fillRect(0, 0, this.width, this.height);
  }

  /**
   * Message centré sur l'écran (chargement, erreur).
   * @param {string} text
   */
  showMessage(text) {
    this.clear();
    this.context.fillStyle = THEME.colors.loadingText;
    this.context.font = THEME.fonts.message;
    this.context.textAlign = 'center';
    this.context.textBaseline = 'middle';
    this.context.fillText(text, this.width / 2, this.height / 2);
  }
}
