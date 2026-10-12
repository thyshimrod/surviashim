// @ts-check
import { GAME_EVENTS } from '../events/gameEvents.js';

/** @typedef {import('../state/GameState.js').GameState} GameState */
/** @typedef {import('../state/GameState.js').GameRules} GameRules */
/** @typedef {import('../events/EventBus.js').EventBus} EventBus */
/** @typedef {{ column: number, row: number }} TileCoordinates */

/**
 * Valeurs des règles de la Flétrissure (spécification B.12, partie C).
 * @typedef {object} BlightRules
 * @property {readonly Readonly<{ column: number, row: number, width: number, height: number }>[]} areas
 *   Rectangles des lieux flétris.
 * @property {number} sageRadius Rayon de purification de la sauge (tuiles).
 */

/**
 * Indice d'une tuile dans la carte, pour la liste des tuiles purifiées.
 * @param {GameState} state
 * @param {TileCoordinates} tile
 * @returns {number}
 */
export function tileIndex(state, { column, row }) {
  return row * state.map.columns + column;
}

/**
 * R-MEN-FLE-001 : la tuile appartient à un lieu flétri et n'a pas été purifiée.
 * @param {Pick<GameState, 'purified' | 'map'>} state
 * @param {GameRules} rules
 * @param {TileCoordinates} tile
 * @returns {boolean}
 */
export function isBlighted(state, rules, { column, row }) {
  const inArea = (rules.blight?.areas ?? []).some(
    (area) =>
      column >= area.column &&
      column < area.column + area.width &&
      row >= area.row &&
      row < area.row + area.height,
  );
  return inArea && !state.purified.includes(row * state.map.columns + column);
}

/**
 * Tuile qui contient la position du joueur.
 * @param {GameState} state
 * @returns {TileCoordinates}
 */
export function playerTile(state) {
  const size = state.map.tileSize;
  return {
    column: Math.floor(state.player.position.x / size),
    row: Math.floor(state.player.position.y / size),
  };
}

/**
 * R-IHM-NOT-005 : annonce l'entrée sur une tuile flétrie depuis une tuile saine.
 * @param {GameState} state
 * @param {GameRules} rules
 * @param {EventBus} events
 */
export function trackBlight(state, rules, events) {
  const inBlight = isBlighted(state, rules, playerTile(state));
  if (inBlight && !state.inBlight) {
    events.emit(GAME_EVENTS.BLIGHT_ENTERED, {});
  }
  state.inBlight = inBlight;
}

/**
 * R-MEN-SAU-002 : purifie les tuiles flétries à `sageRadius` tuiles ou moins d'un centre.
 * @param {GameState} state
 * @param {GameRules} rules
 * @param {TileCoordinates} center
 * @returns {number} Nombre de tuiles purifiées.
 */
export function purifyAround(state, rules, center) {
  const radius = rules.blight?.sageRadius ?? 0;
  let count = 0;
  for (let row = center.row - radius; row <= center.row + radius; row += 1) {
    for (let column = center.column - radius; column <= center.column + radius; column += 1) {
      const isClose = Math.hypot(column - center.column, row - center.row) <= radius;
      if (isClose && state.map.contains(column, row) && isBlighted(state, rules, { column, row })) {
        state.purified.push(tileIndex(state, { column, row }));
        count += 1;
      }
    }
  }
  return count;
}
