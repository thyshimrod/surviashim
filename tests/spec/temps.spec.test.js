import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { placeItem, rekindle } from '../../src/core/commands/commands.js';
import { Game } from '../../src/core/Game.js';
import { darknessAt } from '../../src/core/systems/time.js';
import { clockLabel } from '../../src/presentation/ui/clockLabel.js';
import { craftView } from '../../src/presentation/ui/craftView.js';
import { InspectionController } from '../../src/presentation/ui/InspectionController.js';
import { inventoryView } from '../../src/presentation/ui/inventoryView.js';
import { nightView } from '../../src/presentation/ui/nightView.js';
import { WindowsController } from '../../src/presentation/ui/WindowsController.js';
import { at, craftAt, createTestGame, walk, harvestAt } from '../helpers/testGame.js';

/** Le joueur au centre de la tuile (10, 10), orienté à droite : la tuile devant est (11, 10). */
const CENTER_10_10 = { x: 336, y: 336 };

/** Partie où le joueur se tient en (10, 10), avec des tuiles et des options au choix. */
function standing({ tiles = [], facing = 'right', ...options } = {}) {
  return createTestGame({
    map: { tiles },
    player: { position: CENTER_10_10, facing },
    ...options,
  });
}

/** Un feu de camp en (11, 10), juste devant le joueur, qui brûle jusqu'à l'heure donnée. */
function withCampfire(burnsUntil, options = {}) {
  return standing({
    tiles: [[11, 10, 'campfire']],
    campfires: [{ column: 11, row: 10, burnsUntil }],
    ...options,
  });
}

describe('R-MON-TPS-001 · Horloge du monde', () => {
  it('ex.1 — une nouvelle partie : jour 1, 6:00', () => {
    assert.deepEqual(Game.create().time(), { day: 1, minute: 360 });
  });

  it('ex.2 — 36 ticks après 6:00 : 6:01', () => {
    const { game } = createTestGame({ clock: at(1, '6:00') });

    game.advanceTicks(36);

    assert.deepEqual(game.time(), { day: 1, minute: 361 });
  });

  it('ex.3 — 36 ticks après 23:59 : jour 2, 0:00', () => {
    const { game } = createTestGame({ clock: at(1, '23:59') });

    game.advanceTicks(36);

    assert.deepEqual(game.time(), { day: 2, minute: 0 });
  });

  it('ex.4 — 43 200 ticks après 6:00 : jour 2, 2:00', () => {
    const { game } = createTestGame({ clock: at(1, '6:00') });

    game.advanceTicks(43_200);

    assert.deepEqual(game.time(), { day: 2, minute: 120 });
  });
});

describe('R-MON-TPS-002 · Obscurité', () => {
  const darkness = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return darknessAt(hours * 60 + minutes, createTestGame().game.rules);
  };

  it('ex.1 — 12:00 : 0', () => {
    assert.equal(darkness('12:00'), 0);
  });

  it('ex.2 — 19:30 : 0,4', () => {
    assert.ok(Math.abs(darkness('19:30') - 0.4) < 1e-9);
  });

  it('ex.3 — 23:00 : 0,8', () => {
    assert.equal(darkness('23:00'), 0.8);
  });

  it('ex.4 — 5:00 : 0,4', () => {
    assert.ok(Math.abs(darkness('5:00') - 0.4) < 1e-9);
  });
});

describe('R-IHM-HOR-001 · Horloge au bandeau', () => {
  it('ex.1 — une nouvelle partie : « Jour 1 · 6:00 »', () => {
    assert.equal(clockLabel(Game.create().time()), 'Jour 1 · 6:00');
  });

  it('ex.2 — jour 1 à 6:07 : « Jour 1 · 6:00 »', () => {
    assert.equal(clockLabel({ day: 1, minute: 367 }), 'Jour 1 · 6:00');
  });

  it('ex.3 — jour 2 à 14:35 : « Jour 2 · 14:30 »', () => {
    assert.equal(clockLabel({ day: 2, minute: 875 }), 'Jour 2 · 14:30');
  });
});

describe("R-IHM-NUI-001 · La nuit à l'écran", () => {
  it('ex.1 — 12:00 : pas de voile', () => {
    assert.equal(nightView(standing({ clock: at(1, '12:00') }).game).opacity, 0);
  });

  it('ex.2 — 23:00, aucun feu : voile de 0,8, un halo de 96 px autour du héros', () => {
    const view = nightView(standing({ clock: at(1, '23:00') }).game);

    assert.equal(view.opacity, 0.8);
    assert.deepEqual(view.lights, [{ ...CENTER_10_10, radius: 96 }]);
  });

  it('ex.3 — 23:00, un feu allumé en (11, 10) : deux halos', () => {
    const view = nightView(withCampfire(at(2, '2:00'), { clock: at(1, '23:00') }).game);

    assert.deepEqual(view.lights, [
      { ...CENTER_10_10, radius: 96 },
      { x: 368, y: 336, radius: 192 },
    ]);
  });

  it('ex.4 — 23:00, un feu éteint : un seul halo', () => {
    const view = nightView(withCampfire(at(1, '22:00'), { clock: at(1, '23:00') }).game);

    assert.equal(view.lights.length, 1);
  });
});

describe('R-IHM-INS-008 · Désigner un feu de camp', () => {
  const open = (burnsUntil, options) => {
    const { game, state } = withCampfire(burnsUntil, options);
    const controller = new InspectionController();
    controller.designate({ column: 11, row: 10 }, game);
    return { game, state, controller };
  };

  it('ex.1 — allumé, 8 h restantes, 3 bois : « Allumé, encore 8 h », bouton actif', () => {
    const { game, controller } = open(at(1, '18:00'), {
      clock: at(1, '10:00'),
      inventory: { wood: 3 },
    });
    const view = controller.view(game);

    assert.deepEqual(
      [view.title, view.action, view.button, view.isActionEnabled],
      ['Feu de camp', 'Allumé, encore 8 h', 'Raviver : 1 bois', true],
    );
  });

  it('ex.2 — éteint, 0 bois : « Éteint », bouton inactif, « Il faut 1 bois »', () => {
    const { game, controller } = open(at(1, '9:00'), { clock: at(1, '10:00') });
    const view = controller.view(game);

    assert.deepEqual(
      [view.action, view.isActionEnabled, view.warning],
      ['Éteint', false, 'Il faut 1 bois'],
    );
  });

  it('ex.3 — éteint, 1 bois, clic sur « Raviver » : allumé pour 10 h, 0 bois', () => {
    const { game, state, controller } = open(at(1, '9:00'), {
      clock: at(1, '10:00'),
      inventory: { wood: 1 },
    });

    controller.confirm(game);

    assert.equal(controller.view(game).action, 'Allumé, encore 10 h');
    assert.equal(state.inventory.wood, 0);
  });
});

describe("R-IHM-INV-001 · Fenêtre d'inventaire", () => {
  it('ex.6 — 2 feux de camp : « Feu de camp ×2 » et « Poser »', () => {
    const [entry] = inventoryView(standing({ placeables: { campfire: 2 } }).state).placeables;

    assert.deepEqual([entry.label, entry.button], ['Feu de camp ×2', 'Poser']);
  });

  it('ex.7 — clic sur « Poser » : le feu est posé, la fenêtre fermée', () => {
    const { game, state } = standing({ placeables: { campfire: 1 } });
    const windows = new WindowsController();
    windows.toggle('inventory');

    windows.place('campfire', game);

    assert.equal(state.map.tileIdAt(11, 10), 'campfire');
    assert.equal(windows.open, undefined);
  });
});

describe("R-IHM-ART-001 · Fenêtre d'artisanat", () => {
  it('ex.5 — le feu de camp connu, 3 pierres et 2 bois : bouton actif', () => {
    const { game } = createTestGame({
      knownRecipes: ['campfire'],
      inventory: { stone: 3, wood: 2 },
    });
    const [entry] = craftView(game).entries;

    assert.deepEqual(
      [entry.name, entry.ingredients, entry.isEnabled],
      ['Feu de camp', 'Pierre 3/3 · Bois 2/2', true],
    );
  });
});

describe('R-ART-FAB-001 · Fabriquer', () => {
  it("ex.3 — de l'herbe en (11, 10) : 0 pierre, 1 bois, un feu allumé en (11, 10)", () => {
    const { game, state } = standing({
      knownRecipes: ['campfire'],
      inventory: { stone: 3, wood: 3 },
    });

    assert.deepEqual(craftAt(game, 'campfire'), { ok: true });
    assert.deepEqual([state.inventory.stone, state.inventory.wood], [0, 1]);
    assert.equal(state.map.tileIdAt(11, 10), 'campfire');
    assert.equal(game.inspect({ column: 11, row: 10 }).campfire.isLit, true);
    assert.equal(state.placeables.campfire ?? 0, 0);
  });
});

describe('R-INV-POS-001 · Objets à poser', () => {
  it('ex.1 — une nouvelle partie : aucun objet à poser', () => {
    assert.deepEqual(Game.create().getState().placeables, {});
  });

  it('ex.2 — 2 feux de camp, il en pose un : il en reste 1', () => {
    const { game, state } = standing({ placeables: { campfire: 2 } });

    game.execute(placeItem('campfire'));

    assert.equal(state.placeables.campfire, 1);
  });
});

describe('R-ART-POS-001 · Poser un objet', () => {
  it("ex.1 — orienté à droite, de l'herbe en (11, 10) : un feu allumé, infranchissable", () => {
    const { game, state } = standing({ placeables: { campfire: 1 }, clock: at(1, '20:00') });

    assert.deepEqual(game.execute(placeItem('campfire')), { ok: true });
    assert.equal(state.map.tileIdAt(11, 10), 'campfire');
    assert.equal(state.map.isBlocking(11, 10), true);
    assert.deepEqual(state.campfires, [{ column: 11, row: 10, burnsUntil: at(2, '6:00') }]);
    assert.equal(state.placeables.campfire ?? 0, 0);
  });

  it('ex.2 — orienté vers le haut, un arbre en (10, 9) : refus CANNOT_PLACE', () => {
    const { game } = standing({
      placeables: { campfire: 1 },
      facing: 'up',
      tiles: [[10, 9, 'tree']],
    });

    assert.deepEqual(game.execute(placeItem('campfire')), { ok: false, reason: 'CANNOT_PLACE' });
  });

  it('ex.3 — aucun feu à poser : refus NOTHING_TO_PLACE', () => {
    const { game } = standing();

    assert.deepEqual(game.execute(placeItem('campfire')), {
      ok: false,
      reason: 'NOTHING_TO_PLACE',
    });
  });

  it("ex.4 — de l'eau en (11, 10) : refus CANNOT_PLACE", () => {
    const { game } = standing({ placeables: { campfire: 1 }, tiles: [[11, 10, 'water']] });

    assert.deepEqual(game.execute(placeItem('campfire')), { ok: false, reason: 'CANNOT_PLACE' });
  });
});

describe('R-ART-FEU-001 · Feu de camp', () => {
  const posedAt20 = () => {
    const result = standing({ placeables: { campfire: 1 }, clock: at(1, '20:00') });
    result.game.execute(placeItem('campfire'));
    return result;
  };
  const isLit = (game) => nightView(game).lights.length === 2;

  it('ex.1 — posé à 20:00 : allumé le jour 2 à 5:59', () => {
    const { game } = posedAt20();

    game.advanceTicks(at(2, '5:59') - at(1, '20:00'));

    assert.equal(game.inspect({ column: 11, row: 10 }).campfire?.isLit, true);
  });

  it('ex.2 — posé à 20:00 : éteint le jour 2 à 6:00', () => {
    const { game } = posedAt20();

    game.advanceTicks(at(2, '6:00') - at(1, '20:00'));

    assert.equal(game.inspect({ column: 11, row: 10 }).campfire?.isLit, false);
    assert.equal(isLit(game), false);
  });

  it("ex.3 — éteint, 1 bois, ravivé à 7:00 : allumé jusqu'à 17:00, 0 bois", () => {
    const { game, state } = withCampfire(at(1, '6:00'), {
      clock: at(1, '7:00'),
      inventory: { wood: 1 },
    });

    assert.deepEqual(game.execute(rekindle({ column: 11, row: 10 })), { ok: true });
    assert.equal(state.campfires[0].burnsUntil, at(1, '17:00'));
    assert.equal(state.inventory.wood, 0);
  });

  it('ex.4 — éteint, 0 bois : refus MISSING_INGREDIENTS', () => {
    const { game } = withCampfire(at(1, '6:00'), { clock: at(1, '7:00') });

    assert.deepEqual(game.execute(rekindle({ column: 11, row: 10 })), {
      ok: false,
      reason: 'MISSING_INGREDIENTS',
    });
  });

  it("ex.5 — de l'herbe : refus NOTHING_TO_REKINDLE", () => {
    const { game } = standing({ inventory: { wood: 1 } });

    assert.deepEqual(game.execute(rekindle({ column: 11, row: 10 })), {
      ok: false,
      reason: 'NOTHING_TO_REKINDLE',
    });
  });
});

describe('R-RES-REC-005 · Repousse des arbres', () => {
  /** Arbre en (11, 10) coupé le jour 1 à 10:00 par le joueur, juste à côté. */
  const cutAt10 = () => {
    // Sans faim ni santé : trois jours sans manger feraient s'évanouir le héros.
    const result = standing({ tiles: [[11, 10, 'tree']], clock: at(1, '10:00'), needs: false });
    harvestAt(result.game, 11, 10);
    return result;
  };

  it('ex.1 — jour 4 à 9:59 : toujours une souche', () => {
    const { game, state } = cutAt10();

    game.advanceTicks(at(4, '9:59') - at(1, '10:00'));

    assert.equal(state.map.tileIdAt(11, 10), 'stump');
  });

  it('ex.2 — jour 4 à 10:00 : de nouveau un arbre', () => {
    const { game, state } = cutAt10();

    game.advanceTicks(at(4, '10:00') - at(1, '10:00'));

    assert.equal(state.map.tileIdAt(11, 10), 'tree');
  });

  it('ex.3 — le joueur sur la souche : elle repousse dès qu’il en descend', () => {
    const { game, state } = cutAt10();
    walk(game, 'droite', 11); // sur la souche (11, 10)
    walk(game, 'aucune', 0);
    game.advanceTicks(at(4, '10:00') - at(1, '10:00'));
    assert.equal(state.map.tileIdAt(11, 10), 'stump');

    walk(game, 'gauche', 30);

    assert.equal(state.map.tileIdAt(11, 10), 'tree');
  });
});
