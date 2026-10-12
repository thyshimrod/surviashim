// @ts-check
import { GAME_PARAMETERS } from '../../data/gameParameters.js';
import { GAME_EVENTS } from '../core/events/gameEvents.js';
import { MINUTES_PER_DAY } from '../core/systems/time.js';
import { saveGame } from '../core/state/save.js';

/** @typedef {import('../core/Game.js').Game} Game */

/** Clé de la sauvegarde dans le stockage du navigateur. */
export const SAVE_KEY = 'surshim-save';

/**
 * Ce que le magasin attend du stockage (localStorage, ou une imitation dans les tests).
 * @typedef {object} KeyValueStorage
 * @property {(key: string) => string | null} getItem
 * @property {(key: string, value: string) => void} setItem
 * @property {(key: string) => void} removeItem
 */

/**
 * Magasin de sauvegarde.
 * @typedef {object} SaveStore
 * @property {(game: Game) => void} save
 * @property {() => unknown} load
 * @property {() => void} clear
 * @property {() => number | undefined} savedDay
 * @property {(game: Game) => void} attach
 */

/**
 * Sauvegarde de la partie dans le stockage du navigateur (R-SAU-SAV-001). Le stockage peut être
 * indisponible (navigation privée, quota) : les erreurs sont absorbées, le jeu continue.
 * @param {KeyValueStorage | undefined} storage
 * @returns {SaveStore}
 */
export function createSaveStore(storage) {
  /** @type {number | undefined | null} Jour sauvegardé ; `null` : pas encore lu. */
  let cachedDay = null;
  return {
    /**
     * Sauvegarde la partie.
     * @param {Game} game
     */
    save(game) {
      try {
        storage?.setItem(SAVE_KEY, JSON.stringify(saveGame(game.getState())));
        cachedDay = null;
      } catch {
        // Stockage plein ou interdit : la partie continue sans sauvegarde.
      }
    },

    /**
     * @returns {unknown} La sauvegarde relue, ou `undefined` s'il n'y en a pas ou qu'elle est
     *   illisible.
     */
    load() {
      try {
        const text = storage?.getItem(SAVE_KEY);
        return text ? JSON.parse(text) : undefined;
      } catch {
        return undefined;
      }
    },

    /** Efface la sauvegarde (nouvelle partie). */
    clear() {
      try {
        storage?.removeItem(SAVE_KEY);
        cachedDay = undefined;
      } catch {
        // Rien à effacer.
      }
    },

    /**
     * Jour de la sauvegarde, pour la fenêtre « Partie » (R-IHM-SAU-001).
     * @returns {number | undefined}
     */
    savedDay() {
      if (cachedDay === null) {
        const save = /** @type {{ rest?: { clock?: number } } | undefined} */ (this.load());
        const clock = save?.rest?.clock;
        cachedDay = clock === undefined ? undefined : Math.floor(clock / SAVED_DAY_TICKS) + 1;
      }
      return cachedDay;
    },

    /**
     * Sauvegarde à chaque réveil (R-JOU-SOM-001).
     * @param {Game} game
     */
    attach(game) {
      game.events.on(GAME_EVENTS.SLEPT, () => this.save(game));
    },
  };
}

/** Ticks d'un jour de jeu, pour lire le jour d'une sauvegarde sans charger la partie. */
const SAVED_DAY_TICKS = MINUTES_PER_DAY * GAME_PARAMETERS.TICK_PER_GAME_MINUTE;
