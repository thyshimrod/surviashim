// Les paramètres de data/ doivent être identiques à la partie C de la spécification.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { GAME_PARAMETERS } from '../../data/gameParameters.js';
import { parseParameters } from '../../tools/specParser.js';

const specification = readFileSync(new URL('../../docs/SPECIFICATION.md', import.meta.url), 'utf8');
const specParameters = parseParameters(specification);

describe('data/gameParameters.js', () => {
  it('contient exactement les paramètres non supprimés de la spécification (partie C)', () => {
    assert.deepEqual(Object.keys(GAME_PARAMETERS).sort(), Object.keys(specParameters).sort());
  });

  for (const [name, expected] of Object.entries(specParameters)) {
    it(`${name} vaut la valeur de la spécification`, () => {
      assert.deepEqual(GAME_PARAMETERS[name], expected);
    });
  }

  it('est gelé, y compris les points et les listes', () => {
    assert.equal(Object.isFrozen(GAME_PARAMETERS), true);
    assert.equal(Object.isFrozen(GAME_PARAMETERS.PLAYER_START_TILE), true);
    assert.equal(Object.isFrozen(GAME_PARAMETERS.WALK_FRAME_SEQUENCE), true);
  });

  it('a des valeurs cohérentes', () => {
    for (const name of [
      'TICK_RATE',
      'TILE_SIZE',
      'MAP_WIDTH',
      'MAP_HEIGHT',
      'HARVEST_REACH',
      'TREE_WOOD_YIELD',
      'ROCK_STONE_YIELD',
      'FLOWERS_YIELD',
      'WALK_FRAME_TICKS',
      'PLAYER_HITBOX_WIDTH',
      'PLAYER_HITBOX_HEIGHT',
    ]) {
      assert.ok(Number.isInteger(GAME_PARAMETERS[name]) && GAME_PARAMETERS[name] > 0, name);
    }
    assert.ok(GAME_PARAMETERS.PLAYER_WALK_SPEED > 0);
    assert.ok(
      GAME_PARAMETERS.PLAYER_WALK_SPEED < GAME_PARAMETERS.TILE_SIZE,
      'pas de traversée de tuile en un tick',
    );
  });
});
