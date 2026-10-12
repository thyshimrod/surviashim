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
/** @typedef {import('../state/GameState.js').Harvesting} Harvesting */

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
 * @property {number} bonus Rendement en plus, grâce aux outils du joueur (R-RES-OUT-002).
 * @property {string | undefined} toolId Outil qui servirait à récolter ; `undefined` à la main.
 * @property {number} durationTicks Durée de la récolte (R-RES-REC-006).
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
      bonus: 0,
      toolId: undefined,
      durationTicks: 0,
    };
  }
  const tileId = map.tileIdAt(column, row);
  const bounds = map.boundsOf(column, row);
  const centerX = (bounds.left + bounds.right) / 2;
  const centerY = (bounds.top + bounds.bottom) / 2;
  const distance = Math.hypot(player.position.x - centerX, player.position.y - centerY);
  const definition = rules.tiles[tileId];
  return {
    tileId,
    harvest: definition?.harvest,
    search: definition?.search,
    isInReach: distance <= rules.harvestReach, // R-RES-REC-001
    ...harvestAbility(state, rules, definition?.harvest),
    ...(definition?.isCampfire || definition?.isHearth
      ? { campfire: inspectCampfire(state, rules, { column, row }) }
      : {}),
  };
}

/**
 * Ce que les outils du joueur permettent sur cette récolte : outil requis (R-RES-OUT-001), bonus
 * (R-RES-OUT-002), outil utilisé et durée (R-RES-REC-006).
 * @param {GameState} state
 * @param {GameRules} rules
 * @param {Readonly<HarvestDefinition> | undefined} harvestDefinition
 * @returns {Pick<TileInspection, 'hasTool' | 'bonus' | 'toolId' | 'durationTicks'>}
 */
function harvestAbility(state, rules, harvestDefinition) {
  return {
    hasTool: hasToolKind(state, rules, harvestDefinition?.tool),
    bonus: bestBonus(state, rules, harvestDefinition?.boostedBy),
    ...harvestTool(state, rules, harvestDefinition?.tool),
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
 * R-RES-REC-006 : le meilleur outil de cette sorte (le plus rapide) et la durée de la récolte.
 * @param {GameState} state
 * @param {GameRules} rules
 * @param {string | undefined} kind `undefined` : à la main.
 * @returns {{ toolId: string | undefined, durationTicks: number }}
 */
function harvestTool(state, rules, kind) {
  const hand = { toolId: undefined, durationTicks: rules.handHarvestTicks ?? 0 };
  if (kind === undefined) {
    return hand;
  }
  return state.tools
    .map((id) => ({ toolId: id, durationTicks: rules.tools?.[id]?.harvestTicks ?? Infinity }))
    .filter(({ toolId }) => rules.tools?.[toolId]?.kind === kind)
    .reduce(
      (best, tool) => (tool.durationTicks < best.durationTicks ? tool : best),
      /** @type {{ toolId: string | undefined, durationTicks: number }} */ ({
        toolId: undefined,
        durationTicks: Infinity,
      }),
    );
}

/**
 * Commence la récolte de l'élément d'une tuile : vérifie les motifs de refus dans l'ordre
 * (R-RES-REC-004, R-RES-OUT-001) ; elle s'achève après sa durée (R-RES-REC-006), aussitôt si
 * elle est nulle.
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
  state.harvesting = {
    column: tile.column,
    row: tile.row,
    toolId: inspection.toolId,
    startTick: state.tick,
    endTick: state.tick + inspection.durationTicks,
  };
  if (inspection.durationTicks <= 0) {
    completeHarvest(state, rules, events);
  }
  return { ok: true };
}

/**
 * R-RES-REC-006 : la récolte en cours s'interrompt si le joueur se déplace ; elle s'achève à son
 * terme.
 * @param {GameState} state
 * @param {GameRules} rules
 * @param {EventBus} events
 */
export function updateHarvest(state, rules, events) {
  const { harvesting } = state;
  if (harvesting === undefined) {
    return;
  }
  const { dx, dy } = state.player.moveIntent;
  if (dx !== 0 || dy !== 0) {
    state.harvesting = undefined;
  } else if (state.tick >= harvesting.endTick) {
    completeHarvest(state, rules, events);
  }
}

/**
 * Achève la récolte en cours : ajoute le rendement à l'inventaire (R-RES-REC-002) et transforme
 * la tuile (R-RES-REC-003), si l'élément est toujours là.
 * @param {GameState} state
 * @param {GameRules} rules
 * @param {EventBus} events
 */
function completeHarvest(state, rules, events) {
  const tile = /** @type {Harvesting} */ (state.harvesting);
  state.harvesting = undefined;
  const inspection = inspectTile(state, rules, tile);
  if (inspection.harvest === undefined) {
    return;
  }
  const { resource, becomes, regrowDays, extra } = inspection.harvest;
  const amount = inspection.harvest.amount + inspection.bonus; // R-RES-OUT-002
  for (const gain of [{ resource, amount }, ...(extra === undefined ? [] : [extra])]) {
    state.inventory[gain.resource] = (state.inventory[gain.resource] ?? 0) + gain.amount;
  }
  const { column, row } = tile;
  state.map.setTile(column, row, rules.tiles[becomes]);
  scheduleRegrowth(state, rules, { column, row, tileId: inspection.tileId, regrowDays });
  events.emit(GAME_EVENTS.RESOURCE_HARVESTED, {
    column,
    row,
    resource,
    amount,
    total: state.inventory[resource],
  });
  events.emit(GAME_EVENTS.TILE_CHANGED, { column, row, tileId: becomes });
  gainExperience(state, rules, events, rules.experience?.harvest ?? 0); // R-JOU-EXP-002
}

/**
 * R-RES-REC-005 : l'élément récolté repoussera, s'il repousse.
 * @param {GameState} state
 * @param {GameRules} rules
 * @param {TileCoordinates & { tileId: string | undefined, regrowDays: number | undefined }} harvested
 */
function scheduleRegrowth(state, rules, { column, row, tileId, regrowDays }) {
  if (regrowDays === undefined || rules.time === undefined || tileId === undefined) {
    return;
  }
  const at = state.clock + ticksFor(regrowDays * MINUTES_PER_DAY, rules.time);
  state.regrowth.push({ column, row, tile: tileId, at });
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
