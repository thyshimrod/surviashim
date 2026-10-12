// @ts-check
import { GAME_EVENTS } from '../events/gameEvents.js';
import { ticksFor, MINUTES_PER_DAY } from '../systems/time.js';
import { gainExperience } from '../systems/experience.js';
import { inspectCampfire } from './campfire.js';
import { REJECTION_REASONS } from './commands.js';

/** @typedef {import('../state/GameState.js').GameState} GameState */
/** @typedef {import('../state/GameState.js').GameRules} GameRules */
/** @typedef {import('../events/EventBus.js').EventBus} EventBus */
/** @typedef {import('./commands.js').CommandResult} CommandResult */
/** @typedef {import('../../../data/tilesets.js').HarvestDefinition} HarvestDefinition */
/** @typedef {{ column: number, row: number }} TileCoordinates */

/**
 * Ce qu'on peut faire d'une tuile : lu par la fenêtre d'information (R-IHM-INS-002).
 * @typedef {object} TileInspection
 * @property {string | undefined} tileId `undefined` hors de la carte.
 * @property {Readonly<HarvestDefinition> | undefined} harvest Récolte possible (R-RES-ELE-001).
 * @property {Readonly<{ becomes: string }> | undefined} search Fouille possible (R-RES-FOU-001).
 * @property {boolean} isInReach `true` si la tuile est à portée du joueur (R-RES-REC-001,
 *   R-RES-FOU-002).
 * @property {boolean} hasTool `true` si le joueur a l'outil qu'exige la récolte, ou si elle n'en
 *   exige pas (R-RES-OUT-001).
 * @property {import('./campfire.js').CampfireInspection} [campfire] Présent sur un feu de camp
 *   (R-IHM-INS-008).
 */

/**
 * Décrit une tuile sans rien modifier.
 * @param {GameState} state
 * @param {GameRules} rules
 * @param {TileCoordinates} tile
 * @returns {TileInspection}
 */
export function inspectTile(state, rules, { column, row }) {
  const { map, player } = state;
  if (!map.contains(column, row)) {
    return {
      tileId: undefined,
      harvest: undefined,
      search: undefined,
      isInReach: false,
      hasTool: true,
    };
  }
  const tileId = map.tileIdAt(column, row);
  const bounds = map.boundsOf(column, row);
  const centerX = (bounds.left + bounds.right) / 2;
  const centerY = (bounds.top + bounds.bottom) / 2;
  const distance = Math.hypot(player.position.x - centerX, player.position.y - centerY);
  const harvestDefinition = rules.tiles[tileId]?.harvest;
  return {
    tileId,
    harvest: harvestDefinition,
    search: rules.tiles[tileId]?.search,
    isInReach: distance <= rules.harvestReach, // R-RES-REC-001
    hasTool: hasToolKind(state, rules, harvestDefinition?.tool),
    ...(rules.tiles[tileId]?.isCampfire
      ? { campfire: inspectCampfire(state, rules, { column, row }) }
      : {}),
  };
}

/**
 * R-RES-OUT-001 : le joueur a-t-il un outil de cette sorte ?
 * @param {GameState} state
 * @param {GameRules} rules
 * @param {string | undefined} kind `undefined` : aucun outil exigé.
 * @returns {boolean}
 */
function hasToolKind(state, rules, kind) {
  return kind === undefined || state.tools.some((tool) => rules.tools?.[tool]?.kind === kind);
}

/**
 * Récolte l'élément d'une tuile : vérifie les motifs de refus dans l'ordre (R-RES-REC-004,
 * R-RES-OUT-001),
 * ajoute le rendement à l'inventaire (R-RES-REC-002) et transforme la tuile (R-RES-REC-003).
 * @param {GameState} state
 * @param {GameRules} rules
 * @param {EventBus} events
 * @param {TileCoordinates} tile
 * @returns {CommandResult}
 */
export function harvest(state, rules, events, tile) {
  const inspection = inspectTile(state, rules, tile);
  if (inspection.harvest === undefined) {
    return { ok: false, reason: REJECTION_REASONS.NOTHING_TO_HARVEST };
  }
  if (!inspection.hasTool) {
    return { ok: false, reason: REJECTION_REASONS.MISSING_TOOL };
  }
  if (!inspection.isInReach) {
    return { ok: false, reason: REJECTION_REASONS.OUT_OF_REACH };
  }
  const { resource, becomes, regrowDays, boostedBy } = inspection.harvest;
  const amount = inspection.harvest.amount + bestBonus(state, rules, boostedBy); // R-RES-OUT-002
  state.inventory[resource] = (state.inventory[resource] ?? 0) + amount;
  state.map.setTile(tile.column, tile.row, rules.tiles[becomes]);
  if (regrowDays !== undefined && rules.time !== undefined) {
    // R-RES-REC-005 : l'élément repoussera.
    const days = regrowDays * MINUTES_PER_DAY;
    const at = state.clock + ticksFor(days, rules.time);
    state.regrowth.push({ ...tile, tile: /** @type {string} */ (inspection.tileId), at });
  }
  events.emit(GAME_EVENTS.RESOURCE_HARVESTED, {
    ...tile,
    resource,
    amount,
    total: state.inventory[resource],
  });
  events.emit(GAME_EVENTS.TILE_CHANGED, { ...tile, tileId: becomes });
  gainExperience(state, rules, events, rules.experience?.harvest ?? 0); // R-JOU-EXP-002
  return { ok: true };
}

/**
 * R-RES-OUT-002 : bonus du meilleur outil possédé de cette sorte.
 * @param {GameState} state
 * @param {GameRules} rules
 * @param {string | undefined} kind
 * @returns {number}
 */
function bestBonus(state, rules, kind) {
  if (kind === undefined) {
    return 0;
  }
  return Math.max(
    0,
    ...state.tools
      .map((id) => rules.tools?.[id])
      .filter((tool) => tool?.kind === kind)
      .map((tool) => tool?.bonus ?? 0),
  );
}
