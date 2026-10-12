import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../../src/core/Game.js';
import { createTestGame, harvestAt } from '../helpers/testGame.js';

/** Un arbre sur la tuile (7, 6), centre (240, 208) ; le joueur à la position donnée. */
const withTreeAt76 = (position, options = {}) =>
  createTestGame({ map: { tiles: [[7, 6, 'tree']] }, player: { position }, ...options });

/** Juste au sud de l'arbre (7, 6) : distance 28 px, à portée. */
const SOUTH_OF_TREE = { x: 240, y: 236 };

describe('R-RES-ELE-001 · Éléments récoltables', () => {
  const inspect = (id) => {
    const { game } = createTestGame({ map: { tiles: [[3, 3, id]] } });
    return game.inspect({ column: 3, row: 3 }).harvest;
  };

  it('ex.1 — un arbre se coupe et donne 1 bois et 2 branches', () => {
    assert.deepEqual(inspect('tree'), {
      action: 'cut',
      tool: 'axe',
      boostedBy: 'axe',
      resource: 'wood',
      amount: 1,
      extra: { resource: 'branch', amount: 2 },
      becomes: 'stump',
      regrowDays: 3,
    });
  });

  it('ex.2 — un rocher se pioche et donne 1 pierre', () => {
    assert.deepEqual(inspect('rock'), {
      action: 'mine',
      tool: 'pickaxe',
      boostedBy: 'pickaxe',
      resource: 'stone',
      amount: 1,
      becomes: 'grass',
    });
  });

  it('ex.3 — des fleurs se ramassent et donnent 1 fleur', () => {
    assert.deepEqual(inspect('flowers'), {
      action: 'pick',
      resource: 'flower',
      amount: 1,
      becomes: 'grass',
    });
  });

  it("ex.4 — l'herbe n'est pas récoltable", () => {
    assert.equal(inspect('grass'), undefined);
  });

  it("ex.5 — l'eau n'est pas récoltable", () => {
    assert.equal(inspect('water'), undefined);
  });
});

describe('R-RES-REC-001 · Portée de récolte', () => {
  it("ex.1 — le joueur juste au sud de l'arbre (distance 28) : récolte acceptée", () => {
    const { game } = withTreeAt76({ x: 240, y: 236 });

    assert.deepEqual(harvestAt(game, 7, 6), { ok: true });
  });

  it('ex.2 — à 48 px exactement : récolte acceptée', () => {
    const { game } = withTreeAt76({ x: 240, y: 256 });

    assert.deepEqual(harvestAt(game, 7, 6), { ok: true });
  });

  it('ex.3 — à 49 px : récolte refusée (OUT_OF_REACH)', () => {
    const { game } = withTreeAt76({ x: 240, y: 257 });

    assert.deepEqual(harvestAt(game, 7, 6), { ok: false, reason: 'OUT_OF_REACH' });
  });

  it('ex.4 — en diagonale, en (270, 240) (≈ 43,9 px) : récolte acceptée', () => {
    const { game } = withTreeAt76({ x: 270, y: 240 });

    assert.deepEqual(harvestAt(game, 7, 6), { ok: true });
  });
});

describe('R-RES-REC-002 · Gain de ressources', () => {
  it("ex.1 — 0 bois, récolte d'un arbre : 1 bois", () => {
    const { game, state } = withTreeAt76(SOUTH_OF_TREE);

    harvestAt(game, 7, 6);

    assert.equal(state.inventory.wood, 1);
  });

  it("ex.2 — 3 bois, récolte d'un autre arbre : 4 bois", () => {
    const { game, state } = withTreeAt76(SOUTH_OF_TREE, {
      inventory: { wood: 3, stone: 0, flower: 0 },
    });

    harvestAt(game, 7, 6);

    assert.equal(state.inventory.wood, 4);
  });

  it("ex.3 — 3 bois et 0 pierre, récolte d'un rocher : 3 bois et 1 pierre", () => {
    const { game, state } = createTestGame({
      map: { rocks: [[7, 6]] },
      player: { position: SOUTH_OF_TREE },
      inventory: { wood: 3, stone: 0, flower: 0 },
    });

    harvestAt(game, 7, 6);

    assert.deepEqual([state.inventory.wood, state.inventory.stone], [3, 1]);
  });
});

describe('R-RES-REC-003 · Après la récolte', () => {
  const harvestTileOfType = (id) => {
    const { game, state } = createTestGame({
      map: { tiles: [[7, 6, id]] },
      player: { position: SOUTH_OF_TREE },
    });
    harvestAt(game, 7, 6);
    return { id: state.map.tileIdAt(7, 6), isBlocking: state.map.isBlocking(7, 6) };
  };

  it('ex.1 — un arbre récolté devient une souche franchissable', () => {
    assert.deepEqual(harvestTileOfType('tree'), { id: 'stump', isBlocking: false });
  });

  it("ex.2 — un rocher récolté laisse place à de l'herbe franchissable", () => {
    assert.deepEqual(harvestTileOfType('rock'), { id: 'grass', isBlocking: false });
  });

  it("ex.3 — des fleurs récoltées laissent place à de l'herbe", () => {
    assert.equal(harvestTileOfType('flowers').id, 'grass');
  });

  it("ex.4 — une souche n'est pas récoltable", () => {
    const { game } = createTestGame({
      map: { tiles: [[7, 6, 'stump']] },
      player: { position: SOUTH_OF_TREE },
    });

    assert.deepEqual(harvestAt(game, 7, 6), { ok: false, reason: 'NOTHING_TO_HARVEST' });
  });
});

describe("R-RES-REC-004 · Refus d'une récolte", () => {
  it("ex.1 — de l'herbe à portée : NOTHING_TO_HARVEST", () => {
    const { game } = createTestGame({ player: { position: SOUTH_OF_TREE } });

    assert.deepEqual(harvestAt(game, 7, 6), { ok: false, reason: 'NOTHING_TO_HARVEST' });
  });

  it('ex.2 — la tuile (−1, 0), hors de la carte : NOTHING_TO_HARVEST', () => {
    const { game } = createTestGame({ player: { position: { x: 10, y: 20 } } });

    assert.deepEqual(harvestAt(game, -1, 0), { ok: false, reason: 'NOTHING_TO_HARVEST' });
  });

  it("ex.3 — un arbre hors de portée : OUT_OF_REACH, l'arbre reste et l'inventaire ne change pas", () => {
    const { game, state } = withTreeAt76({ x: 600, y: 600 });

    const result = harvestAt(game, 7, 6);

    assert.deepEqual(result, { ok: false, reason: 'OUT_OF_REACH' });
    assert.equal(state.map.tileIdAt(7, 6), 'tree');
    assert.equal(state.inventory.wood, 0);
  });

  it("ex.4 — de l'eau hors de portée : NOTHING_TO_HARVEST (premier motif)", () => {
    const { game } = createTestGame({
      map: { tiles: [[7, 6, 'water']] },
      player: { position: { x: 600, y: 600 } },
    });

    assert.deepEqual(harvestAt(game, 7, 6), { ok: false, reason: 'NOTHING_TO_HARVEST' });
  });
});

describe('R-INV-RES-001 · Inventaire de départ', () => {
  it('ex.1 — une nouvelle partie commence avec 0 de chaque ressource', () => {
    assert.deepEqual(Game.create().getState().inventory, {
      wood: 0,
      stone: 0,
      flower: 0,
      flint: 0,
      branch: 0,
      fiber: 0,
      berry: 0,
      mushroom: 0,
      'grilled-mushroom': 0,
      sage: 0,
    });
  });
});
