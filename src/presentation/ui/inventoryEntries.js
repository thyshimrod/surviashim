// @ts-check
import { RESOURCES } from '../../../data/resources.js';
import { GAME_PARAMETERS } from '../../../data/gameParameters.js';
import { levelOf, levelThreshold } from '../../core/systems/experience.js';
import { TEXTS } from '../i18n/fr.js';
import { clockLabel } from './clockLabel.js';

/** Règles des niveaux (R-JOU-EXP-003), pour l'affichage. */
const LEVEL_RULES = Object.freeze({
  experience: Object.freeze({
    harvest: GAME_PARAMETERS.XP_HARVEST,
    search: GAME_PARAMETERS.XP_SEARCH,
    craft: GAME_PARAMETERS.XP_CRAFT,
    discover: GAME_PARAMETERS.XP_DISCOVER,
    firstLevel: GAME_PARAMETERS.LEVEL_FIRST_XP,
    step: GAME_PARAMETERS.LEVEL_XP_STEP,
  }),
});

/**
 * Ligne du bandeau, ou ressource de l'inventaire.
 * @typedef {object} InventoryEntry
 * @property {string} id Ressource, ou « experience ».
 * @property {string} label Libellé affiché (« Bois »).
 * @property {number} [amount] Absente pour l'horloge et le niveau.
 * @property {string} icon Icône (clé de ICONS).
 */

/**
 * R-IHM-INV-001 : ressources de l'inventaire, dans l'ordre de data/resources.js.
 * @param {Readonly<Record<string, number>>} inventory
 * @returns {InventoryEntry[]}
 */
export function inventoryEntries(inventory) {
  return Object.values(RESOURCES).map((resource) => ({
    id: resource.id,
    label: TEXTS.hudLabels[resource.id] ?? resource.id,
    amount: inventory[resource.id] ?? 0,
    icon: resource.icon,
  }));
}

/**
 * R-IHM-HUD-002 : niveau et expérience, en fin de bandeau : « Niveau 1 · 70/100 ».
 * @param {number} experience
 * @returns {InventoryEntry}
 */
export function experienceEntry(experience) {
  const level = levelOf(experience, LEVEL_RULES);
  const next = levelThreshold(level + 1, LEVEL_RULES.experience);
  return { id: 'experience', label: TEXTS.levelLabel(level, experience, next), icon: 'experience' };
}

/**
 * R-IHM-HUD-003 : le bandeau, réduit à l'essentiel : PV, faim, énergie, niveau, heure.
 * @param {{ health: number, hunger: number, energy: number, experience: number }} state
 * @param {{ day: number, minute: number }} time
 * @returns {InventoryEntry[]}
 */
export function hudEntries(state, time) {
  return [
    ...vitalEntries(state),
    experienceEntry(state.experience),
    { id: 'clock', label: clockLabel(time), icon: 'hourglass' },
  ];
}

/**
 * R-IHM-HUD-003 : PV, faim et énergie, au début du bandeau.
 * @param {{ health: number, hunger: number, energy: number }} state
 * @returns {InventoryEntry[]}
 */
export function vitalEntries({ health, hunger, energy }) {
  return [
    { id: 'health', label: TEXTS.healthLabel, amount: health, icon: 'health' },
    { id: 'hunger', label: TEXTS.hungerLabel, amount: hunger, icon: 'hunger' },
    { id: 'energy', label: TEXTS.energyLabel, amount: energy, icon: 'experience' },
  ];
}
