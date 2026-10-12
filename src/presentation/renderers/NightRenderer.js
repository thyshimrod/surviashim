// @ts-check
import { ICON_SET, ICONS } from '../../../data/icons.js';

/** @typedef {import('../ui/nightView.js').NightContent} NightContent */
/** @typedef {{ x: number, y: number }} Point */

/** Couleur du voile de nuit (bleu très sombre), sans son opacité. */
const NIGHT_COLOR = '8, 10, 30';
/** Part du rayon d'un halo qui reste pleinement éclairée. */
const LIGHT_CORE = 0.45;
/** Ticks entre deux images de la flamme. */
const FLAME_FRAME_TICKS = 6;
/** Pas d'étirement vertical de la flamme. */
const FLAME_FLICKER = 0.06;
/** Étirement vertical de la flamme, image par image ; une image sur deux est retournée. */
const FLAME_STRETCH = Object.freeze([0, 2, -1, 1].map((step) => 1 + step * FLAME_FLICKER));
/** Décalage (px) du pied de la flamme sous le centre de la tuile. */
const FLAME_BASE_OFFSET = 4;

/**
 * La nuit à l'écran (R-IHM-NUI-001) : flammes animées des feux allumés, puis voile sombre percé
 * de halos de lumière. Le voile est préparé sur un canvas à part, puis posé sur la scène.
 */
export class NightRenderer {
  /**
   * @param {object} params
   * @param {Document} params.doc
   * @param {CanvasImageSource} params.icons Planche d'icônes (flamme).
   */
  constructor({ doc, icons }) {
    this.layer = doc.createElement('canvas');
    this.icons = icons;
  }

  /**
   * @param {CanvasRenderingContext2D} context Contexte de l'écran.
   * @param {Point} origin Coin supérieur gauche de la vue (px de monde).
   * @param {NightContent} night
   * @param {number} tick Pour animer les flammes.
   */
  render(context, origin, night, tick) {
    for (const flame of night.flames) {
      this.drawFlame(context, { x: flame.x - origin.x, y: flame.y - origin.y }, tick);
    }
    if (night.opacity <= 0) {
      return;
    }
    const { width, height } = context.canvas;
    if (this.layer.width !== width || this.layer.height !== height) {
      this.layer.width = width;
      this.layer.height = height;
    }
    const veil = /** @type {CanvasRenderingContext2D} */ (this.layer.getContext('2d'));
    veil.globalCompositeOperation = 'source-over';
    veil.clearRect(0, 0, width, height);
    veil.fillStyle = `rgba(${NIGHT_COLOR}, ${night.opacity})`;
    veil.fillRect(0, 0, width, height);
    veil.globalCompositeOperation = 'destination-out';
    for (const light of night.lights) {
      const x = light.x - origin.x;
      const y = light.y - origin.y;
      const halo = veil.createRadialGradient(x, y, light.radius * LIGHT_CORE, x, y, light.radius);
      halo.addColorStop(0, 'rgba(0, 0, 0, 1)');
      halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
      veil.fillStyle = halo;
      veil.beginPath();
      veil.arc(x, y, light.radius, 0, Math.PI * 2);
      veil.fill();
    }
    context.drawImage(this.layer, 0, 0);
  }

  /**
   * Flamme d'un feu allumé, qui vacille : l'icône est retournée et étirée d'une image à l'autre.
   * @param {CanvasRenderingContext2D} context
   * @param {Point} center Centre de la tuile du feu, à l'écran.
   * @param {number} tick
   */
  drawFlame(context, center, tick) {
    const size = ICON_SET.iconSize;
    const { row, column } = ICONS.flame;
    const frame = Math.floor(tick / FLAME_FRAME_TICKS) % FLAME_STRETCH.length;
    const stretch = FLAME_STRETCH[frame];
    const width = size;
    const height = Math.round(size * stretch);
    context.save();
    context.translate(center.x, center.y + FLAME_BASE_OFFSET);
    context.scale(frame % 2 === 0 ? 1 : -1, 1);
    context.drawImage(
      this.icons,
      column * size,
      row * size,
      size,
      size,
      -width / 2,
      -height,
      width,
      height,
    );
    context.restore();
  }
}
