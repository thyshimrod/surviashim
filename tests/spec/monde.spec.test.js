import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { GAME_PARAMETERS } from '../../data/gameParameters.js';
import { createInitialState } from '../../src/core/state/createInitialState.js';
import { createTestGame, isCloseTo, makeMap, walk } from '../helpers/testGame.js';

const ROCK = [7, 6];
const ROCK_COLUMN = Array.from({ length: 30 }, (_, row) => [7, row]);

describe('R-MON-CAR-001 · Carte de la clairière', () => {
  const map = makeMap({ columns: 40, rows: 30, tileSize: 32 });

  it('ex.1 — une carte de 40 × 30 tuiles de 32 px fait 1280 × 960 px', () => {
    assert.deepEqual({ width: map.widthPx, height: map.heightPx }, { width: 1280, height: 960 });
  });

  it('ex.2 — le point (70, 5) est dans la tuile (2, 0)', () => {
    assert.deepEqual(map.tileAt({ x: 70, y: 5 }), { column: 2, row: 0 });
  });

  it('ex.3 — le point (32, 32) est dans la tuile (1, 1)', () => {
    assert.deepEqual(map.tileAt({ x: 32, y: 32 }), { column: 1, row: 1 });
  });

  it("ex.4 — le point (1280, 10) n'est dans aucune tuile", () => {
    assert.equal(map.tileAt({ x: 1280, y: 10 }), undefined);
  });
});

describe('R-MON-CAR-002 · Position de départ', () => {
  it('ex.1 — tuile de départ (20, 15) : une nouvelle partie place le joueur en (656, 496)', () => {
    const parameters = {
      ...GAME_PARAMETERS,
      MAP_WIDTH: 40,
      MAP_HEIGHT: 30,
      PLAYER_START_TILE: { x: 20, y: 15 },
    };
    const map = { id: 'test', rows: Array.from({ length: 30 }, () => '.'.repeat(40)) };

    const state = createInitialState(parameters, { map, npcs: {} });

    assert.deepEqual(state.player.position, { x: 656, y: 496 });
  });
});

describe('R-MON-CAR-003 · Bords de la carte', () => {
  it('ex.1 — depuis (11, 100), 1 tick à gauche mène en (10, 100), contre le bord', () => {
    const { game, state } = createTestGame({ player: { position: { x: 11, y: 100 } } });

    walk(game, 'gauche', 1);

    assert.deepEqual(state.player.position, { x: 10, y: 100 });
  });

  it('ex.2 — en (10, 100), 10 ticks à gauche ne le font pas bouger', () => {
    const { game, state } = createTestGame({ player: { position: { x: 10, y: 100 } } });

    walk(game, 'gauche', 10);

    assert.deepEqual(state.player.position, { x: 10, y: 100 });
  });

  it('ex.3 — depuis (100, 959), 1 tick vers le bas mène en (100, 960)', () => {
    const { game, state } = createTestGame({ player: { position: { x: 100, y: 959 } } });

    walk(game, 'bas', 1);

    assert.deepEqual(state.player.position, { x: 100, y: 960 });
  });
});

describe('R-MON-COL-001 · Tuiles infranchissables', () => {
  const withRock = (position) => createTestGame({ map: { rocks: [ROCK] }, player: { position } });

  it('ex.1 — 1 tick à droite depuis (212, 210) mène en (213,5 ; 210)', () => {
    const { game, state } = withRock({ x: 212, y: 210 });

    walk(game, 'droite', 1);

    assert.deepEqual(state.player.position, { x: 213.5, y: 210 });
  });

  it('ex.2 — 2 ticks à droite : arrêt au contact du rocher, en (214, 210)', () => {
    const { game, state } = withRock({ x: 212, y: 210 });

    walk(game, 'droite', 2);

    assert.deepEqual(state.player.position, { x: 214, y: 210 });
  });

  it('ex.3 — contre le rocher, 10 ticks à droite ne le font pas bouger', () => {
    const { game, state } = withRock({ x: 214, y: 210 });

    walk(game, 'droite', 10);

    assert.deepEqual(state.player.position, { x: 214, y: 210 });
  });

  it('ex.4 — en (212, 190), sa boîte passe au-dessus du rocher : il arrive en (227, 190)', () => {
    const { game, state } = withRock({ x: 212, y: 190 });

    walk(game, 'droite', 10);

    assert.deepEqual(state.player.position, { x: 227, y: 190 });
  });
});

describe("R-MON-COL-002 · Glissement le long d'un obstacle", () => {
  it('ex.1 — contre une colonne de rochers, en haut-droite : il monte en (214 ; 208,94)', () => {
    const { game, state } = createTestGame({
      map: { rocks: ROCK_COLUMN },
      player: { position: { x: 214, y: 210 } },
    });

    walk(game, 'haut-droite', 1);

    assert.ok(
      isCloseTo(state.player.position, { x: 214, y: 208.94 }),
      JSON.stringify(state.player.position),
    );
  });

  it('ex.2 — contre le bord gauche, en bas-gauche : il descend en (10 ; 101,06)', () => {
    const { game, state } = createTestGame({ player: { position: { x: 10, y: 100 } } });

    walk(game, 'bas-gauche', 1);

    assert.ok(
      isCloseTo(state.player.position, { x: 10, y: 101.06 }),
      JSON.stringify(state.player.position),
    );
  });
});
