// @ts-check
import { Player } from '../model/Player.js';
import { TileMap } from '../model/TileMap.js';
import { createGameState } from './GameState.js';

/** @typedef {import('./GameState.js').GameState} GameState */
/** @typedef {import('../../../data/tilesets.js').TileDefinition} TileDefinition */

/** Version du format de sauvegarde : une sauvegarde d'une autre version est ignorée. */
export const SAVE_VERSION = 1;

/**
 * Sauvegarde : l'état du jeu en données simples, prêtes pour JSON (R-SAU-SAV-001).
 * @typedef {object} SaveData
 * @property {number} version
 * @property {{ columns: number, rows: number, tileSize: number, tileIds: string[] }} map
 * @property {{ position: { x: number, y: number }, facing: import('../config/directions.js').Facing }} player
 * @property {Omit<GameState, 'map' | 'player' | 'dialogue'>} rest Tout le reste de l'état.
 */

/**
 * R-SAU-SAV-001 : sauvegarde complète de l'état. Le joueur est sauvegardé à l'arrêt, sans dialogue.
 * @param {GameState} state
 * @returns {SaveData}
 */
export function saveGame(state) {
  const { map, player, ...others } = state;
  /** @type {Partial<GameState>} */
  const rest = { ...others };
  delete rest.dialogue;
  return JSON.parse(
    JSON.stringify({
      version: SAVE_VERSION,
      map: { columns: map.columns, rows: map.rows, tileSize: map.tileSize, tileIds: map.tileIds },
      player: { position: player.position, facing: player.facing },
      rest,
    }),
  );
}

/**
 * R-SAU-SAV-001 : reconstruit l'état d'une sauvegarde.
 * @param {unknown} data Sauvegarde relue (JSON).
 * @param {Readonly<Record<string, Readonly<TileDefinition>>>} tiles Types de tuiles.
 * @returns {GameState}
 * @throws {Error} Si la sauvegarde est illisible ou d'une autre version.
 */
export function loadGame(data, tiles) {
  const save = /** @type {SaveData} */ (data);
  if (save?.version !== SAVE_VERSION || !Array.isArray(save.map?.tileIds)) {
    throw new Error('Unreadable save');
  }
  const { columns, rows, tileSize, tileIds } = save.map;
  if (tileIds.length !== columns * rows || tileIds.some((id) => tiles[id] === undefined)) {
    throw new Error('Unreadable save map');
  }
  const map = new TileMap({
    columns,
    rows,
    tileSize,
    tileIds,
    blocking: tileIds.map((id) => tiles[id].isBlocking),
  });
  const player = new Player({ position: save.player.position, facing: save.player.facing });
  return createGameState({ ...save.rest, map, player });
}
