// @ts-check

/**
 * Recettes d'artisanat (concept C-ART-04, spécification B.8). L'identifiant d'une recette est celui
 * du plan qu'un livre apprend (data/books.js) ; un plan sans recette ici (le feu de camp) est
 * connu mais ne se fabrique pas encore.
 */

/**
 * @typedef {object} RecipeDefinition
 * @property {string} id Identifiant du plan.
 * @property {Readonly<Record<string, number>>} ingredients Ressources consommées, dans l'ordre
 *   d'affichage.
 * @property {string} tool Outil obtenu (clé de data/tools.js).
 */

/** Ingrédients d'un outil en silex : une lame, un manche, un lien. */
const FLINT_TOOL = Object.freeze({ flint: 1, branch: 2, fiber: 1 });

/** @type {Readonly<Record<string, Readonly<RecipeDefinition>>>} */
export const RECIPES = Object.freeze({
  'flint-axe': Object.freeze({ id: 'flint-axe', ingredients: FLINT_TOOL, tool: 'flint-axe' }),
  'flint-pickaxe': Object.freeze({
    id: 'flint-pickaxe',
    ingredients: FLINT_TOOL,
    tool: 'flint-pickaxe',
  }),
});
