// @ts-check
import { VALLEY_MAP } from '../../../data/maps/valley.js';
import { NPCS } from '../../../data/npcs.js';
import { TILE_DEFINITIONS } from '../../../data/tilesets.js';
import { FACINGS } from '../config/directions.js';
import { Player } from '../model/Player.js';
import { createTileMapFromRows } from '../model/TileMap.js';
import { createGameState, createNpc } from './GameState.js';

/** @typedef {import('../../../data/gameParameters.js').GameParameters} GameParameters */
/** @typedef {import('../../../data/maps/valley.js').MapDefinition} MapDefinition */
/** @typedef {import('../../../data/npcs.js').NpcDefinition} NpcDefinition */
/** @typedef {import('./GameState.js').GameState} GameState */

/**
 * État d'une nouvelle partie : la vallée (R-MON-CAR-001), le joueur au centre de sa tuile de
 * départ (R-MON-CAR-002), orienté vers le bas (R-JOU-ORI-001), les PNJ à leur place
 * (R-PNJ-POS-001), un journal vide.
 * @param {Readonly<GameParameters>} parameters
 * @param {object} [content]
 * @param {Readonly<MapDefinition>} [content.map]
 * @param {Readonly<Record<string, Readonly<NpcDefinition>>>} [content.npcs]
 * @returns {GameState}
 * @throws {Error} Si la carte n'a pas la taille des paramètres ou si la tuile de départ est
 *   infranchissable.
 */
export function createInitialState(
  parameters,
  { map: mapDefinition = VALLEY_MAP, npcs = NPCS } = {},
) {
  const map = createTileMapFromRows({
    rows: mapDefinition.rows,
    definitions: TILE_DEFINITIONS,
    tileSize: parameters.TILE_SIZE,
  });
  if (map.columns !== parameters.MAP_WIDTH || map.rows !== parameters.MAP_HEIGHT) {
    throw new Error(
      `Map "${mapDefinition.id}" is ${map.columns}x${map.rows} tiles, expected ${parameters.MAP_WIDTH}x${parameters.MAP_HEIGHT}`,
    );
  }
  const start = parameters.PLAYER_START_TILE;
  if (map.isBlocking(start.x, start.y)) {
    throw new Error(`Start tile (${start.x}, ${start.y}) of map "${mapDefinition.id}" is blocking`);
  }
  const half = parameters.TILE_SIZE / 2;
  const player = new Player({
    position: {
      x: start.x * parameters.TILE_SIZE + half,
      y: start.y * parameters.TILE_SIZE + half,
    },
    facing: FACINGS.DOWN,
  });
  const clock = parameters.DAY_START * parameters.TICK_PER_GAME_MINUTE;
  const firstPause = clock + parameters.NPC_PAUSE_MINUTES * parameters.TICK_PER_GAME_MINUTE;
  return createGameState({
    map,
    player,
    npcs: Object.values(npcs).map((npc) => createNpc(npc, parameters.TILE_SIZE, firstPause)),
    clock, // R-MON-TPS-001 : jour 1, 6:00
    health: parameters.HEALTH_MAX, // R-JOU-VIE-001
    hunger: parameters.HUNGER_MAX,
    energy: parameters.ENERGY_MAX, // R-JOU-ENE-001
  });
}
