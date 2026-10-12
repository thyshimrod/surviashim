// @ts-check
import { GAME_PARAMETERS } from '../../../data/gameParameters.js';
import { TOOLS } from '../../../data/tools.js';
import { TEXTS } from '../i18n/fr.js';
import { resourceNoun } from './InspectionController.js';

/** @typedef {import('../../core/commands/harvest.js').TileInspection} TileInspection */

/** Icône d'une récolte à la main. */
const HAND_ICON = 'gloves';

/**
 * Récolte en cours, à l'écran (R-IHM-RCL-001).
 * @typedef {object} HarvestContent
 * @property {string} icon Icône de l'outil (clé de ICONS).
 * @property {number} progress Remplissage de la barre, de 0 à 1.
 * @property {{ x: number, y: number }} position Pieds du héros (px de monde).
 */

/**
 * R-IHM-RCL-001 : l'outil qui s'agite et la barre de progression, s'il y a une récolte en cours.
 * @param {Pick<import('../../core/state/GameState.js').GameState, 'harvesting' | 'tick' | 'player'>} state
 * @returns {HarvestContent | undefined}
 */
export function harvestView({ harvesting, tick, player }) {
  if (harvesting === undefined) {
    return undefined;
  }
  const duration = harvesting.endTick - harvesting.startTick;
  const elapsed = tick - harvesting.startTick;
  return {
    icon: TOOLS[harvesting.toolId ?? '']?.icon ?? HAND_ICON,
    progress: duration <= 0 ? 1 : Math.min(1, Math.max(0, elapsed / duration)),
    position: { ...player.position },
  };
}

/**
 * R-IHM-INS-002 : « Couper : 1 bois, 2 branches · 3 s » — ce que le joueur obtiendrait avec ses
 * outils (R-RES-OUT-002) et, s'il peut récolter, la durée (R-RES-REC-006).
 * @param {TileInspection & { harvest: NonNullable<TileInspection['harvest']> }} inspection
 * @returns {string}
 */
export function harvestLabel(inspection) {
  const { action, resource, amount, extra } = inspection.harvest;
  const gains = [
    { resource, amount: amount + inspection.bonus },
    ...(extra === undefined ? [] : [extra]),
  ]
    .map((gain) => `${gain.amount} ${resourceNoun(gain.resource, gain.amount)}`)
    .join(', ');
  const label = `${TEXTS.harvestActions[action]} : ${gains}`;
  if (!inspection.hasTool || !Number.isFinite(inspection.durationTicks)) {
    return label;
  }
  return TEXTS.harvestDuration(label, inspection.durationTicks / GAME_PARAMETERS.TICK_RATE);
}
