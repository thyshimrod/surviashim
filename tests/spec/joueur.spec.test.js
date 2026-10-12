import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../../src/core/Game.js';
import { resolveDirection } from '../../src/core/utils/direction.js';
import { createTestGame, isCloseTo, walk } from '../helpers/testGame.js';

describe('R-JOU-DEP-001 · Directions de déplacement', () => {
  it('ex.1 — la touche droite donne la direction « droite »', () => {
    assert.deepEqual(resolveDirection({ right: true }), { dx: 1, dy: 0 });
  });

  it('ex.2 — les touches haut et droite donnent « haut-droite »', () => {
    assert.deepEqual(resolveDirection({ up: true, right: true }), { dx: 1, dy: -1 });
  });

  it("ex.3 — gauche et droite s'annulent", () => {
    assert.deepEqual(resolveDirection({ left: true, right: true }), { dx: 0, dy: 0 });
  });

  it('ex.4 — haut, gauche et droite donnent « haut »', () => {
    assert.deepEqual(resolveDirection({ up: true, left: true, right: true }), { dx: 0, dy: -1 });
  });

  it("ex.5 — sans touche, aucune direction n'est demandée", () => {
    assert.deepEqual(resolveDirection({}), { dx: 0, dy: 0 });
  });
});

describe('R-JOU-DEP-002 · Vitesse de marche', () => {
  it('ex.1 — 1 tick vers la droite mène de (100, 100) à (101,5 ; 100)', () => {
    const { game, state } = createTestGame();

    walk(game, 'droite', 1);

    assert.deepEqual(state.player.position, { x: 101.5, y: 100 });
  });

  it('ex.2 — 10 ticks vers le haut mènent de (100, 100) à (100, 85)', () => {
    const { game, state } = createTestGame();

    walk(game, 'haut', 10);

    assert.deepEqual(state.player.position, { x: 100, y: 85 });
  });

  it('ex.3 — sans direction demandée, le joueur ne bouge pas', () => {
    const { game, state } = createTestGame();

    walk(game, 'aucune', 60);

    assert.deepEqual(state.player.position, { x: 100, y: 100 });
  });
});

describe('R-JOU-DEP-003 · Vitesse en diagonale', () => {
  it('ex.1 — 1 tick en bas-droite mène en (101,06 ; 101,06)', () => {
    const { game, state } = createTestGame();

    walk(game, 'bas-droite', 1);

    assert.ok(
      isCloseTo(state.player.position, { x: 101.06, y: 101.06 }),
      JSON.stringify(state.player.position),
    );
  });

  it('ex.2 — 100 ticks en haut-gauche depuis (200, 200) parcourent 150 px', () => {
    const { game, state } = createTestGame({ player: { position: { x: 200, y: 200 } } });

    walk(game, 'haut-gauche', 100);

    assert.ok(
      isCloseTo(state.player.position, { x: 93.93, y: 93.93 }),
      JSON.stringify(state.player.position),
    );
    assert.ok(
      Math.abs(Math.hypot(200 - state.player.position.x, 200 - state.player.position.y) - 150) <
        0.01,
    );
  });
});

describe('R-JOU-ORI-001 · Orientation du joueur', () => {
  it('ex.1 — orienté vers le bas, il marche à gauche : orienté vers la gauche', () => {
    const { game, state } = createTestGame({ player: { facing: 'down' } });

    walk(game, 'gauche', 1);

    assert.equal(state.player.facing, 'left');
  });

  it('ex.2 — orienté vers le haut, en haut-droite : reste orienté vers le haut', () => {
    const { game, state } = createTestGame({ player: { facing: 'up' } });

    walk(game, 'haut-droite', 1);

    assert.equal(state.player.facing, 'up');
  });

  it('ex.3 — orienté vers le bas, en haut-droite : orienté vers la droite', () => {
    const { game, state } = createTestGame({ player: { facing: 'down' } });

    walk(game, 'haut-droite', 1);

    assert.equal(state.player.facing, 'right');
  });

  it("ex.4 — orienté vers la gauche, il s'arrête : reste orienté vers la gauche", () => {
    const { game, state } = createTestGame({ player: { facing: 'down' } });
    walk(game, 'gauche', 5);

    walk(game, 'aucune', 5);

    assert.equal(state.player.facing, 'left');
  });

  it("ex.5 — au début d'une nouvelle partie, le joueur est orienté vers le bas", () => {
    const game = Game.create();

    assert.equal(game.getState().player.facing, 'down');
  });
});
