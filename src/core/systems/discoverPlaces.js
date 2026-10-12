// @ts-check
import { GAME_EVENTS } from '../events/gameEvents.js';
import { gainExperience } from './experience.js';

/** @typedef {import('../state/GameState.js').GameState} GameState */
/** @typedef {import('../state/GameState.js').GameRules} GameRules */
/** @typedef {import('../events/EventBus.js').EventBus} EventBus */
/** @typedef {import('../../../data/places.js').PlaceDefinition} PlaceDefinition */

/**
 * R-MON-LIE-001 : un point appartient à un lieu s'il est dans l'une de ses tuiles.
 * @param {Readonly<PlaceDefinition>} place
 * @param {{ x: number, y: number }} point
 * @param {number} tileSize
 * @returns {boolean}
 */
export function isInPlace(place, point, tileSize) {
  const column = Math.floor(point.x / tileSize);
  const row = Math.floor(point.y / tileSize);
  const { area } = place;
  return (
    column >= area.column &&
    column < area.column + area.width &&
    row >= area.row &&
    row < area.row + area.height
  );
}

/**
 * R-MON-LIE-002 : un lieu qui contient le joueur et n'est pas encore découvert le devient ; une
 * ligne « indice » du journal passe à « découvert », à la même place.
 * @param {GameState} state
 * @param {GameRules} rules
 * @param {EventBus} events
 */
export function discoverPlaces(state, rules, events) {
  const here = Object.values(rules.places ?? {}).filter((place) =>
    isInPlace(place, state.player.position, state.map.tileSize),
  );
  for (const place of here) {
    const entry = state.journal.find((line) => line.placeId === place.id);
    if (entry?.status === 'discovered') {
      announceReturn(state, events, place.id);
      continue;
    }
    if (entry === undefined) {
      state.journal.push({ placeId: place.id, status: 'discovered' });
    } else {
      entry.status = 'discovered';
    }
    events.emit(GAME_EVENTS.PLACE_DISCOVERED, { placeId: place.id });
    gainExperience(state, rules, events, rules.experience?.discover ?? 0); // R-JOU-EXP-002
  }
  state.currentPlaces = here.map((place) => place.id);
}

/**
 * R-MON-LIE-003 : un lieu déjà découvert où le joueur n'était pas au tick précédent est annoncé.
 * @param {GameState} state
 * @param {EventBus} events
 * @param {string} placeId
 */
function announceReturn(state, events, placeId) {
  if (!state.currentPlaces.includes(placeId)) {
    events.emit(GAME_EVENTS.PLACE_ENTERED, { placeId });
  }
}
