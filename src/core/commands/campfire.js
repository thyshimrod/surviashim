// @ts-check
import { GAME_EVENTS } from '../events/gameEvents.js';
import { hitboxAt, overlaps } from '../utils/box.js';
import { isBedtime } from '../systems/needs.js';
import { ticksFor } from '../systems/time.js';
import { REJECTION_REASONS } from './commands.js';

/** @typedef {import('../state/GameState.js').GameState} GameState */
/** @typedef {import('../state/GameState.js').GameRules} GameRules */
/** @typedef {import('../events/EventBus.js').EventBus} EventBus */
/** @typedef {import('./commands.js').CommandResult} CommandResult */
/** @typedef {{ column: number, row: number }} TileCoordinates */

/**
 * État d'un feu de camp, lu par la fenêtre d'information (R-IHM-INS-008).
 * @typedef {object} CampfireInspection
 * @property {boolean} isLit
 * @property {number} minutesLeft Minutes de jeu avant qu'il s'éteigne (0 s'il est éteint).
 * @property {boolean} hasFuel `true` si le joueur a assez de bois pour le raviver.
 * @property {boolean} isInReach `true` si le feu est à portée du joueur (`HARVEST_REACH`).
 * @property {boolean} isBedtime `true` si l'heure permet de dormir (R-JOU-SOM-001).
 * @property {boolean} isHearth `true` pour le Foyer (R-MON-FOY-001), toujours allumé.
 */

/** Décalage de la tuile devant le joueur, selon son orientation. */
const AHEAD = Object.freeze({
  up: Object.freeze({ column: 0, row: -1 }),
  down: Object.freeze({ column: 0, row: 1 }),
  left: Object.freeze({ column: -1, row: 0 }),
  right: Object.freeze({ column: 1, row: 0 }),
});

/**
 * Tuile devant le joueur : voisine de la sienne, dans la direction de son orientation.
 * @param {GameState} state
 * @returns {TileCoordinates}
 */
export function tileAhead(state) {
  const { position, facing } = state.player;
  const size = state.map.tileSize;
  const offset = AHEAD[facing];
  return {
    column: Math.floor(position.x / size) + offset.column,
    row: Math.floor(position.y / size) + offset.row,
  };
}

/**
 * @param {GameState} state
 * @param {TileCoordinates} tile
 * @returns {import('../state/GameState.js').Campfire | undefined}
 */
function findCampfire(state, { column, row }) {
  return state.campfires.find((fire) => fire.column === column && fire.row === row);
}

/**
 * R-ART-FEU-001 : état d'un feu de camp, ou `undefined` si la tuile n'en est pas un.
 * @param {GameState} state
 * @param {GameRules} rules
 * @param {TileCoordinates} tile
 * @returns {CampfireInspection | undefined}
 */
export function inspectCampfire(state, rules, tile) {
  const isHearth = isHearthTile(state, rules, tile);
  const fire = findCampfire(state, tile);
  if ((fire === undefined && !isHearth) || rules.time === undefined) {
    return undefined;
  }
  const ticksLeft = isHearth ? Infinity : Math.max(0, (fire?.burnsUntil ?? 0) - state.clock);
  return {
    isLit: ticksLeft > 0,
    minutesLeft: Math.ceil(ticksLeft / rules.time.ticksPerMinute),
    hasFuel: (state.inventory.wood ?? 0) >= rules.time.campfireRekindleWood,
    isInReach: isInReach(state, rules, tile),
    isBedtime: isBedtime(state, rules),
    isHearth,
  };
}

/**
 * La tuile accepte-t-elle un objet posé (R-ART-POS-001) ?
 * @param {GameState} state
 * @param {GameRules} rules
 * @param {TileCoordinates} tile
 * @returns {boolean}
 */
function canPlaceOn(state, rules, { column, row }) {
  const { map } = state;
  if (!map.contains(column, row) || !rules.tiles[map.tileIdAt(column, row)]?.canPlace) {
    return false;
  }
  const bounds = map.boundsOf(column, row);
  const bodies = [state.player.position, ...state.npcs.map((npc) => npc.position)];
  return bodies.every((position) => !overlaps(hitboxAt(position, rules.hitbox), bounds));
}

/**
 * R-ART-POS-001 : pose un objet sur la tuile devant le joueur ; un feu de camp posé est allumé.
 * @param {GameState} state
 * @param {GameRules} rules
 * @param {EventBus} events
 * @param {string} itemId Objet à poser (clé de data/placeables.js).
 * @returns {CommandResult}
 */
export function place(state, rules, events, itemId) {
  const definition = rules.placeables?.[itemId];
  if (definition === undefined || (state.placeables[itemId] ?? 0) <= 0) {
    return { ok: false, reason: REJECTION_REASONS.NOTHING_TO_PLACE };
  }
  const tile = tileAhead(state);
  if (!canPlaceOn(state, rules, tile)) {
    return { ok: false, reason: REJECTION_REASONS.CANNOT_PLACE };
  }
  state.placeables[itemId] -= 1;
  state.map.setTile(tile.column, tile.row, rules.tiles[definition.tile]);
  if (rules.tiles[definition.tile]?.isCampfire && rules.time !== undefined) {
    const burnsUntil = state.clock + ticksFor(rules.time.campfireBurnMinutes, rules.time);
    state.campfires.push({ ...tile, burnsUntil });
  }
  events.emit(GAME_EVENTS.TILE_CHANGED, { ...tile, tileId: definition.tile });
  return { ok: true };
}

/**
 * R-ART-FEU-001 : ravive un feu de camp avec du bois.
 * @param {GameState} state
 * @param {GameRules} rules
 * @param {EventBus} events
 * @param {TileCoordinates} tile
 * @returns {CommandResult}
 */
export function rekindle(state, rules, events, tile) {
  const fire = findCampfire(state, tile);
  if (fire === undefined || rules.time === undefined) {
    return { ok: false, reason: REJECTION_REASONS.NOTHING_TO_REKINDLE };
  }
  const cost = rules.time.campfireRekindleWood;
  if ((state.inventory.wood ?? 0) < cost) {
    return { ok: false, reason: REJECTION_REASONS.MISSING_INGREDIENTS };
  }
  if (!isInReach(state, rules, tile)) {
    return { ok: false, reason: REJECTION_REASONS.OUT_OF_REACH };
  }
  state.inventory.wood -= cost;
  fire.burnsUntil = state.clock + ticksFor(rules.time.campfireBurnMinutes, rules.time);
  events.emit(GAME_EVENTS.CAMPFIRE_REKINDLED, { ...tile });
  return { ok: true };
}

/**
 * R-IHM-NUI-001 : sources de lumière de la nuit : le héros, puis chaque feu allumé (centre de sa
 * tuile).
 * @param {GameState} state
 * @param {GameRules} rules
 * @returns {{ x: number, y: number, radius: number }[]}
 */
export function lightSources(state, rules) {
  if (rules.time === undefined) {
    return [];
  }
  const { heroLightRadius, campfireLightRadius } = rules.time;
  const half = state.map.tileSize / 2;
  const { hearth } = rules;
  const hearthLight =
    hearth !== undefined && isHearthTile(state, rules, hearth)
      ? [
          {
            x: hearth.column * state.map.tileSize + half,
            y: hearth.row * state.map.tileSize + half,
            radius: hearth.lightRadius,
          },
        ]
      : [];
  return [
    { ...state.player.position, radius: heroLightRadius },
    ...hearthLight,
    ...state.campfires
      .filter((fire) => fire.burnsUntil > state.clock)
      .map((fire) => ({
        x: fire.column * state.map.tileSize + half,
        y: fire.row * state.map.tileSize + half,
        radius: campfireLightRadius,
      })),
  ];
}

/**
 * Le centre de la tuile est-il à portée du joueur (`HARVEST_REACH`) ?
 * @param {GameState} state
 * @param {GameRules} rules
 * @param {TileCoordinates} tile
 * @returns {boolean}
 */
function isInReach(state, rules, { column, row }) {
  const bounds = state.map.boundsOf(column, row);
  const { x, y } = state.player.position;
  const centerX = (bounds.left + bounds.right) / 2;
  const centerY = (bounds.top + bounds.bottom) / 2;
  return Math.hypot(x - centerX, y - centerY) <= rules.harvestReach;
}

/**
 * R-ART-FAB-003 : un feu de camp allumé est-il à portée du joueur ?
 * @param {GameState} state
 * @param {GameRules} rules
 * @returns {boolean}
 */
export function hasLitFireInReach(state, rules) {
  return state.campfires.some(
    (fire) => fire.burnsUntil > state.clock && isInReach(state, rules, fire),
  );
}

/**
 * La tuile est-elle le Foyer (R-MON-FOY-001) ?
 * @param {GameState} state
 * @param {GameRules} rules
 * @param {TileCoordinates} tile
 * @returns {boolean}
 */
function isHearthTile(state, rules, { column, row }) {
  return (
    state.map.contains(column, row) &&
    rules.tiles[state.map.tileIdAt(column, row)]?.isHearth === true
  );
}

/**
 * Un feu allumé (feu de camp ou Foyer) à portée du joueur, s'il y en a un (R-MEN-SAU-002).
 * @param {GameState} state
 * @param {GameRules} rules
 * @returns {TileCoordinates | undefined}
 */
export function litFireInReach(state, rules) {
  const fires = [
    ...state.campfires.filter((fire) => fire.burnsUntil > state.clock),
    ...(rules.hearth !== undefined && isHearthTile(state, rules, rules.hearth)
      ? [rules.hearth]
      : []),
  ];
  const fire = fires.find((candidate) => isInReach(state, rules, candidate));
  return fire === undefined ? undefined : { column: fire.column, row: fire.row };
}
