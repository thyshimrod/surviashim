// @ts-check
import { hitboxAt, overlaps } from '../utils/box.js';
import { ticksFor } from './time.js';

/** @typedef {import('../state/GameState.js').GameState} GameState */
/** @typedef {import('../state/GameState.js').GameRules} GameRules */
/** @typedef {import('../state/GameState.js').Npc} Npc */
/** @typedef {{ x: number, y: number }} Point */

/**
 * Étapes de la promenade d'un PNJ (centres de tuiles) : chaque tuile de sa promenade, avec un
 * retour chez lui après chacune.
 * @param {Npc} npc
 * @param {GameRules} rules
 * @param {number} tileSize
 * @returns {Point[]}
 */
function stepsOf(npc, rules, tileSize) {
  const home = npc.home ?? npc.position;
  const route = rules.npcs?.[npc.id]?.route ?? [];
  return route.flatMap(({ column, row }) => [
    { x: home.x + column * tileSize, y: home.y + row * tileSize },
    { ...home },
  ]);
}

/**
 * Pas d'au plus `speed` px d'une valeur vers une autre.
 * @param {number} from
 * @param {number} to
 * @param {number} speed
 * @returns {number}
 */
function approach(from, to, speed) {
  return from + Math.sign(to - from) * Math.min(speed, Math.abs(to - from));
}

/**
 * R-PNJ-POS-003 : chaque PNJ attend, puis marche vers l'étape suivante de sa promenade. Il ne bouge
 * pas pendant un dialogue avec le joueur, ni quand le joueur lui barre la route.
 * @param {GameState} state
 * @param {GameRules} rules
 */
export function walkNpcs(state, rules) {
  const { npcWalk, time } = rules;
  if (npcWalk === undefined || time === undefined) {
    return;
  }
  const player = hitboxAt(state.player.position, rules.hitbox);
  for (const npc of state.npcs) {
    const isTalking = state.dialogue?.npcId === npc.id;
    const isResting = state.clock < (npc.pauseUntil ?? 0);
    npc.isWalking = false;
    if (!isTalking && !isResting) {
      walkOneStep(npc, { rules, tileSize: state.map.tileSize, player });
      if (!npc.isWalking && npc.pauseUntil === ARRIVED) {
        npc.pauseUntil = state.clock + ticksFor(npcWalk.pauseMinutes, time);
      }
    }
  }
}

/** Marque d'un PNJ qui vient d'arriver à une étape : sa pause commence. */
const ARRIVED = -1;

/**
 * Un pas d'un PNJ vers l'étape suivante, s'il n'est pas bloqué par le joueur.
 * @param {Npc} npc
 * @param {{ rules: GameRules, tileSize: number, player: import('../utils/box.js').Box }} context
 */
function walkOneStep(npc, { rules, tileSize, player }) {
  const steps = stepsOf(npc, rules, tileSize);
  const speed = rules.npcWalk?.speed ?? 0;
  if (steps.length === 0) {
    return;
  }
  const target = steps[(npc.step ?? 0) % steps.length];
  const next = {
    x: approach(npc.position.x, target.x, speed),
    y: approach(npc.position.y, target.y, speed),
  };
  if (overlaps(hitboxAt(next, rules.hitbox), player)) {
    return;
  }
  npc.facing = facingOf(npc.position, next) ?? npc.facing;
  npc.position = next;
  npc.isWalking = true;
  if (next.x === target.x && next.y === target.y) {
    npc.isWalking = false;
    npc.step = ((npc.step ?? 0) + 1) % steps.length;
    npc.pauseUntil = ARRIVED;
  }
}

/**
 * Orientation d'un pas, ou `undefined` s'il est nul.
 * @param {Point} from
 * @param {Point} to
 * @returns {import('../config/directions.js').Facing | undefined}
 */
function facingOf(from, to) {
  if (to.x !== from.x) {
    return to.x > from.x ? 'right' : 'left';
  }
  if (to.y !== from.y) {
    return to.y > from.y ? 'down' : 'up';
  }
  return undefined;
}
