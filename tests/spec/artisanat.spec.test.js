import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../../src/core/Game.js';
import { craftAt, createTestGame, harvestAt, readAt } from '../helpers/testGame.js';

/** Juste au sud de la tuile (7, 6) (centre (240, 208)) : distance 28 px, à portée. */
const SOUTH = { x: 240, y: 236 };

/** Partie avec un élément sur la tuile (7, 6), le joueur juste au sud. */
function withElement(tile, options = {}) {
  return createTestGame({
    map: { tiles: [[7, 6, tile]] },
    player: { position: SOUTH },
    ...options,
  });
}

/** Ingrédients exacts d'une hache ou d'une pioche en silex (B.8). */
const ONE_TOOL = { flint: 1, branch: 2, fiber: 1 };

/** Partie où la recette donnée est connue, avec l'inventaire et les outils indiqués. */
function crafting({ knownRecipes = ['flint-axe'], inventory = ONE_TOOL, tools = [] } = {}) {
  return createTestGame({ knownRecipes, inventory, tools });
}

describe('R-RES-OUT-001 · Outil requis pour récolter', () => {
  it("ex.1 — aucun outil, un arbre à portée : refus MISSING_TOOL, l'arbre reste", () => {
    const { game, state } = withElement('tree', { tools: [] });

    assert.deepEqual(harvestAt(game, 7, 6), { ok: false, reason: 'MISSING_TOOL' });
    assert.equal(state.map.tileIdAt(7, 6), 'tree');
    assert.equal(state.inventory.wood, 0);
  });

  it('ex.2 — la hache en silex, un arbre à portée : 3 bois', () => {
    const { game, state } = withElement('tree', { tools: ['flint-axe'] });

    harvestAt(game, 7, 6);

    assert.equal(state.inventory.wood, 3);
  });

  it('ex.3 — la hache seule, un rocher à portée : refus MISSING_TOOL', () => {
    const { game } = withElement('rock', { tools: ['flint-axe'] });

    assert.deepEqual(harvestAt(game, 7, 6), { ok: false, reason: 'MISSING_TOOL' });
  });

  it('ex.4 — la pioche en silex, un rocher à portée : 2 pierres', () => {
    const { game, state } = withElement('rock', { tools: ['flint-pickaxe'] });

    harvestAt(game, 7, 6);

    assert.equal(state.inventory.stone, 2);
  });

  it('ex.5 — aucun outil, des fleurs à portée : 1 fleur', () => {
    const { game, state } = withElement('flowers', { tools: [] });

    harvestAt(game, 7, 6);

    assert.equal(state.inventory.flower, 1);
  });
});

describe("R-RES-REC-004 · Refus d'une récolte", () => {
  it('ex.5 — aucun outil, un arbre hors de portée : refus MISSING_TOOL', () => {
    const { game } = withElement('tree', { tools: [], player: { position: { x: 600, y: 600 } } });

    assert.deepEqual(harvestAt(game, 7, 6), { ok: false, reason: 'MISSING_TOOL' });
  });
});

describe('R-INV-LIV-002 · Lire un livre', () => {
  it('ex.1 — une nouvelle partie commence sans recette connue', () => {
    assert.deepEqual(Game.create().getState().knownRecipes, []);
  });

  it('ex.2 — lire « Le Tailleur de silex » : hache puis pioche en silex', () => {
    const { game, state } = createTestGame({ books: ['flint-knapping'] });

    assert.deepEqual(readAt(game, 'flint-knapping'), { ok: true });
    assert.deepEqual(state.knownRecipes, ['flint-axe', 'flint-pickaxe']);
  });

  it("ex.3 — relire un livre n'apprend rien de plus", () => {
    const { game, state } = createTestGame({ books: ['flint-knapping'] });

    readAt(game, 'flint-knapping');
    readAt(game, 'flint-knapping');

    assert.deepEqual(state.knownRecipes, ['flint-axe', 'flint-pickaxe']);
  });

  it('ex.4 — un livre absent de la bibliothèque : refus BOOK_NOT_OWNED', () => {
    const { game, state } = createTestGame({ books: [] });

    assert.deepEqual(readAt(game, 'flint-knapping'), { ok: false, reason: 'BOOK_NOT_OWNED' });
    assert.deepEqual(state.knownRecipes, []);
  });

  it('ex.5 — lire le « Carnet du guetteur » : le feu de camp est connu', () => {
    const { game, state } = createTestGame({ books: ['watchman-notebook'] });

    readAt(game, 'watchman-notebook');

    assert.deepEqual(state.knownRecipes, ['campfire']);
  });
});

describe('R-INV-OUT-001 · Outils possédés', () => {
  it('ex.1 — une nouvelle partie commence sans outil', () => {
    assert.deepEqual(Game.create().getState().tools, []);
  });

  it('ex.2 — la hache possédée, le joueur fabrique la pioche : hache puis pioche', () => {
    const { game, state } = crafting({ knownRecipes: ['flint-pickaxe'], tools: ['flint-axe'] });

    craftAt(game, 'flint-pickaxe');

    assert.deepEqual(state.tools, ['flint-axe', 'flint-pickaxe']);
  });
});

describe('R-ART-FAB-001 · Fabriquer', () => {
  it('ex.1 — 2 silex, 3 branches, 1 fibre : il reste 1 silex, 1 branche, 0 fibre', () => {
    const { game, state } = crafting({ inventory: { flint: 2, branch: 3, fiber: 1 } });

    assert.deepEqual(craftAt(game, 'flint-axe'), { ok: true });
    assert.deepEqual(
      [state.inventory.flint, state.inventory.branch, state.inventory.fiber],
      [1, 1, 0],
    );
    assert.deepEqual(state.tools, ['flint-axe']);
  });

  it('ex.2 — la pioche avec les ingrédients exacts : tout est consommé', () => {
    const { game, state } = crafting({ knownRecipes: ['flint-pickaxe'] });

    craftAt(game, 'flint-pickaxe');

    assert.deepEqual(
      [state.inventory.flint, state.inventory.branch, state.inventory.fiber],
      [0, 0, 0],
    );
    assert.deepEqual(state.tools, ['flint-pickaxe']);
  });
});

describe("R-ART-FAB-002 · Refus d'une fabrication", () => {
  /** Tente la fabrication ; renvoie le résultat et l'inventaire d'avant. */
  const attempt = (options, recipe) => {
    const { game, state } = crafting(options);
    const before = { ...state.inventory };
    return { result: craftAt(game, recipe), before, after: state.inventory };
  };

  it('ex.1 — aucune recette connue : refus UNKNOWN_RECIPE', () => {
    const { result, before, after } = attempt({ knownRecipes: [] }, 'flint-axe');

    assert.deepEqual(result, { ok: false, reason: 'UNKNOWN_RECIPE' });
    assert.deepEqual(after, before);
  });

  it('ex.2 — la hache déjà possédée : refus ALREADY_OWNED', () => {
    const { result, before, after } = attempt({ tools: ['flint-axe'] }, 'flint-axe');

    assert.deepEqual(result, { ok: false, reason: 'ALREADY_OWNED' });
    assert.deepEqual(after, before);
  });

  it('ex.3 — 1 silex, 1 branche, 1 fibre : refus MISSING_INGREDIENTS', () => {
    const { result, before, after } = attempt(
      { inventory: { flint: 1, branch: 1, fiber: 1 } },
      'flint-axe',
    );

    assert.deepEqual(result, { ok: false, reason: 'MISSING_INGREDIENTS' });
    assert.deepEqual(after, before);
  });

  it("ex.4 — « catapulte », une recette qui n'existe pas : refus UNKNOWN_RECIPE", () => {
    const { result, before, after } = attempt({ knownRecipes: ['catapult'] }, 'catapult');

    assert.deepEqual(result, { ok: false, reason: 'UNKNOWN_RECIPE' });
    assert.deepEqual(after, before);
  });
});
