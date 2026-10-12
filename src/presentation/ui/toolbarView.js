// @ts-check
import { TEXTS } from '../i18n/fr.js';

/**
 * Bouton de la barre d'actions.
 * @typedef {object} ToolbarButton
 * @property {'inventory' | 'craft' | 'journal' | 'research' | 'game'} id Fenêtre ouverte par
 *   le bouton.
 * @property {string} icon Icône (clé de ICONS).
 * @property {string} label Nom et touche, affichés au survol (« Inventaire (I) »).
 * @property {boolean} isActive `true` si la fenêtre est ouverte.
 */

/** Icône de chaque bouton, dans l'ordre de la barre. */
const BUTTONS = Object.freeze([
  Object.freeze({ id: 'inventory', icon: 'sack' }),
  Object.freeze({ id: 'craft', icon: 'hammer' }),
  Object.freeze({ id: 'journal', icon: 'book-open' }),
  Object.freeze({ id: 'research', icon: 'scroll' }),
  Object.freeze({ id: 'game', icon: 'hourglass' }),
]);

/**
 * R-IHM-BAR-001 : contenu de la barre d'actions.
 * @param {{ open: string | undefined, journalOpen: boolean }} windows État des fenêtres.
 * @returns {ToolbarButton[]}
 */
export function toolbarView({ open, journalOpen }) {
  return BUTTONS.map(({ id, icon }) => ({
    id: /** @type {ToolbarButton['id']} */ (id),
    icon,
    label: TEXTS.toolbar[/** @type {ToolbarButton['id']} */ (id)],
    isActive: id === 'journal' ? journalOpen : open === id,
  }));
}
