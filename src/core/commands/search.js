// @ts-check
import { GAME_EVENTS } from '../events/gameEvents.js';
import { REJECTION_REASONS } from './commands.js';
import { inspectTile } from './harvest.js';

/** @typedef {import('../state/GameState.js').GameState} GameState */
/** @typedef {import('../state/GameState.js').GameRules} GameRules */
/** @typedef {import('../events/EventBus.js').EventBus} EventBus */
/** @typedef {import('./commands.js').CommandResult} CommandResult */
/** @typedef {{ column: number, row: number }} TileCoordinates */

/**
 * Fouille l'élément d'une tuile : vérifie les motifs de refus dans l'ordre (R-RES-FOU-004),
 * ajoute le contenu de la cachette (R-RES-FOU-003) et laisse l'élément « fouillé ».
 * @param {GameState} state
 * @param {GameRules} rules
 * @param {EventBus} events
 * @param {TileCoordinates} tile
 * @returns {CommandResult}
 */
export function search(state, rules, events, tile) {
  const inspection = inspectTile(state, rules, tile);
  if (inspection.search === undefined) {
    return { ok: false, reason: REJECTION_REASONS.NOTHING_TO_SEARCH };
  }
  if (!inspection.isInReach) {
    return { ok: false, reason: REJECTION_REASONS.OUT_OF_REACH };
  }
  const spot = (rules.searchSpots ?? []).find(
    ({ column, row }) => column === tile.column && row === tile.row,
  );
  const findings = takeContents(state, rules, spot);
  const { becomes } = inspection.search;
  state.map.setTile(tile.column, tile.row, rules.tiles[becomes]);
  events.emit(GAME_EVENTS.ITEMS_FOUND, { ...tile, ...findings });
  events.emit(GAME_EVENTS.TILE_CHANGED, { ...tile, tileId: becomes });
  return { ok: true };
}

/**
 * R-RES-FOU-003 : ajoute le contenu d'une cachette (livres nouveaux, objets nouveaux,
 * matériaux) à ce que possède le joueur.
 * @param {GameState} state
 * @param {GameRules} rules
 * @param {Readonly<import('../../../data/searchSpots.js').SearchSpot> | undefined} spot
 * @returns {{ books: string[], items: string[], resources: Record<string, number> }} Ce qui a
 *   été trouvé.
 */
function takeContents(state, rules, spot) {
  const books = (spot?.books ?? [])
    .slice(0, rules.searchMaxBooks ?? 0)
    .filter((book) => !state.books.includes(book));
  state.books.push(...books);
  const items = (spot?.items ?? []).filter((item) => !state.items.includes(item));
  state.items.push(...items); // R-INV-OBJ-001
  const resources = { ...spot?.resources };
  for (const [resource, amount] of Object.entries(resources)) {
    state.inventory[resource] = (state.inventory[resource] ?? 0) + amount;
  }
  return { books, items, resources };
}
