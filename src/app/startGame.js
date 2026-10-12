// @ts-check
import { GAME_PARAMETERS } from '../../data/gameParameters.js';
import { TILE_DEFINITIONS } from '../../data/tilesets.js';
import { Game } from '../core/Game.js';
import { createGameRules } from '../core/state/GameState.js';
import { loadGame } from '../core/state/save.js';

/** @typedef {import('./saveStore.js').SaveStore} SaveStore */

/**
 * R-SAU-SAV-001 : reprend la partie sauvegardée, ou en commence une nouvelle s'il n'y en a pas ou
 * qu'elle est illisible.
 * @param {object} params
 * @param {SaveStore} params.store
 * @param {Readonly<import('../../data/gameParameters.js').GameParameters>} [params.parameters]
 * @returns {Game}
 */
export function startGame({ store, parameters = GAME_PARAMETERS }) {
  const save = store.load();
  if (save !== undefined) {
    try {
      return new Game(loadGame(save, TILE_DEFINITIONS), { rules: createGameRules(parameters) });
    } catch {
      // Sauvegarde illisible : nouvelle partie.
    }
  }
  return Game.create(parameters);
}
