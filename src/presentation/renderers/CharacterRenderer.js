// @ts-check
import { selectCharacterFrame } from '../animation/selectFrame.js';
import { THEME } from '../theme.js';

/** @typedef {import('../../../data/sprites.js').CharacterSheet} CharacterSheet */
/** @typedef {import('../animation/selectFrame.js').WalkAnimation} WalkAnimation */
/** @typedef {import('../../core/model/Player.js').Player} Player */

const SHADOW_RATIO = 0.3;
const FULL_TURN = Math.PI * 2;

/**
 * Dessine un personnage à partir de sa feuille de sprites (data/sprites.js) et de son état
 * (orientation, marche). Ne modifie jamais le personnage.
 */
export class CharacterRenderer {
  /**
   * @param {object} params
   * @param {Readonly<CharacterSheet>} params.sheet
   * @param {HTMLImageElement} params.image Image préchargée de la feuille.
   * @param {WalkAnimation} params.animation
   */
  constructor({ sheet, image, animation }) {
    this.sheet = sheet;
    this.image = image;
    this.animation = animation;
  }

  /**
   * Rectangle du sprite d'un personnage dont les pieds sont en `foot` (px de monde), pour savoir
   * si un clic le touche (R-IHM-INS-005).
   * @param {{ x: number, y: number }} foot
   * @returns {import('../../core/utils/box.js').Box}
   */
  spriteBox(foot) {
    const { anchor, displayWidth, displayHeight } = this.sheet;
    const left = foot.x - anchor.x;
    const top = foot.y - anchor.y;
    return { left, top, right: left + displayWidth, bottom: top + displayHeight };
  }

  /**
   * @param {CanvasRenderingContext2D} context Contexte de la vue.
   * @param {Pick<Player, 'facing' | 'isWalking' | 'walkingTicks'>} character
   * @param {{ x: number, y: number }} foot Position des pieds dans la vue (px, entiers).
   */
  render(context, character, foot) {
    const { sheet } = this;
    const column = selectCharacterFrame(character, this.animation); // R-IHM-ANI-001, R-IHM-ANI-002
    const row = sheet.rows[character.facing];
    drawShadow(context, foot, sheet.displayWidth * SHADOW_RATIO);

    context.drawImage(
      this.image,
      sheet.origin.x + (column - 1) * sheet.frameWidth,
      sheet.origin.y + row * sheet.frameHeight,
      sheet.frameWidth,
      sheet.frameHeight,
      foot.x - sheet.anchor.x,
      foot.y - sheet.anchor.y,
      sheet.displayWidth,
      sheet.displayHeight,
    );
  }
}

/**
 * Ombre ovale aux pieds du personnage.
 * @param {CanvasRenderingContext2D} context
 * @param {{ x: number, y: number }} foot
 * @param {number} halfWidth
 */
function drawShadow(context, foot, halfWidth) {
  const halfHeight = THEME.shapes.shadowHeight / 2;
  context.fillStyle = THEME.colors.shadow;
  context.beginPath();
  context.ellipse(foot.x, foot.y - halfHeight, halfWidth, halfHeight, 0, 0, FULL_TURN);
  context.fill();
}
