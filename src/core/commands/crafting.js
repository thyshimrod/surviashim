// @ts-check
import { GAME_EVENTS } from '../events/gameEvents.js';
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
 * @property {string | undefined} tool Outil obtenu, `undefined` si la recette n'existe pas.
 * @property {boolean} isOwned `true` si cet outil est déjà possédé.
 * @property {IngredientStatus[]} ingredients Dans l'ordre de la recette.
 * @property {boolean} hasIngredients `true` si aucun ingrédient ne manque.
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
  const plans = book?.kind === 'survival' ? book.plans : [];
  const recipes = plans.filter((plan) => !state.knownRecipes.includes(plan));
  state.knownRecipes.push(...recipes);
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
  const ingredients = Object.entries(recipe?.ingredients ?? {}).map(([resource, required]) => ({
    resource,
    owned: state.inventory[resource] ?? 0,
    required,
  }));
  return {
    isKnown: recipe !== undefined && state.knownRecipes.includes(recipeId),
    tool: recipe?.tool,
    isOwned: recipe !== undefined && state.tools.includes(recipe.tool),
    ingredients,
    hasIngredients: ingredients.every(({ owned, required }) => owned >= required),
  };
}

/**
 * R-ART-FAB-001, R-ART-FAB-002 : vérifie les motifs de refus dans l'ordre, retire les ingrédients
 * et donne l'outil.
 * @param {GameState} state
 * @param {GameRules} rules
 * @param {EventBus} events
 * @param {string} recipeId
 * @returns {CommandResult}
 */
export function craft(state, rules, events, recipeId) {
  const inspection = inspectRecipe(state, rules, recipeId);
  if (!inspection.isKnown || inspection.tool === undefined) {
    return { ok: false, reason: REJECTION_REASONS.UNKNOWN_RECIPE };
  }
  if (inspection.isOwned) {
    return { ok: false, reason: REJECTION_REASONS.ALREADY_OWNED };
  }
  if (!inspection.hasIngredients) {
    return { ok: false, reason: REJECTION_REASONS.MISSING_INGREDIENTS };
  }
  for (const { resource, required } of inspection.ingredients) {
    state.inventory[resource] -= required;
  }
  state.tools.push(inspection.tool);
  events.emit(GAME_EVENTS.ITEM_CRAFTED, { recipeId, tool: inspection.tool });
  return { ok: true };
}
