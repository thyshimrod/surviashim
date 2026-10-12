// @ts-check
import { TERRAIN_APPEARANCE } from '../../data/terrainAppearance.js';
import { SPRITES } from '../../data/tileset.js';
import { computeViewOrigin } from './camera/camera.js';
import { designateTile } from './input/designateTile.js';
import { sortByDepth } from './renderers/depthSort.js';
import { DecorRenderer } from './renderers/DecorRenderer.js';
import { TerrainRenderer } from './renderers/TerrainRenderer.js';
import { pickForTile } from './renderers/tileNoise.js';

/** @typedef {import('../core/state/GameState.js').GameState} GameState */
/** @typedef {import('../core/model/TileMap.js').TileMap} TileMap */
/** @typedef {import('./canvas/Screen.js').Screen} Screen */
/** @typedef {import('./renderers/CharacterRenderer.js').CharacterRenderer} CharacterRenderer */
/** @typedef {import('./input/designateTile.js').DrawnElement} DrawnElement */
/** @typedef {{ x: number, y: number }} Point */

/**
 * Élément debout du décor : tuile, sprite tiré pour elle et rectangle de ce sprite.
 * @typedef {DrawnElement & { spriteName: string, foot: Point }} StandingTile
 */

/**
 * Élément debout de la scène, prêt à dessiner.
 * @typedef {object} SceneElement
 * @property {number} footY
 * @property {boolean} isCharacter
 * @property {(context: CanvasRenderingContext2D, origin: Point) => void} draw
 */

/** Tirage du sprite debout d'une tuile (distinct des tirages du sol). */
const STANDING_SALT = 7;

/**
 * Orchestration du dessin : fond, sol, puis éléments debout triés en profondeur (R-IHM-AFF-002),
 * dans une vue centrée sur le joueur (R-IHM-CAM-001).
 */
export class GameRenderer {
  /**
   * @param {object} params
   * @param {Document} params.doc
   * @param {Screen} params.screen
   * @param {GameState} params.state État initial.
   * @param {CharacterRenderer} params.playerRenderer
   * @param {Readonly<Record<string, CharacterRenderer>>} params.npcRenderers Par PNJ.
   * @param {Readonly<Record<string, HTMLImageElement>>} params.tilesets Planches préchargées, par clé
   *   de TILESETS (data/tileset.js).
   */
  constructor({ doc, screen, state, playerRenderer, npcRenderers, tilesets }) {
    this.screen = screen;
    this.map = state.map;
    this.playerRenderer = playerRenderer;
    this.npcRenderers = npcRenderers;
    this.terrain = new TerrainRenderer({ doc, map: state.map, tilesets });
    this.decor = new DecorRenderer({ tilesets, tileSize: state.map.tileSize });
    this.standingTiles = listStandingTiles(state.map);
    /** @type {Point} */
    this.origin = { x: 0, y: 0 };
  }

  /**
   * Dessine une image.
   * @param {GameState} state
   */
  render(state) {
    const { context } = this.screen;
    const origin = computeViewOrigin({
      focus: state.player.position,
      viewWidth: this.screen.width,
      viewHeight: this.screen.height,
    });
    // Positions arrondies au pixel de monde au moment du dessin (GUIDELINES § 9).
    this.origin = { x: Math.round(origin.x), y: Math.round(origin.y) };

    this.screen.clear();
    this.terrain.render(context, this.origin, {
      width: this.screen.width,
      height: this.screen.height,
    });
    for (const element of sortByDepth(this.visibleElements(state))) {
      element.draw(context, this.origin);
    }
  }

  /**
   * Une tuile a changé de type (récolte) : redessine le sol autour et la liste des éléments.
   * @param {number} column
   * @param {number} row
   */
  refreshTile(column, row) {
    this.terrain.redrawAround(column, row);
    this.standingTiles = listStandingTiles(this.map);
  }

  /**
   * R-IHM-INS-001, R-IHM-INS-005 : ce que désigne un point du monde (PNJ, élément ou tuile).
   * @param {Point} point
   * @param {GameState} state
   * @returns {import('./input/designateTile.js').Target | undefined}
   */
  designate(point, state) {
    const npcs = state.npcs.map((npc) => ({
      npcId: npc.id,
      footY: npc.position.y,
      sprite: this.npcRenderers[npc.id]?.spriteBox(npc.position) ?? spriteBoxAt(npc.position, 0, 0),
    }));
    return designateTile({ point, elements: [...npcs, ...this.standingTiles], map: this.map });
  }

  /**
   * @param {GameState} state
   * @returns {SceneElement[]}
   */
  visibleElements(state) {
    const { player } = state;
    const view = {
      left: this.origin.x,
      top: this.origin.y,
      right: this.origin.x + this.screen.width,
      bottom: this.origin.y + this.screen.height,
    };
    /** @type {SceneElement[]} */
    const elements = this.standingTiles
      .filter(({ sprite }) => intersects(sprite, view))
      .map((tile) => ({
        footY: tile.footY,
        isCharacter: false,
        draw: (context, origin) =>
          this.decor.render(context, tile.spriteName, toView(tile.foot, origin)),
      }));
    for (const npc of state.npcs) {
      const renderer = this.npcRenderers[npc.id];
      if (renderer !== undefined && intersects(renderer.spriteBox(npc.position), view)) {
        elements.push({
          footY: npc.position.y,
          isCharacter: true,
          draw: (context, origin) =>
            renderer.render(context, npcCharacter(npc, state.tick), toView(npc.position, origin)),
        });
      }
    }
    elements.push({
      footY: player.position.y,
      isCharacter: true,
      draw: (context, origin) =>
        this.playerRenderer.render(context, player, toView(player.position, origin)),
    });
    return elements;
  }
}

/**
 * Tuiles qui portent un élément debout, avec leur sprite (tirage stable).
 * @param {TileMap} map
 * @returns {StandingTile[]}
 */
function listStandingTiles(map) {
  const tiles = [];
  for (let row = 0; row < map.rows; row += 1) {
    for (let column = 0; column < map.columns; column += 1) {
      const standing = TERRAIN_APPEARANCE[map.tileIdAt(column, row)].standing;
      if (standing !== undefined) {
        const spriteName = pickForTile(standing, column, row, STANDING_SALT);
        tiles.push(standingTile(map, { column, row }, spriteName));
      }
    }
  }
  return tiles;
}

/**
 * Élément debout d'une tuile : pied au milieu du bas de la tuile, sprite ancré par le milieu de
 * son bord inférieur.
 * @param {TileMap} map
 * @param {{ column: number, row: number }} tile
 * @param {string} spriteName
 * @returns {StandingTile}
 */
function standingTile(map, { column, row }, spriteName) {
  const bounds = map.boundsOf(column, row);
  const foot = { x: (bounds.left + bounds.right) / 2, y: bounds.bottom };
  const halfWidth = (SPRITES[spriteName].width * map.tileSize) / 2;
  const height = SPRITES[spriteName].height * map.tileSize;
  return {
    column,
    row,
    spriteName,
    foot,
    footY: foot.y,
    sprite: {
      left: foot.x - halfWidth,
      right: foot.x + halfWidth,
      top: foot.y - height,
      bottom: foot.y,
    },
  };
}

/**
 * @param {import('../core/utils/box.js').Box} first
 * @param {import('../core/utils/box.js').Box} second
 * @returns {boolean} `true` si les rectangles se touchent ou se chevauchent.
 */
function intersects(first, second) {
  return (
    first.right >= second.left &&
    first.left <= second.right &&
    first.bottom >= second.top &&
    first.top <= second.bottom
  );
}

/**
 * @param {Point} world Position en px de monde.
 * @param {Point} origin Coin supérieur gauche de la vue.
 * @returns {Point} Position dans la vue, arrondie au pixel.
 */
function toView(world, origin) {
  return { x: Math.round(world.x) - origin.x, y: Math.round(world.y) - origin.y };
}

/**
 * Un PNJ immobile, vu par le dessin d'un personnage (pose immobile, R-IHM-ANI-002).
 * @param {import('../core/state/GameState.js').Npc} npc
 * @param {number} tick Compteur d'animation de la marche (R-PNJ-POS-003).
 * @returns {{ facing: import('../core/config/directions.js').Facing, isWalking: boolean, walkingTicks: number }}
 */
function npcCharacter(npc, tick) {
  return { facing: npc.facing, isWalking: npc.isWalking ?? false, walkingTicks: tick };
}

/**
 * Rectangle d'un sprite ancré par le milieu de son bord inférieur.
 * @param {Point} foot
 * @param {number} width
 * @param {number} height
 * @returns {import('../core/utils/box.js').Box}
 */
export function spriteBoxAt(foot, width, height) {
  return {
    left: foot.x - width / 2,
    right: foot.x + width / 2,
    top: foot.y - height,
    bottom: foot.y,
  };
}
