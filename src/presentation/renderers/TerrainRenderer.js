// @ts-check
import { SPRINKLE_RATIO, TERRAIN_APPEARANCE } from '../../../data/terrainAppearance.js';
import { AUTOTILES, SPRITES } from '../../../data/tileset.js';
import { drawAutotileCell } from './autotile.js';
import { pickForTile, tileNoise } from './tileNoise.js';

/** @typedef {import('../../core/model/TileMap.js').TileMap} TileMap */
/** @typedef {{ x: number, y: number }} Point */
/** @typedef {{ canvas: HTMLCanvasElement, context: CanvasRenderingContext2D }} Chunk */

/** Tirages distincts pour une même tuile. */
const SALTS = Object.freeze({ decor: 1, sprinkle: 2, sprinkleChoice: 3 });
/** Côté d'un morceau de sol pré-dessiné (tuiles). */
const CHUNK_TILES = 32;
/** Sprite de forêt dense dessiné hors de la carte (R-IHM-CAM-001). */
const OUTSIDE_FOREST = 'forest-canopy';

/**
 * Dessine le sol de la carte avec la planche de tuiles : terrains en autotiles (bordures
 * recomposées selon les voisins) ou sols simples, puis petits décors au sol. La carte est
 * découpée en morceaux dessinés une fois, à la première demande ; chaque image ne recopie que
 * les morceaux visibles (GUIDELINES § 9). Hors de la carte, une forêt dense.
 */
export class TerrainRenderer {
  /**
   * @param {object} params
   * @param {Document} params.doc
   * @param {TileMap} params.map
   * @param {Readonly<Record<string, HTMLImageElement>>} params.tilesets Planches préchargées, par clé
   *   de TILESETS (data/tileset.js).
   */
  constructor({ doc, map, tilesets }) {
    this.doc = doc;
    this.map = map;
    this.tilesets = tilesets;
    this.tileset = tilesets.main;
    this.chunkSize = CHUNK_TILES * map.tileSize;
    /** @type {Map<string, Chunk>} */
    this.chunks = new Map();
  }

  /**
   * Dessine le sol visible : forêt hors de la carte, puis morceaux de carte.
   * @param {CanvasRenderingContext2D} context Contexte de l'écran.
   * @param {Point} origin Coin supérieur gauche de la vue (px de monde, entiers).
   * @param {{ width: number, height: number }} view Taille de la vue (px).
   */
  render(context, origin, view) {
    this.drawOutsideForest(context, origin, view);
    const first = {
      x: Math.max(0, Math.floor(origin.x / this.chunkSize)),
      y: Math.max(0, Math.floor(origin.y / this.chunkSize)),
    };
    const lastX = Math.min(
      Math.ceil(this.map.columns / CHUNK_TILES) - 1,
      Math.floor((origin.x + view.width) / this.chunkSize),
    );
    const lastY = Math.min(
      Math.ceil(this.map.rows / CHUNK_TILES) - 1,
      Math.floor((origin.y + view.height) / this.chunkSize),
    );
    for (let chunkY = first.y; chunkY <= lastY; chunkY += 1) {
      for (let chunkX = first.x; chunkX <= lastX; chunkX += 1) {
        const chunk = this.chunkAt(chunkX, chunkY);
        context.drawImage(
          chunk.canvas,
          chunkX * this.chunkSize - origin.x,
          chunkY * this.chunkSize - origin.y,
        );
      }
    }
  }

  /**
   * Redessine une tuile et ses 8 voisines, dont les bordures d'autotile dépendent d'elle.
   * @param {number} column
   * @param {number} row
   */
  redrawAround(column, row) {
    for (let dy = -1; dy <= 1; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        const chunk = this.chunks.get(
          chunkKey(Math.floor((column + dx) / CHUNK_TILES), Math.floor((row + dy) / CHUNK_TILES)),
        );
        if (chunk !== undefined && this.map.contains(column + dx, row + dy)) {
          this.drawTile(chunk.context, column + dx, row + dy);
        }
      }
    }
  }

  /**
   * Morceau de sol, dessiné à la première demande.
   * @param {number} chunkX
   * @param {number} chunkY
   * @returns {Chunk}
   */
  chunkAt(chunkX, chunkY) {
    const key = chunkKey(chunkX, chunkY);
    const existing = this.chunks.get(key);
    if (existing !== undefined) {
      return existing;
    }
    const canvas = this.doc.createElement('canvas');
    canvas.width = this.chunkSize;
    canvas.height = this.chunkSize;
    const context = canvas.getContext('2d');
    if (context === null) {
      throw new Error('Cannot create a terrain canvas');
    }
    context.imageSmoothingEnabled = false;
    context.translate(-chunkX * this.chunkSize, -chunkY * this.chunkSize);
    const chunk = { canvas, context };
    this.chunks.set(key, chunk);
    const lastColumn = Math.min(this.map.columns, (chunkX + 1) * CHUNK_TILES);
    const lastRow = Math.min(this.map.rows, (chunkY + 1) * CHUNK_TILES);
    for (let row = chunkY * CHUNK_TILES; row < lastRow; row += 1) {
      for (let column = chunkX * CHUNK_TILES; column < lastColumn; column += 1) {
        this.drawTile(context, column, row);
      }
    }
    return chunk;
  }

  /**
   * Forêt dense sur la partie de la vue située hors de la carte, par blocs de 2 × 2 tuiles alignés
   * sur la grille du monde.
   * @param {CanvasRenderingContext2D} context
   * @param {Point} origin
   * @param {{ width: number, height: number }} view
   */
  drawOutsideForest(context, origin, view) {
    const sprite = SPRITES[OUTSIDE_FOREST];
    const block = sprite.width * this.map.tileSize;
    const startX = Math.floor(origin.x / block) * block;
    const startY = Math.floor(origin.y / block) * block;
    for (let y = startY; y < origin.y + view.height; y += block) {
      for (let x = startX; x < origin.x + view.width; x += block) {
        const isInside =
          x >= 0 && y >= 0 && x + block <= this.map.widthPx && y + block <= this.map.heightPx;
        if (!isInside) {
          this.drawSpriteAt(context, OUTSIDE_FOREST, { x: x - origin.x, y: y - origin.y });
        }
      }
    }
  }

  /**
   * @param {CanvasRenderingContext2D} context
   * @param {number} column
   * @param {number} row
   */
  drawTile(context, column, row) {
    const size = this.map.tileSize;
    context.clearRect(column * size, row * size, size, size);
    this.drawGround(context, column, row);
    this.drawFlatDecor(context, column, row);
  }

  /**
   * @param {CanvasRenderingContext2D} context
   * @param {number} column
   * @param {number} row
   */
  drawGround(context, column, row) {
    const appearance = this.appearanceAt(column, row);
    if (appearance.under !== undefined) {
      this.drawAutotile(context, column, row, { name: appearance.under, isSeamless: true });
    }
    if (appearance.ground !== undefined) {
      this.drawSprite(context, appearance.ground, column, row);
      return;
    }
    this.drawAutotile(context, column, row, {
      name: appearance.autotile,
      isSeamless: appearance.seamless === true,
    });
  }

  /**
   * @param {CanvasRenderingContext2D} context
   * @param {number} column
   * @param {number} row
   * @param {{ name: string, isSeamless: boolean }} terrain
   */
  drawAutotile(context, column, row, { name, isSeamless }) {
    const size = this.map.tileSize;
    drawAutotileCell(context, {
      image: this.tileset,
      block: AUTOTILES[name],
      tileSize: size,
      target: { x: column * size, y: row * size },
      // Hors de la carte, on prolonge le terrain : pas de bordure au bord de la carte.
      isSame: (dx, dy) =>
        isSeamless ||
        !this.map.contains(column + dx, row + dy) ||
        this.appearanceAt(column + dx, row + dy).autotile === name,
    });
  }

  /**
   * Décor au sol propre au type de tuile (fleurs), ou semé au hasard (touffes d'herbe).
   * @param {CanvasRenderingContext2D} context
   * @param {number} column
   * @param {number} row
   */
  drawFlatDecor(context, column, row) {
    const appearance = this.appearanceAt(column, row);
    if (appearance.decor !== undefined) {
      this.drawSprite(
        context,
        pickForTile(appearance.decor, column, row, SALTS.decor),
        column,
        row,
      );
    } else if (
      appearance.sprinkle !== undefined &&
      tileNoise(column, row, SALTS.sprinkle) < SPRINKLE_RATIO
    ) {
      const name = pickForTile(appearance.sprinkle, column, row, SALTS.sprinkleChoice);
      this.drawSprite(context, name, column, row);
    }
  }

  /**
   * @param {CanvasRenderingContext2D} context
   * @param {string} name Sprite de 1 × 1 tuile.
   * @param {number} column
   * @param {number} row
   */
  drawSprite(context, name, column, row) {
    const size = this.map.tileSize;
    this.drawSpriteAt(context, name, { x: column * size, y: row * size });
  }

  /**
   * @param {CanvasRenderingContext2D} context
   * @param {string} name Sprite de la planche.
   * @param {Point} target Coin supérieur gauche de destination.
   */
  drawSpriteAt(context, name, target) {
    const size = this.map.tileSize;
    const sprite = SPRITES[name];
    const width = sprite.width * size;
    const height = sprite.height * size;
    context.drawImage(
      this.tilesets[sprite.sheet ?? 'main'],
      sprite.column * size,
      sprite.row * size,
      width,
      height,
      target.x,
      target.y,
      width,
      height,
    );
  }

  /**
   * @param {number} column
   * @param {number} row
   * @returns {import('../../../data/terrainAppearance.js').TerrainAppearance}
   */
  appearanceAt(column, row) {
    return TERRAIN_APPEARANCE[this.map.tileIdAt(column, row)];
  }
}

/**
 * @param {number} chunkX
 * @param {number} chunkY
 * @returns {string}
 */
function chunkKey(chunkX, chunkY) {
  return `${chunkX},${chunkY}`;
}
