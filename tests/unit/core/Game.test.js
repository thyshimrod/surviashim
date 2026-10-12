import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { GAME_PARAMETERS } from '../../../data/gameParameters.js';
import { setMoveIntent } from '../../../src/core/commands/commands.js';
import { Game } from '../../../src/core/Game.js';
import { createInitialState } from '../../../src/core/state/createInitialState.js';
import { moveAlongAxis } from '../../../src/core/utils/collision.js';
import { createTestGame, makeMap } from '../../helpers/testGame.js';

describe('Game', () => {
  it('accepte une direction demandée et compte les ticks', () => {
    const { game, state } = createTestGame();

    const result = game.execute(setMoveIntent({ dx: 1, dy: 0 }));
    game.advanceTicks(3);

    assert.deepEqual(result, { ok: true });
    assert.equal(state.tick, 3);
  });

  it('refuse un type de commande inconnu', () => {
    const { game } = createTestGame();

    assert.throws(
      () => game.execute(/** @type {any} */ ({ type: 'FLY' })),
      /Unknown command type "FLY"/,
    );
  });

  it('crée une partie standard avec les paramètres de la spécification', () => {
    const game = Game.create();

    assert.equal(game.rules.walkSpeed, GAME_PARAMETERS.PLAYER_WALK_SPEED);
    assert.equal(game.getState().map.columns, GAME_PARAMETERS.MAP_WIDTH);
  });
});

describe('setMoveIntent', () => {
  it('refuse une composante autre que -1, 0 ou 1', () => {
    assert.throws(() => setMoveIntent({ dx: 2, dy: 0 }), RangeError);
    assert.throws(() => setMoveIntent({ dx: 0, dy: 0.5 }), RangeError);
  });
});

describe('createInitialState', () => {
  it("refuse une carte qui n'a pas la taille des paramètres", () => {
    assert.throws(
      () => createInitialState(GAME_PARAMETERS, { map: { id: 'mini', rows: ['..'] } }),
      /Map "mini" is 2x1 tiles/,
    );
  });

  it('refuse une tuile de départ infranchissable', () => {
    const parameters = {
      ...GAME_PARAMETERS,
      MAP_WIDTH: 2,
      MAP_HEIGHT: 1,
      PLAYER_START_TILE: { x: 1, y: 0 },
    };

    assert.throws(
      () => createInitialState(parameters, { map: { id: 'mini', rows: ['.o'] } }),
      /is blocking/,
    );
  });
});

describe('moveAlongAxis', () => {
  it('ne fait pas reculer une boîte qui chevauche déjà un obstacle', () => {
    const map = makeMap({ rocks: [[1, 1]] });
    const position = { x: 40, y: 50 };
    const size = { width: 20, height: 12 };

    assert.equal(moveAlongAxis({ map, position, size, axis: 'x', delta: 3 }), 40);
    assert.equal(moveAlongAxis({ map, position, size, axis: 'y', delta: -3 }), 50);
  });
});
