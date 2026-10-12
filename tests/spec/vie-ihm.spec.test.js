import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createSaveStore } from '../../src/app/saveStore.js';
import { Game } from '../../src/core/Game.js';
import { InspectionController } from '../../src/presentation/ui/InspectionController.js';
import { vitalEntries } from '../../src/presentation/ui/inventoryEntries.js';
import { inventoryView } from '../../src/presentation/ui/inventoryView.js';
import { gameMenuView } from '../../src/presentation/ui/gameMenuView.js';
import { toolbarView } from '../../src/presentation/ui/toolbarView.js';
import { WindowsController } from '../../src/presentation/ui/WindowsController.js';
import { at, createTestGame } from '../helpers/testGame.js';

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

describe('R-IHM-HUD-003 · Santé et faim au bandeau', () => {
  const labels = (state) => vitalEntries(state).map(({ label, amount }) => `${label} ${amount}`);

  it('ex.1 — une nouvelle partie : « PV 100 », « Faim 100 », « Énergie 100 »', () => {
    assert.deepEqual(labels(Game.create().getState()), ['PV 100', 'Faim 100', 'Énergie 100']);
  });

  it('ex.2 — 45 PV, faim 12, énergie 7 : « PV 45 », « Faim 12 », « Énergie 7 »', () => {
    assert.deepEqual(labels({ health: 45, hunger: 12, energy: 7 }), [
      'PV 45',
      'Faim 12',
      'Énergie 7',
    ]);
  });
});

describe("R-IHM-INV-001 · Fenêtre d'inventaire", () => {
  const berries = (state) => inventoryView(state).resources.find(({ id }) => id === 'berry');

  it('ex.8 — 2 baies, faim 50, clic sur « Manger » : faim 60, « Baies 1 », fenêtre ouverte', () => {
    const { game, state } = createTestGame({ hunger: 50, inventory: { berry: 2 } });
    const windows = new WindowsController();
    windows.toggle('inventory');

    windows.eat('berry', game);

    assert.equal(state.hunger, 60);
    assert.equal(berries(state).amount, 1);
    assert.equal(windows.open, 'inventory');
  });

  it('ex.9 — 2 baies, faim 100 : bouton « Manger » inactif', () => {
    const { state } = createTestGame({ hunger: 100, inventory: { berry: 2 } });

    assert.deepEqual(berries(state).eat, { button: 'Manger', isEnabled: false });
  });
});

describe('R-IHM-INS-008 · Désigner un feu de camp', () => {
  const open = (clock) => {
    const { game } = besideFire({ clock });
    const controller = new InspectionController();
    controller.designate({ column: 11, row: 10 }, game);
    return { game, controller };
  };

  it('ex.4 — 12:00 : « Dormir » inactif, « Trop tôt pour dormir (dès 18:00) »', () => {
    const { game, controller } = open(at(1, '12:00'));

    assert.deepEqual(controller.view(game).sleep, {
      button: 'Dormir',
      isEnabled: false,
      warning: 'Trop tôt pour dormir (dès 18:00)',
    });
  });

  it('ex.5 — 22:00, clic sur « Dormir » : réveil le lendemain à 6:00, fenêtre fermée', () => {
    const { game, controller } = open(at(1, '22:00'));

    controller.sleep(game);

    assert.deepEqual(game.time(), { day: 2, minute: 360 });
    assert.equal(controller.isOpen, false);
  });
});

describe('R-IHM-SAU-001 · Fenêtre « Partie »', () => {
  it("ex.1 — aucune sauvegarde : « Pas encore de sauvegarde : dormez près d'un feu. »", () => {
    assert.equal(
      gameMenuView({ savedDay: undefined, confirming: false }).status,
      "Pas encore de sauvegarde : dormez près d'un feu.",
    );
  });

  it('ex.2 — sauvegardée au réveil du jour 3', () => {
    assert.equal(
      gameMenuView({ savedDay: 3, confirming: false }).status,
      'Sauvegardée au réveil du jour 3',
    );
  });

  it('ex.3 — clic sur « Nouvelle partie » : la confirmation, rien d’effacé', () => {
    const windows = new WindowsController();
    const storage = fakeStorage();
    const store = createSaveStore(storage);
    const { game } = besideFire({ clock: at(1, '22:00') });
    store.save(game);
    windows.toggle('game');

    windows.askNewGame();

    const view = gameMenuView({
      savedDay: store.savedDay(),
      confirming: windows.confirmingNewGame,
    });
    assert.equal(view.question, 'Tout recommencer ? La sauvegarde sera effacée.');
    assert.deepEqual(view.buttons, ['Recommencer', 'Annuler']);
    assert.notEqual(store.load(), undefined);
  });

  it('ex.4 — la confirmation, clic sur « Annuler » : retour au premier état', () => {
    const windows = new WindowsController();
    windows.toggle('game');
    windows.askNewGame();

    windows.cancelNewGame();

    const view = gameMenuView({ savedDay: undefined, confirming: windows.confirmingNewGame });
    assert.equal(view.question, undefined);
    assert.deepEqual(view.buttons, ['Nouvelle partie']);
  });
});

describe("R-IHM-BAR-001 · Barre d'actions", () => {
  it('ex.1 — survol, de haut en bas : Inventaire, Artisanat, Journal, Recherche, Partie', () => {
    assert.deepEqual(
      toolbarView(new WindowsController()).map((button) => button.label),
      ['Inventaire (I)', 'Artisanat (C)', 'Journal (J)', 'Recherche (R)', 'Partie'],
    );
  });
});
