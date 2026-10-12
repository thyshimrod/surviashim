// @ts-check

/**
 * Recettes d'artisanat (concept C-ART-04, spécification B.8). L'identifiant d'une recette est celui
 * du plan qu'un livre apprend (data/books.js). Une recette donne un outil ou un objet à poser.
 */

/**
 * @typedef {object} RecipeDefinition
 * @property {string} id Identifiant du plan.
 * @property {Readonly<Record<string, number>>} ingredients Ressources consommées, dans l'ordre
 *   d'affichage.
 * @property {string} [tool] Outil obtenu (clé de data/tools.js).
 * @property {string} [placeable] Objet à poser obtenu (clé de data/placeables.js), autant de
 *   fois qu'on veut (R-ART-FAB-001).
 * @property {string} [resource] Ressource obtenue, une unité (clé de data/resources.js).
 * @property {'campfire'} [station] La recette se cuisine : il faut un feu allumé à portée
 *   (R-ART-FAB-003).
 */

/** Ingrédients d'un outil en silex : une lame, un manche, un lien. */
const FLINT_TOOL = Object.freeze({ flint: 1, branch: 2, fiber: 1 });
/** Ingrédients d'un outil en pierre (B.11). */
const STONE_TOOL = Object.freeze({ stone: 2, branch: 2, fiber: 1 });

/** @type {Readonly<Record<string, Readonly<RecipeDefinition>>>} */
export const RECIPES = Object.freeze({
  'flint-axe': Object.freeze({ id: 'flint-axe', ingredients: FLINT_TOOL, tool: 'flint-axe' }),
  'flint-pickaxe': Object.freeze({
    id: 'flint-pickaxe',
    ingredients: FLINT_TOOL,
    tool: 'flint-pickaxe',
  }),
  campfire: Object.freeze({
    id: 'campfire',
    ingredients: Object.freeze({ stone: 3, wood: 2 }),
    placeable: 'campfire',
  }),
  // Plans de recherche (B.11).
  'stone-axe': Object.freeze({ id: 'stone-axe', ingredients: STONE_TOOL, tool: 'stone-axe' }),
  'stone-pickaxe': Object.freeze({
    id: 'stone-pickaxe',
    ingredients: STONE_TOOL,
    tool: 'stone-pickaxe',
  }),
  'gatherer-bag': Object.freeze({
    id: 'gatherer-bag',
    ingredients: Object.freeze({ fiber: 5, branch: 1 }),
    tool: 'gatherer-bag',
  }),
  'grilled-mushroom': Object.freeze({
    id: 'grilled-mushroom',
    ingredients: Object.freeze({ mushroom: 1 }),
    resource: 'grilled-mushroom',
    station: 'campfire',
  }),
});
