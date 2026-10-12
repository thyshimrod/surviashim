// @ts-check
import { RESOURCES } from '../../../data/resources.js';
import { GAME_PARAMETERS } from '../../../data/gameParameters.js';
import { levelOf, levelThreshold } from '../../core/systems/experience.js';
import { TEXTS } from '../i18n/fr.js';

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
 * Ligne du bandeau d'inventaire.
 * @typedef {object} InventoryEntry
 * @property {string} id Ressource, ou « experience ».
 * @property {string} label Libellé affiché (« Bois »).
 * @property {number} [amount] Absente pour l'horloge et le niveau.
 * @property {string} icon Icône (clé de ICONS).
 */

/**
 * R-IHM-HUD-001 : contenu du bandeau d'inventaire, dans l'ordre de data/resources.js.
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
 * R-IHM-HUD-003 : PV et faim, au début du bandeau.
 * @param {{ health: number, hunger: number }} state
 * @returns {InventoryEntry[]}
 */
export function vitalEntries({ health, hunger }) {
  return [
    { id: 'health', label: TEXTS.healthLabel, amount: health, icon: 'health' },
    { id: 'hunger', label: TEXTS.hungerLabel, amount: hunger, icon: 'hunger' },
  ];
}
