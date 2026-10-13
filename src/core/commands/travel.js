// @ts-check
import { playerTile } from '../systems/blight.js';
import { findPath, octile } from '../systems/pathfinding.js';
import { REJECTION_REASONS } from './commands.js';

/** @typedef {import('../state/GameState.js').GameState} GameState */
/** @typedef {import('../state/GameState.js').GameRules} GameRules */
/** @typedef {import('../state/GameState.js').Travel} Travel */
/** @typedef {import('./commands.js').Command} Command */
/** @typedef {import('./commands.js').CommandResult} CommandResult */
/** @typedef {{ column: number, row: number }} Tile */

/** Écart (px) sous lequel le héros est arrivé au centre d'une tuile du chemin. */
const ARRIVAL_SLACK = 0.01;

/**
 * R-JOU-DEP-004 : aller à une tuile franchissable, par le plus court chemin.
 * @param {GameState} state
 * @param {Tile} tile
 * @returns {CommandResult}
 */
export function goTo(state, tile) {
  const { map } = state;
  if (!map.contains(tile.column, tile.row) || map.isBlocking(tile.column, tile.row)) {
    return { ok: false, reason: REJECTION_REASONS.NO_PATH };
  }
  const path = findPath({
    map,
    from: playerTile(state),
    isGoal: (next) => next.column === tile.column && next.row === tile.row,
    estimate: (next) => octile(next, tile),
  });
  return startTravel(state, path, undefined, 0);
}

/**
 * R-JOU-DEP-005 : va à la tuile la plus proche d'où l'action est à portée, pour la faire en
 * arrivant.
 * @param {GameState} state
 * @param {GameRules} rules
 * @param {Command} action
 * @param {number} attempts Essais déjà faits.
 * @returns {CommandResult}
 */
export function approach(state, rules, action, attempts) {
  const goal = goalOf(state, rules, action);
  if (goal === undefined) {
    return { ok: false, reason: REJECTION_REASONS.NO_PATH };
  }
  const size = state.map.tileSize;
  const half = size / 2;
  const target = { column: Math.floor(goal.x / size), row: Math.floor(goal.y / size) };
  const reachTiles = goal.reach / size;
  const path = findPath({
    map: state.map,
    from: playerTile(state),
    isGoal: ({ column, row }) =>
      Math.hypot(column * size + half - goal.x, row * size + half - goal.y) <= goal.reach,
    estimate: (tile) => Math.max(0, octile(tile, target) - reachTiles),
  });
  return startTravel(state, path, action, attempts);
}

/**
 * Point à atteindre et portée d'une action : le centre de la tuile, ou la position du PNJ.
 * @param {GameState} state
 * @param {GameRules} rules
 * @param {Command} action
 * @returns {{ x: number, y: number, reach: number } | undefined}
 */
function goalOf(state, rules, action) {
  if ('npcId' in action) {
    const npc = state.npcs.find((candidate) => candidate.id === action.npcId);
    return npc === undefined ? undefined : { ...npc.position, reach: rules.talkReach ?? 0 };
  }
  if (!('column' in action)) {
    return undefined;
  }
  const size = state.map.tileSize;
  return {
    x: action.column * size + size / 2,
    y: action.row * size + size / 2,
    reach: rules.harvestReach,
  };
}

/**
 * @param {GameState} state
 * @param {Tile[] | undefined} path
 * @param {Command | undefined} action
 * @param {number} attempts
 * @returns {CommandResult}
 */
function startTravel(state, path, action, attempts) {
  if (path === undefined) {
    return { ok: false, reason: REJECTION_REASONS.NO_PATH };
  }
  state.travel = {
    path,
    ...(action === undefined ? {} : { action }),
    attempts,
    stuckTicks: 0,
    last: { ...state.player.position },
  };
  return { ok: true };
}

/**
 * Arrête le chemin suivi.
 * @param {GameState} state
 */
export function stopTravel(state) {
  if (state.travel !== undefined) {
    state.travel = undefined;
    state.player.moveIntent = { dx: 0, dy: 0 };
  }
}

/**
 * R-JOU-DEP-004 : à chaque tick, oriente le héros vers la prochaine tuile du chemin ; abandonne
 * pendant un dialogue ou si le héros n'avance plus.
 * @param {GameState} state
 * @param {GameRules} rules
 * @returns {Travel | undefined} Le trajet achevé ce tick, avec son action éventuelle.
 */
export function followPath(state, rules) {
  const { travel, player } = state;
  if (travel === undefined) {
    return undefined;
  }
  if (state.dialogue !== undefined || isStuck(travel, player.position, rules)) {
    stopTravel(state);
    return undefined;
  }
  const size = state.map.tileSize;
  const step = rules.walkSpeed;
  while (travel.path.length > 0) {
    const next = travel.path[0];
    const dx = next.column * size + size / 2 - player.position.x;
    const dy = next.row * size + size / 2 - player.position.y;
    if (Math.abs(dx) > step + ARRIVAL_SLACK || Math.abs(dy) > step + ARRIVAL_SLACK) {
      player.moveIntent = { dx: axis(dx, step), dy: axis(dy, step) };
      return undefined;
    }
    player.position = { x: player.position.x + dx, y: player.position.y + dy };
    travel.path.shift();
  }
  stopTravel(state);
  return travel;
}

/**
 * @param {number} delta Écart restant sur cet axe.
 * @param {number} step
 * @returns {number} -1, 0 ou 1.
 */
function axis(delta, step) {
  if (Math.abs(delta) <= step) {
    return 0;
  }
  return delta > 0 ? 1 : -1;
}

/**
 * Compte les ticks sans avancer (R-JOU-DEP-004).
 * @param {Travel} travel
 * @param {{ x: number, y: number }} position
 * @param {GameRules} rules
 * @returns {boolean} `true` si le héros n'avance plus depuis trop longtemps.
 */
function isStuck(travel, position, rules) {
  const moved = Math.hypot(position.x - travel.last.x, position.y - travel.last.y) > ARRIVAL_SLACK;
  travel.stuckTicks = moved ? 0 : travel.stuckTicks + 1;
  travel.last = { ...position };
  return travel.stuckTicks >= (rules.travel?.stuckTicks ?? Infinity);
}
