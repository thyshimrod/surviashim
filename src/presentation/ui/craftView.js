// @ts-check
import { PLACEABLES } from '../../../data/placeables.js';
import { TOOLS } from '../../../data/tools.js';
import { TEXTS } from '../i18n/fr.js';
import { CONTENT_TEXTS } from '../i18n/frContent.js';
import { resourceNoun } from './InspectionController.js';

/** @typedef {import('../../core/commands/crafting.js').RecipeInspection} RecipeInspection */

/**
 * Ce que la fenêtre d'artisanat attend du jeu.
 * @typedef {object} CraftableGame
 * @property {() => { knownRecipes: readonly string[] }} getState
 * @property {(recipeId: string) => RecipeInspection} inspectRecipe
 */

/**
 * Ligne de la fenêtre d'artisanat.
 * @typedef {object} CraftEntry
 * @property {string} id Recette.
 * @property {string} name Nom de l'objet (« Hache en silex »).
 * @property {string} icon Icône (clé de ICONS).
 * @property {string} ingredients « Silex 2/1 · Branches 1/2 · Fibres 1/1 ».
 * @property {string} button Libellé du bouton.
 * @property {boolean} isEnabled
 * @property {string | undefined} warning Pourquoi le bouton est inactif.
 */

/**
 * Contenu de la fenêtre d'artisanat (R-IHM-ART-001).
 * @typedef {object} CraftContent
 * @property {CraftEntry[]} entries Recettes fabricables, dans l'ordre où elles ont été apprises.
 * @property {string | undefined} empty Message s'il n'y en a aucune.
 */

/**
 * @param {CraftableGame} game
 * @returns {CraftContent}
 */
export function craftView(game) {
  const entries = game.getState().knownRecipes.map((id) => toEntry(id, game.inspectRecipe(id)));
  return { entries, empty: entries.length === 0 ? TEXTS.craftEmpty : undefined };
}

/**
 * @param {string} id
 * @param {RecipeInspection} inspection
 * @returns {CraftEntry}
 */
function toEntry(id, inspection) {
  const plan = CONTENT_TEXTS.plans[id] ?? id;
  return {
    id,
    name: plan.charAt(0).toUpperCase() + plan.slice(1),
    icon:
      TOOLS[inspection.tool ?? '']?.icon ?? PLACEABLES[inspection.placeable ?? '']?.icon ?? 'axe',
    ingredients: inspection.ingredients
      .map(
        ({ resource, owned, required }) =>
          `${TEXTS.hudLabels[resource] ?? resource} ${owned}/${required}`,
      )
      .join(' · '),
    button: TEXTS.craftButton,
    isEnabled: !inspection.isOwned && inspection.hasIngredients,
    warning: warningOf(inspection),
  };
}

/**
 * @param {RecipeInspection} inspection
 * @returns {string | undefined}
 */
function warningOf(inspection) {
  if (inspection.isOwned) {
    return TEXTS.alreadyOwned;
  }
  if (inspection.hasIngredients) {
    return undefined;
  }
  const missing = inspection.ingredients
    .filter(({ owned, required }) => owned < required)
    .map(({ resource, owned, required }) => {
      const amount = required - owned;
      return `${amount} ${resourceNoun(resource, amount)}`;
    });
  return TEXTS.missingIngredients(missing.join(', '));
}
