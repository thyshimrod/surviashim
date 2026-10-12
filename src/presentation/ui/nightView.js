// @ts-check
import { darknessAt } from '../../core/systems/time.js';

/**
 * Ce que la nuit demande au jeu.
 * @typedef {object} NightGame
 * @property {() => { day: number, minute: number }} time
 * @property {() => { x: number, y: number, radius: number }[]} lights
 * @property {{ time?: import('../../core/systems/time.js').TimeRules }} rules
 */

/**
 * Voile de la nuit (R-IHM-NUI-001).
 * @typedef {object} NightContent
 * @property {number} opacity Obscurité (R-MON-TPS-002).
 * @property {{ x: number, y: number, radius: number }[]} lights Halos, en px de monde.
 * @property {{ x: number, y: number }[]} flames Feux allumés : les halos après celui du héros.
 */

/**
 * R-IHM-NUI-001 : opacité du voile et halos de lumière.
 * @param {NightGame} game
 * @returns {NightContent}
 */
export function nightView(game) {
  const lights = game.lights();
  return {
    opacity: darknessAt(game.time().minute, game.rules),
    lights,
    flames: lights.slice(1).map(({ x, y }) => ({ x, y })),
  };
}
