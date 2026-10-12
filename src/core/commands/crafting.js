// @ts-check
import { GAME_EVENTS } from '../events/gameEvents.js';
import { gainExperience } from '../systems/experience.js';
import { hasLitFireInReach } from './campfire.js';
import { REJECTION_REASONS } from './commands.js';

/** @typedef {import('../state/GameState.js').GameState} GameState */
/** @typedef {import('../state/GameState.js').GameRules} GameRules */
/** @typedef {import('../events/EventBus.js').EventBus} EventBus */
/** @typedef {import('./commands.js').CommandResult} CommandResult */

/**
 * Ingrédient d'une recette : quantité possédée et quantité requise.
 * @typedef {object} IngredientStatus
 * @property {string} resource Clé de data/resources.js.
 * @property {number} owned
 * @property {number} required
 */

/**
 * Ce qu'on peut faire d'une recette : lu par la fenêtre d'artisanat (R-IHM-ART-001).
 * @typedef {object} RecipeInspection
 * @property {boolean} isKnown `true` si la recette existe et a été apprise.
 * @property {string | undefined} tool Outil obtenu, s'il y en a un.
 * @property {string | undefined} placeable Objet à poser obtenu, s'il y en a un.
 * @property {boolean} isOwned `true` si cet outil est déjà possédé.
 * @property {IngredientStatus[]} ingredients Dans l'ordre de la recette.
 * @property {boolean} hasIngredients `true` si aucun ingrédient ne manque.
 * @property {boolean} needsFire `true` si la recette se cuisine et qu'aucun feu allumé n'est à
 *   portée (R-ART-FAB-003).
 */

/**
 * R-INV-LIV-002 : lit un livre de la bibliothèque et apprend ses plans (livre de survie), dans
 * l'ordre du livre, sans doublon.
 * @param {GameState} state
 * @param {GameRules} rules
 * @param {EventBus} events
 * @param {string} bookId
 * @returns {CommandResult}
 */
export function readBook(state, rules, events, bookId) {
  if (!state.books.includes(bookId)) {
    return { ok: false, reason: REJECTION_REASONS.BOOK_NOT_OWNED };
  }
  const book = rules.books?.[bookId];
  const plans = book?.plans ?? [];
  if (book?.kind === 'research') {
    // C-TEC-08 : les plans sont découverts, à rechercher ensuite.
    state.discoveredPlans.push(...plans.filter((plan) => !state.discoveredPlans.includes(plan)));
  }
  const recipes =
    book?.kind === 'survival' ? plans.filter((plan) => !state.knownRecipes.includes(plan)) : [];
  state.knownRecipes.push(...recipes);
  if (!state.readBooks.includes(bookId)) {
    state.readBooks.push(bookId); // rangé aux archives (R-IHM-JRN-004)
  }
  events.emit(GAME_EVENTS.BOOK_READ, { bookId, recipes });
  return { ok: true };
}

/**
 * Décrit une recette sans rien modifier.
 * @param {GameState} state
 * @param {GameRules} rules
 * @param {string} recipeId
 * @returns {RecipeInspection}
 */
export function inspectRecipe(state, rules, recipeId) {
  const recipe = rules.recipes?.[recipeId];
  if (recipe === undefined) {
    return {
      isKnown: false,
      tool: undefined,
      placeable: undefined,
      isOwned: false,
      ingredients: [],
      hasIngredients: true,
      needsFire: false,
    };
  }
  const ingredients = Object.entries(recipe.ingredients).map(([resource, required]) => ({
    resource,
    owned: state.inventory[resource] ?? 0,
    required,
  }));
  return {
    isKnown: state.knownRecipes.includes(recipeId),
    tool: recipe.tool,
    placeable: recipe.placeable,
    isOwned: recipe.tool !== undefined && state.tools.includes(recipe.tool),
    ingredients,
    hasIngredients: ingredients.every(({ owned, required }) => owned >= required),
    needsFire: recipe.station === 'campfire' && !hasLitFireInReach(state, rules),
  };
}

/**
 * R-ART-FAB-001, R-ART-FAB-002 : vérifie les motifs de refus dans l'ordre, retire les ingrédients
 * et donne l'outil ou l'objet à poser.
 * @param {GameState} state
 * @param {GameRules} rules
 * @param {EventBus} events
 * @param {string} recipeId
 * @returns {CommandResult}
 */
export function craft(state, rules, events, recipeId) {
  const inspection = inspectRecipe(state, rules, recipeId);
  const reason = refusalOf(inspection);
  if (reason !== undefined) {
    return { ok: false, reason };
  }
  for (const { resource, required } of inspection.ingredients) {
    state.inventory[resource] -= required;
  }
  deliver(state, rules.recipes?.[recipeId]);
  const { tool, placeable } = inspection;
  events.emit(GAME_EVENTS.ITEM_CRAFTED, { recipeId, tool, placeable });
  gainExperience(state, rules, events, rules.experience?.craft ?? 0); // R-JOU-EXP-002
  return { ok: true };
}

/**
 * R-ART-FAB-002 : premier motif de refus qui s'applique, dans l'ordre.
 * @param {RecipeInspection} inspection
 * @returns {string | undefined}
 */
function refusalOf(inspection) {
  if (!inspection.isKnown) {
    return REJECTION_REASONS.UNKNOWN_RECIPE;
  }
  if (inspection.isOwned) {
    return REJECTION_REASONS.ALREADY_OWNED;
  }
  if (inspection.needsFire) {
    return REJECTION_REASONS.NEEDS_FIRE;
  }
  return inspection.hasIngredients ? undefined : REJECTION_REASONS.MISSING_INGREDIENTS;
}

/**
 * R-ART-FAB-001 : donne ce que produit la recette : outil, objet à poser ou ressource.
 * @param {GameState} state
 * @param {Readonly<import('../../../data/recipes.js').RecipeDefinition> | undefined} recipe
 */
function deliver(state, recipe) {
  if (recipe?.tool !== undefined) {
    state.tools.push(recipe.tool);
  }
  if (recipe?.placeable !== undefined) {
    state.placeables[recipe.placeable] = (state.placeables[recipe.placeable] ?? 0) + 1; // R-INV-POS-001
  }
  if (recipe?.resource !== undefined) {
    state.inventory[recipe.resource] = (state.inventory[recipe.resource] ?? 0) + 1;
  }
}
