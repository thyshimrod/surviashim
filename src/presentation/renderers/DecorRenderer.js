// @ts-check
import { SPRITES } from '../../../data/tileset.js';

/** @typedef {{ x: number, y: number }} Point */

/**
 * Dessine les éléments de décor debout (arbres, rochers) tirés de la planche de tuiles. Un sprite
 * est ancré par le milieu de son bord inférieur sur le pied de l'élément : un arbre de 2 tuiles de
 * haut dépasse au-dessus de sa tuile, et le joueur peut passer derrière (R-IHM-AFF-002).
 */
export class DecorRenderer {
  /**
   * @param {object} params
   * @param {Readonly<Record<string, HTMLImageElement>>} params.tilesets Planches préchargées, par clé
   *   de TILESETS (data/tileset.js).
   * @param {number} params.tileSize
   */
  constructor({ tilesets, tileSize }) {
    this.tilesets = tilesets;
    this.tileSize = tileSize;
  }

  /**
   * @param {CanvasRenderingContext2D} context Contexte de la vue.
   * @param {string} spriteName Clé de SPRITES (data/tileset.js).
   * @param {Point} foot Milieu du pied, dans la vue (px).
   */
  render(context, spriteName, foot) {
    const sprite = SPRITES[spriteName];
    const width = sprite.width * this.tileSize;
    const height = sprite.height * this.tileSize;
    context.drawImage(
      this.tilesets[sprite.sheet ?? 'main'],
      sprite.column * this.tileSize,
      sprite.row * this.tileSize,
      width,
      height,
      foot.x - width / 2,
      foot.y - height,
      width,
      height,
    );
  }
}
