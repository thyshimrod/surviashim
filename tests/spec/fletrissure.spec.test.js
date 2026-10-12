import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { burnSage, rekindle, sleepBy } from '../../src/core/commands/commands.js';
import { GAME_EVENTS } from '../../src/core/events/gameEvents.js';
import { Game } from '../../src/core/Game.js';
import { isBlighted } from '../../src/core/systems/blight.js';
import { blightOverlay } from '../../src/presentation/ui/blightOverlay.js';
import { notificationsFor } from '../../src/presentation/ui/gameNotifications.js';
import { InspectionController } from '../../src/presentation/ui/InspectionController.js';
import { inventoryView } from '../../src/presentation/ui/inventoryView.js';
import { nightView } from '../../src/presentation/ui/nightView.js';
import { WindowsController } from '../../src/presentation/ui/WindowsController.js';
import { at, createTestGame, walk } from '../helpers/testGame.js';

/** Centre d'une tuile, en px. */
const center = (column, row) => ({ x: column * 32 + 16, y: row * 32 + 16 });
/** Indice d'une tuile dans la vallée (160 colonnes). */
const index = (column, row) => row * 160 + column;
/** Une tuile du Bois des Murmures, flétrie. */
const IN_WOOD = center(60, 20);
const HEARTH = { column: 32, row: 91 };

/** Partie dans la vallée en vraie grandeur (160 × 120), avec le Foyer à sa place. */
function inValley({ position, tiles = [], ...options } = {}) {
  return createTestGame({
    map: { columns: 160, rows: 120, tiles: [[HEARTH.column, HEARTH.row, 'hearth'], ...tiles] },
    player: { position },
    ...options,
  });
}

describe('R-JOU-ENE-001 · Énergie de départ', () => {
  it('ex.1 — une nouvelle partie : énergie 100', () => {
    assert.equal(Game.create().getState().energy, 100);
  });
});

describe("R-JOU-ENE-002 · La Flétrissure ronge l'énergie", () => {
  const after3 = (options) => {
    const { game, state } = inValley({ energy: 80, clock: at(1, '6:00'), ...options });
    game.advanceTicks(at(1, '6:03') - at(1, '6:00'));
    return state.energy;
  };

  it('ex.1 — dans le Bois des Murmures, à 6:03 : 79', () => {
    assert.equal(after3({ position: IN_WOOD }), 79);
  });

  it('ex.2 — au Vallon, la nuit : 80', () => {
    // Loin du Foyer, qui recharge l'énergie.
    const { game, state } = inValley({
      position: center(45, 95),
      energy: 80,
      clock: at(1, '23:00'),
    });

    game.advanceTicks(at(1, '23:03') - at(1, '23:00'));

    assert.equal(state.energy, 80);
  });

  it('ex.3 — sur une tuile purifiée du Bois : 80', () => {
    assert.equal(after3({ position: IN_WOOD, purified: [index(60, 20)] }), 80);
  });
});

describe('R-JOU-ENE-003 · Sans énergie', () => {
  const healthAt610 = (position) => {
    const { game, state } = inValley({
      position,
      energy: 0,
      health: 80,
      hunger: 90,
      clock: at(1, '6:01'),
    });
    game.advanceTicks(at(1, '6:10') - at(1, '6:01'));
    return state.health;
  };

  it('ex.1 — énergie 0, dans le Bois : 79 PV', () => {
    assert.equal(healthAt610(IN_WOOD), 79);
  });

  it('ex.2 — énergie 0, au Vallon : 81 PV', () => {
    assert.equal(healthAt610(center(34, 92)), 81);
  });
});

describe("R-JOU-ENE-004 · Recharger l'énergie", () => {
  const after2 = (position, energy = 40) => {
    const { game, state } = inValley({ position, energy, clock: at(1, '6:00') });
    game.advanceTicks(at(1, '6:02') - at(1, '6:00'));
    return state.energy;
  };

  it('ex.1 — à 2 tuiles du Foyer : 41', () => {
    assert.equal(after2(center(32, 93)), 41);
  });

  it('ex.2 — à 10 tuiles du Foyer : 40', () => {
    assert.equal(after2(center(42, 91)), 40);
  });

  it('ex.3 — énergie 100, près du Foyer : 100', () => {
    assert.equal(after2(center(32, 93), 100), 100);
  });
});

describe("R-JOU-VIE-004 · S'évanouir", () => {
  it('ex.2 — 1 PV, énergie 0, dans le Bois : réveil au départ, énergie 50', () => {
    const { game, state } = inValley({
      position: IN_WOOD,
      health: 1,
      energy: 0,
      clock: at(1, '6:01'),
    });

    game.advanceTicks(at(1, '6:10') - at(1, '6:01'));

    assert.deepEqual(state.player.position, game.rules.vitals.startPosition);
    assert.deepEqual(game.time(), { day: 2, minute: 360 });
    assert.equal(state.energy, 50);
  });
});

describe('R-JOU-SOM-001 · Dormir', () => {
  it('ex.5 — près du Foyer à 22:00, énergie 30 : le jour 2 à 6:00, énergie 100', () => {
    const { game, state } = inValley({
      position: center(32, 92),
      energy: 30,
      clock: at(1, '22:00'),
    });

    assert.deepEqual(game.execute(sleepBy(HEARTH)), { ok: true });
    assert.deepEqual(game.time(), { day: 2, minute: 360 });
    assert.equal(state.energy, 100);
  });
});

describe('R-MON-FOY-001 · Le Foyer', () => {
  it('ex.1 — une nouvelle partie : le Foyer en (32, 91), infranchissable', () => {
    const { map } = Game.create().getState();

    assert.equal(map.tileIdAt(32, 91), 'hearth');
    assert.equal(map.isBlocking(32, 91), true);
  });

  it('ex.2 — le raviver : refus NOTHING_TO_REKINDLE', () => {
    const { game } = inValley({ position: center(32, 92), inventory: { wood: 1 } });

    assert.deepEqual(game.execute(rekindle(HEARTH)), {
      ok: false,
      reason: 'NOTHING_TO_REKINDLE',
    });
  });

  it('ex.3 — le jour 9 à 23:00 : allumé', () => {
    const { game } = inValley({ position: center(34, 92), clock: at(9, '23:00') });

    assert.ok(nightView(game).lights.some(({ radius }) => radius === 320));
  });
});

describe('R-MEN-FLE-001 · Tuiles flétries', () => {
  const { game, state } = inValley({ position: center(34, 92) });
  const blighted = (column, row, purified = []) =>
    isBlighted({ ...state, purified }, game.rules, { column, row });

  it('ex.1 — une tuile du Bois des Murmures : flétrie', () => {
    assert.equal(blighted(60, 20), true);
  });

  it('ex.2 — une tuile du Vallon : saine', () => {
    assert.equal(blighted(34, 92), false);
  });

  it('ex.3 — une tuile du Bois purifiée : saine', () => {
    assert.equal(blighted(60, 20, [index(60, 20)]), false);
  });
});

describe('R-MEN-SAU-002 · Brûler la sauge', () => {
  /** Un feu de camp allumé en (50, 20), dans le Bois ; le joueur juste à l'ouest. */
  const byFire = ({ sage = 1, fire = true } = {}) =>
    inValley({
      position: center(49, 20),
      inventory: { sage },
      tiles: fire ? [[50, 20, 'campfire']] : [],
      campfires: fire ? [{ column: 50, row: 20, burnsUntil: at(9, '0:00') }] : [],
    });

  it('ex.1 — 1 sauge, un feu à portée : purifié à 5 tuiles, pas à 6 ; 0 sauge', () => {
    const { game, state } = byFire();

    assert.deepEqual(game.execute(burnSage()), { ok: true });
    const blighted = (column, row) => isBlighted(state, game.rules, { column, row });
    assert.deepEqual(
      [blighted(55, 20), blighted(50, 25), blighted(56, 20), state.inventory.sage],
      [false, false, true, 0],
    );
  });

  it('ex.2 — 0 sauge : refus NOTHING_TO_BURN', () => {
    const { game } = byFire({ sage: 0 });

    assert.deepEqual(game.execute(burnSage()), { ok: false, reason: 'NOTHING_TO_BURN' });
  });

  it('ex.3 — aucun feu à portée : refus NEEDS_FIRE, toujours 1 sauge', () => {
    const { game, state } = byFire({ fire: false });

    assert.deepEqual(game.execute(burnSage()), { ok: false, reason: 'NEEDS_FIRE' });
    assert.equal(state.inventory.sage, 1);
  });
});

describe('R-RES-ELE-001 · Éléments récoltables', () => {
  it("ex.8 — de la sauge de l'aube se ramasse et donne 1 sauge", () => {
    const { game } = createTestGame({ map: { tiles: [[3, 3, 'dawn-sage']] } });
    const { action, resource, amount } = game.inspect({ column: 3, row: 3 }).harvest;

    assert.deepEqual([action, resource, amount], ['pick', 'sage', 1]);
  });
});

describe("R-IHM-NUI-001 · La nuit à l'écran", () => {
  it('ex.5 — 23:00, le Foyer en (32, 91) : un halo de 320 px autour de (1040, 2928)', () => {
    const { game } = inValley({ position: center(34, 92), clock: at(1, '23:00') });

    assert.ok(
      nightView(game).lights.some(
        (light) => light.x === 1040 && light.y === 2928 && light.radius === 320,
      ),
    );
  });
});

describe("R-IHM-INV-001 · Fenêtre d'inventaire", () => {
  const sageEntry = (state, game) =>
    inventoryView(state, game.rules).resources.find(({ id }) => id === 'sage');

  it('ex.10 — 1 sauge, aucun feu : « Brûler » inactif', () => {
    const { game, state } = inValley({ position: center(34, 92), inventory: { sage: 1 } });

    assert.deepEqual(sageEntry(state, game).use, { button: 'Brûler', isEnabled: false });
  });

  it('ex.11 — 1 sauge, un feu à portée, clic sur « Brûler » : 0 sauge, fenêtre ouverte', () => {
    const { game, state } = inValley({ position: center(32, 92), inventory: { sage: 1 } });
    const windows = new WindowsController();
    windows.toggle('inventory');

    windows.use('sage', game);

    assert.equal(state.inventory.sage, 0);
    assert.equal(windows.open, 'inventory');
  });
});

describe('R-IHM-INS-009 · Désigner le Foyer', () => {
  const open = (clock) => {
    const { game } = inValley({ position: center(32, 92), clock });
    const controller = new InspectionController();
    controller.designate(HEARTH, game);
    return { game, controller };
  };

  it('ex.1 — 12:00 : « Le Foyer », « Dormir » inactif, trop tôt', () => {
    const { game, controller } = open(at(1, '12:00'));
    const view = controller.view(game);

    assert.deepEqual(
      [view.title, view.action, view.button, view.isActionEnabled, view.warning],
      [
        'Le Foyer',
        "Un feu ancien, qui ne s'éteint jamais.",
        'Dormir',
        false,
        'Trop tôt pour dormir (dès 18:00)',
      ],
    );
  });

  it('ex.2 — 22:00, clic sur « Dormir » : réveil à 6:00, fenêtre fermée', () => {
    const { game, controller } = open(at(1, '22:00'));

    controller.confirm(game);

    assert.deepEqual(game.time(), { day: 2, minute: 360 });
    assert.equal(controller.isOpen, false);
  });
});

describe("R-IHM-FLE-001 · Tuiles flétries à l'écran", () => {
  const VIEW = { left: 44 * 32, top: 10 * 32, right: 49 * 32, bottom: 13 * 32 };

  it('ex.1 — la lisière du Bois : seules les tuiles du Bois sont voilées', () => {
    const { game } = inValley({ position: center(34, 92) });
    const columns = new Set(blightOverlay(game, VIEW).map(({ column }) => column));

    assert.deepEqual(
      [...columns].sort((a, b) => a - b),
      [46, 47, 48],
    );
  });

  it('ex.2 — une tuile purifiée : pas voilée', () => {
    const { game } = inValley({ position: center(34, 92), purified: [index(46, 10)] });
    const tiles = blightOverlay(game, VIEW);

    assert.equal(
      tiles.some(({ column, row }) => column === 46 && row === 10),
      false,
    );
  });
});

describe('R-IHM-NOT-005 · Flétrissure et purification', () => {
  it('ex.1 — entrer dans le Bois : « La Flétrissure ronge votre énergie… »', () => {
    const { game } = inValley({ position: center(45, 20) });
    const messages = [];
    game.events.on(GAME_EVENTS.BLIGHT_ENTERED, (payload) =>
      messages.push(...notificationsFor(GAME_EVENTS.BLIGHT_ENTERED, payload)),
    );

    walk(game, 'droite', 12);

    assert.deepEqual(messages, [{ text: 'La Flétrissure ronge votre énergie…', sticky: false }]);
  });

  it('ex.2 — brûler la sauge : « La fumée de la sauge purifie la terre. »', () => {
    assert.deepEqual(notificationsFor(GAME_EVENTS.PURIFIED, { count: 80 }), [
      { text: 'La fumée de la sauge purifie la terre.', sticky: false },
    ]);
  });
});
