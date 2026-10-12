// @ts-check
import { hitboxAt } from '../core/utils/box.js';
import { TEXTS } from '../presentation/i18n/fr.js';
import { THEME } from '../presentation/theme.js';

/** @typedef {import('../core/state/GameState.js').GameState} GameState */
/** @typedef {import('../core/state/GameState.js').GameRules} GameRules */
/** @typedef {import('../app/GameLoop.js').GameLoop} GameLoop */
/** @typedef {{ x: number, y: number }} Point */

const FPS_SAMPLE_MS = 1000;
const DECIMALS = 1;
/** Décalage qui aligne un trait de 1 px sur la grille de pixels. */
const HALF_PIXEL = 0.5;

/**
 * Mode debug (index.html?debug=1) : panneau d'informations, boîte de collision du joueur et
 * tuiles infranchissables.
 */
export class DebugOverlay {
  /** Crée un panneau sans mesure de FPS en cours. */
  constructor() {
    this.fps = 0;
    this.framesInSample = 0;
    /** @type {number | undefined} */
    this.sampleStart = undefined;
  }

  /**
   * À appeler une fois par image.
   * @param {number} now Horodatage de l'image (ms).
   */
  countFrame(now) {
    this.sampleStart ??= now;
    this.framesInSample += 1;
    if (now - this.sampleStart >= FPS_SAMPLE_MS) {
      this.fps = Math.round((this.framesInSample * FPS_SAMPLE_MS) / (now - this.sampleStart));
      this.framesInSample = 0;
      this.sampleStart = now;
    }
  }

  /**
   * Repères dessinés dans la vue, avant sa recopie à l'écran.
   * @param {CanvasRenderingContext2D} context Contexte de la vue.
   * @param {GameState} state
   * @param {GameRules} rules
   * @param {Point} origin Coin supérieur gauche de la vue.
   */
  drawWorld(context, state, rules, origin) {
    const { map, player } = state;
    context.strokeStyle = THEME.colors.debugBlocking;
    context.lineWidth = 1;
    // Seules les tuiles visibles : la vallée en compte des dizaines de milliers.
    const first = map.tileAt({ x: Math.max(0, origin.x), y: Math.max(0, origin.y) }) ?? {
      column: 0,
      row: 0,
    };
    const lastColumn = Math.min(
      map.columns - 1,
      Math.floor((origin.x + context.canvas.width) / map.tileSize),
    );
    const lastRow = Math.min(
      map.rows - 1,
      Math.floor((origin.y + context.canvas.height) / map.tileSize),
    );
    for (let row = first.row; row <= lastRow; row += 1) {
      for (let column = first.column; column <= lastColumn; column += 1) {
        if (map.isBlocking(column, row)) {
          const bounds = map.boundsOf(column, row);
          context.strokeRect(
            bounds.left - origin.x + HALF_PIXEL,
            bounds.top - origin.y + HALF_PIXEL,
            map.tileSize - 1,
            map.tileSize - 1,
          );
        }
      }
    }
    const box = hitboxAt(player.position, rules.hitbox);
    context.strokeStyle = THEME.colors.debugHitbox;
    context.lineWidth = 1;
    context.strokeRect(
      box.left - origin.x,
      box.top - origin.y,
      rules.hitbox.width,
      rules.hitbox.height,
    );
  }

  /**
   * Panneau d'informations, dessiné à l'écran.
   * @param {CanvasRenderingContext2D} context Contexte de l'écran.
   * @param {GameState} state
   * @param {GameLoop} loop
   */
  render(context, state, loop) {
    const { player, map } = state;
    const tile = map.tileAt(player.position);
    const lines = [
      `FPS          ${this.fps}`,
      `tick         ${state.tick}`,
      `position     (${player.position.x.toFixed(DECIMALS)} ; ${player.position.y.toFixed(DECIMALS)})`,
      `tuile        ${describeTile(tile)}`,
      `orientation  ${TEXTS.facings[player.facing]}`,
      `marche       ${describeWalk(player)}`,
      `vitesse      x${loop.speed}${loop.isPaused ? '  [PAUSE]' : ''}`,
      'P pause · N pas · +/- vitesse',
    ];
    const { debug, colors, fonts } = THEME;
    const height = lines.length * debug.lineHeightPx + 2 * debug.paddingPx;
    context.fillStyle = colors.debugBackground;
    // En haut à droite : le bandeau d'inventaire occupe le coin supérieur gauche.
    const left = context.canvas.width - debug.widthPx - debug.marginPx;
    context.fillRect(left, debug.marginPx, debug.widthPx, height);
    context.font = fonts.debug;
    context.fillStyle = colors.debugText;
    context.textAlign = 'left';
    context.textBaseline = 'top';
    lines.forEach((line, index) => {
      context.fillText(
        line,
        left + debug.paddingPx,
        debug.marginPx + debug.paddingPx + index * debug.lineHeightPx,
      );
    });
  }
}

/**
 * @param {import('../core/model/TileMap.js').TileCoordinates | undefined} tile
 * @returns {string}
 */
function describeTile(tile) {
  return tile === undefined ? '—' : '(' + tile.column + ', ' + tile.row + ')';
}

/**
 * @param {import('../core/model/Player.js').Player} player
 * @returns {string}
 */
function describeWalk(player) {
  return player.isWalking ? 'oui (' + player.walkingTicks + ' ticks)' : 'non';
}
