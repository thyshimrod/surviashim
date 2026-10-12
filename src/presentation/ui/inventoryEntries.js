// @ts-check
import { RESOURCES } from '../../../data/resources.js';
import { TEXTS } from '../i18n/fr.js';

/**
 * Ligne du bandeau d'inventaire.
 * @typedef {object} InventoryEntry
 * @property {string} id Ressource, ou « experience ».
 * @property {string} label Libellé affiché (« Bois »).
 * @property {number} [amount] Absente pour l'horloge.
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
 * R-IHM-HUD-002 : l'expérience, en fin de bandeau.
 * @param {number} experience
 * @returns {InventoryEntry}
 */
export function experienceEntry(experience) {
  return { id: 'experience', label: TEXTS.experienceLabel, amount: experience, icon: 'experience' };
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
