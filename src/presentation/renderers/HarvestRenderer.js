// @ts-check
import { ICON_SET, ICONS } from '../../../data/icons.js';

/** @typedef {import('../ui/harvestView.js').HarvestContent} HarvestContent */
/** @typedef {{ x: number, y: number }} Point */

/** Hauteur (px) de l'outil au-dessus des pieds du héros. */
const TOOL_HEIGHT = 52;
/** Ticks d'un aller-retour de l'outil. */
const SWING_TICKS = 24;
/** Angle maximal (radians) du geste. */
const SWING_ANGLE = 0.7;
/** Barre de progression : largeur, hauteur, écart sous l'outil (px). */
const BAR = Object.freeze({ width: 28, height: 4, gap: 4 });
const BAR_BACK = 'rgba(20, 16, 10, 0.75)';
const BAR_FILL = '#ffd166';

/**
 * La récolte à l'écran (R-IHM-RCL-001) : l'outil s'agite au-dessus du héros, une barre se remplit.
 */
export class HarvestRenderer {
  /** @param {{ icons: CanvasImageSource }} params Planche d'icônes. */
  constructor({ icons }) {
    this.icons = icons;
  }

  /**
   * @param {CanvasRenderingContext2D} context
   * @param {Point} origin Coin supérieur gauche de la vue (px de monde).
   * @param {HarvestContent | undefined} harvest
   * @param {number} tick Pour animer le geste.
   */
  render(context, origin, harvest, tick) {
    if (harvest === undefined) {
      return;
    }
    const size = ICON_SET.iconSize;
    const x = Math.round(harvest.position.x - origin.x);
    const y = Math.round(harvest.position.y - origin.y - TOOL_HEIGHT);
    const { row, column } = ICONS[harvest.icon] ?? ICONS.axe;
    context.save();
    context.translate(x, y + size / 2);
    context.rotate(Math.sin((tick / SWING_TICKS) * Math.PI * 2) * SWING_ANGLE);
    context.drawImage(
      this.icons,
      column * size,
      row * size,
      size,
      size,
      -size / 2,
      -size,
      size,
      size,
    );
    context.restore();
    const barX = x - BAR.width / 2;
    const barY = y + size / 2 + BAR.gap;
    context.fillStyle = BAR_BACK;
    context.fillRect(barX - 1, barY - 1, BAR.width + 2, BAR.height + 2);
    context.fillStyle = BAR_FILL;
    context.fillRect(barX, barY, Math.round(BAR.width * harvest.progress), BAR.height);
  }
}
