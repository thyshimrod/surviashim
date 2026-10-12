import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { startGame } from '../../src/app/startGame.js';
import { createSaveStore } from '../../src/app/saveStore.js';
import { eat, sleepBy, talkTo } from '../../src/core/commands/commands.js';
import { Game } from '../../src/core/Game.js';
import { at, createTestGame, harvestAt } from '../helpers/testGame.js';

/** Le joueur au centre de la tuile (10, 10), orienté à droite. */
const CENTER_10_10 = { x: 336, y: 336 };

/** Un feu de camp allumé en (11, 10), juste à côté du joueur. */
function besideFire({ lit = true, clock, ...options } = {}) {
  return createTestGame({
    map: { tiles: [[11, 10, 'campfire']] },
    player: { position: CENTER_10_10, facing: 'right' },
    campfires: [{ column: 11, row: 10, burnsUntil: lit ? at(9, '0:00') : 0 }],
    clock,
    ...options,
  });
}

/** Stockage du navigateur simulé. */
function fakeStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
  };
}

describe('R-JOU-VIE-001 · Santé et faim de départ', () => {
  it('ex.1 — une nouvelle partie : 100 PV, faim 100', () => {
    const state = Game.create().getState();

    assert.deepEqual([state.health, state.hunger], [100, 100]);
  });
});

describe('R-JOU-VIE-002 · La faim baisse', () => {
  const after = (hunger, time) => {
    const { game, state } = createTestGame({ hunger, clock: at(1, '6:00') });
    game.advanceTicks(at(1, time) - at(1, '6:00'));
    return state.hunger;
  };

  it('ex.1 — faim 80, à 6:29 : toujours 80', () => {
    assert.equal(after(80, '6:29'), 80);
  });

  it('ex.2 — faim 80, à 6:30 : 79', () => {
    assert.equal(after(80, '6:30'), 79);
  });

  it('ex.3 — faim 0, à 6:30 : toujours 0', () => {
    assert.equal(after(0, '6:30'), 0);
  });
});

describe('R-JOU-VIE-003 · Santé selon la faim', () => {
  const healthAfter10 = (health, hunger) => {
    const { game, state } = createTestGame({ health, hunger, clock: at(1, '6:01') });
    game.advanceTicks(at(1, '6:11') - at(1, '6:01'));
    return state.health;
  };

  it('ex.1 — 80 PV, faim 60 : 81 PV à 6:10', () => {
    const { game, state } = createTestGame({ health: 80, hunger: 60, clock: at(1, '6:00') });

    game.advanceTicks(at(1, '6:10') - at(1, '6:00'));

    assert.equal(state.health, 81);
  });

  it('ex.2 — 80 PV, faim 50 : 80 PV', () => {
    assert.equal(healthAfter10(80, 50), 80);
  });

  it('ex.3 — 80 PV, faim 0 : 79 PV', () => {
    assert.equal(healthAfter10(80, 0), 79);
  });

  it('ex.4 — 100 PV, faim 90 : 100 PV', () => {
    assert.equal(healthAfter10(100, 90), 100);
  });
});

describe("R-JOU-VIE-004 · S'évanouir", () => {
  it('ex.1 — 1 PV, faim 0, à 0:00 : réveil le jour 3 à 6:00 au départ, 50 PV, faim 50', () => {
    const { game, state } = createTestGame({
      health: 1,
      hunger: 0,
      clock: at(2, '23:55'),
      inventory: { wood: 5 },
    });

    game.advanceTicks(at(3, '0:00') - at(2, '23:55'));

    assert.deepEqual(game.time(), { day: 3, minute: 360 });
    assert.deepEqual(state.player.position, game.rules.vitals.startPosition);
    assert.deepEqual([state.health, state.hunger, state.inventory.wood], [50, 50, 5]);
  });
});

describe('R-JOU-MAN-001 · Manger', () => {
  it('ex.1 — faim 50, 2 baies, une baie : faim 60, 1 baie', () => {
    const { game, state } = createTestGame({ hunger: 50, inventory: { berry: 2 } });

    assert.deepEqual(game.execute(eat('berry')), { ok: true });
    assert.deepEqual([state.hunger, state.inventory.berry], [60, 1]);
  });

  it('ex.2 — faim 95, un champignon : faim 100', () => {
    const { game, state } = createTestGame({ hunger: 95, inventory: { mushroom: 1 } });

    game.execute(eat('mushroom'));

    assert.deepEqual([state.hunger, state.inventory.mushroom], [100, 0]);
  });

  it('ex.3 — du bois : refus NOT_EDIBLE', () => {
    const { game } = createTestGame({ hunger: 50, inventory: { wood: 3 } });

    assert.deepEqual(game.execute(eat('wood')), { ok: false, reason: 'NOT_EDIBLE' });
  });

  it('ex.4 — 0 baie : refus NOTHING_TO_EAT', () => {
    const { game } = createTestGame({ hunger: 50 });

    assert.deepEqual(game.execute(eat('berry')), { ok: false, reason: 'NOTHING_TO_EAT' });
  });

  it('ex.5 — faim 100 : refus ALREADY_FULL, toujours 2 baies', () => {
    const { game, state } = createTestGame({ hunger: 100, inventory: { berry: 2 } });

    assert.deepEqual(game.execute(eat('berry')), { ok: false, reason: 'ALREADY_FULL' });
    assert.equal(state.inventory.berry, 2);
  });
});

describe('R-JOU-SOM-001 · Dormir', () => {
  const FIRE = { column: 11, row: 10 };

  it('ex.1 — 22:00, 40 PV, faim 60 : le jour 2 à 6:00, 100 PV, faim 50', () => {
    const { game, state } = besideFire({ clock: at(1, '22:00'), health: 40, hunger: 60 });

    assert.deepEqual(game.execute(sleepBy(FIRE)), { ok: true });
    assert.deepEqual(game.time(), { day: 2, minute: 360 });
    assert.deepEqual([state.health, state.hunger], [100, 50]);
  });

  it('ex.2 — le jour 2 à 1:00 : réveil le jour 2 à 6:00', () => {
    const { game } = besideFire({ clock: at(2, '1:00') });

    game.execute(sleepBy(FIRE));

    assert.deepEqual(game.time(), { day: 2, minute: 360 });
  });

  it('ex.3 — 17:59 : refus TOO_EARLY', () => {
    const { game } = besideFire({ clock: at(1, '17:59') });

    assert.deepEqual(game.execute(sleepBy(FIRE)), { ok: false, reason: 'TOO_EARLY' });
  });

  it('ex.4 — un feu éteint : refus NOTHING_TO_SLEEP_BY', () => {
    const { game } = besideFire({ lit: false, clock: at(1, '22:00') });

    assert.deepEqual(game.execute(sleepBy(FIRE)), {
      ok: false,
      reason: 'NOTHING_TO_SLEEP_BY',
    });
  });
});

describe('R-RES-ELE-001 · Éléments récoltables', () => {
  const inspect = (id) =>
    createTestGame({ map: { tiles: [[3, 3, id]] } }).game.inspect({ column: 3, row: 3 }).harvest;

  it('ex.6 — un buisson à baies se ramasse et donne 3 baies', () => {
    const { action, resource, amount } = inspect('berry-bush');

    assert.deepEqual([action, resource, amount], ['pick', 'berry', 3]);
  });

  it('ex.7 — des champignons se ramassent et donnent 1 champignon', () => {
    const { action, resource, amount } = inspect('mushrooms');

    assert.deepEqual([action, resource, amount], ['pick', 'mushroom', 1]);
  });
});

describe('R-RES-REC-003 · Après la récolte', () => {
  it('ex.5 — un buisson à baies : buisson sans baies, infranchissable', () => {
    const { game, state } = createTestGame({
      map: { tiles: [[11, 10, 'berry-bush']] },
      player: { position: CENTER_10_10 },
    });

    harvestAt(game, 11, 10);

    assert.equal(state.map.tileIdAt(11, 10), 'bush');
    assert.equal(state.map.isBlocking(11, 10), true);
  });
});

describe('R-RES-REC-005 · Repousse des arbres', () => {
  it('ex.4 — un buisson cueilli le jour 1 à 8:00 : des baies le jour 3 à 8:00', () => {
    const { game, state } = createTestGame({
      map: { tiles: [[11, 10, 'berry-bush']] },
      player: { position: CENTER_10_10 },
      clock: at(1, '8:00'),
      hunger: 100,
      health: 100,
    });
    harvestAt(game, 11, 10);

    game.advanceTicks(at(3, '8:00') - at(1, '8:00'));

    assert.equal(state.map.tileIdAt(11, 10), 'berry-bush');
  });
});

describe('R-SAU-SAV-001 · Sauvegarde au réveil', () => {
  it('ex.1 — dormir puis relancer : la partie reprend, le jour 3 à 6:00, avec tout', () => {
    const storage = fakeStorage();
    const { game } = besideFire({
      clock: at(2, '22:00'),
      inventory: { wood: 5 },
      map: {
        tiles: [
          [11, 10, 'campfire'],
          [10, 11, 'tree'],
        ],
      },
    });
    const store = createSaveStore(storage);
    store.attach(game);
    harvestAt(game, 10, 11);
    game.execute(sleepBy({ column: 11, row: 10 }));

    const resumed = startGame({ store: createSaveStore(storage) });

    assert.deepEqual(resumed.time(), { day: 3, minute: 360 });
    assert.deepEqual(resumed.getState().inventory, game.getState().inventory);
    assert.equal(resumed.getState().map.tileIdAt(11, 10), 'campfire');
    assert.equal(resumed.getState().map.tileIdAt(10, 11), 'stump');
    assert.deepEqual(resumed.getState().regrowth, game.getState().regrowth);
    assert.deepEqual(resumed.getState().campfires, game.getState().campfires);
  });

  it('ex.2 — aucune sauvegarde : une nouvelle partie commence', () => {
    const game = startGame({ store: createSaveStore(fakeStorage()) });

    assert.deepEqual(game.time(), { day: 1, minute: 360 });
  });

  it('ex.3 — une sauvegarde illisible : une nouvelle partie commence', () => {
    const game = startGame({ store: createSaveStore(fakeStorage({ 'surshim-save': '{oups' })) });

    assert.deepEqual(game.time(), { day: 1, minute: 360 });
  });
});

describe('R-PNJ-POS-003 · Promenade', () => {
  const HOME = { x: 1232, y: 2896 };
  /** Aldric chez lui (tuile 38, 90), le joueur loin, sauf avis contraire. */
  const withAldric = ({ npc = {}, player = { x: 1232, y: 3200 }, clock = at(1, '6:00') } = {}) =>
    createTestGame({
      map: { columns: 160, rows: 120 },
      npcs: [{ id: 'aldric', position: { ...HOME }, ...npc }],
      player: { position: player },
      clock,
    });
  const WALKING = { pauseUntil: 0, step: 0 };

  it('ex.1 — 20 minutes après 6:00 : en marche vers (1296, 2896), tourné à droite', () => {
    const { game, state } = withAldric();

    game.advanceTicks(at(1, '6:20') - at(1, '6:00'));
    const [aldric] = state.npcs;

    assert.equal(aldric.isWalking, true);
    assert.equal(aldric.facing, 'right');
    assert.ok(aldric.position.x > HOME.x);
  });

  it('ex.2 — en marche, 64 ticks : en (1296, 2896), il attend', () => {
    const { game, state } = withAldric({ npc: WALKING });

    game.advanceTicks(64);
    const [aldric] = state.npcs;

    assert.deepEqual(aldric.position, { x: 1296, y: 2896 });
    assert.equal(aldric.isWalking, false);
  });

  it('ex.3 — en marche, un dialogue commence : il ne bouge pas', () => {
    const { game, state } = withAldric({ npc: WALKING, player: { x: 1232, y: 2936 } });
    game.execute(talkTo('aldric'));

    game.advanceTicks(30);

    assert.deepEqual(state.npcs[0].position, HOME);
  });

  it('ex.4 — le joueur sur son chemin : il s’arrête devant lui', () => {
    const { game, state } = withAldric({ npc: WALKING, player: { x: 1270, y: 2896 } });

    game.advanceTicks(64);

    assert.ok(state.npcs[0].position.x <= 1270 - 20);
  });
});
