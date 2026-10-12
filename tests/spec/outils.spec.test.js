import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { harvestTile, setMoveIntent } from '../../src/core/commands/commands.js';
import { craftView } from '../../src/presentation/ui/craftView.js';
import { harvestView } from '../../src/presentation/ui/harvestView.js';
import { InspectionController } from '../../src/presentation/ui/InspectionController.js';
import { inventoryView } from '../../src/presentation/ui/inventoryView.js';
import { craftAt, createTestGame } from '../helpers/testGame.js';

/** Juste au sud de la tuile (7, 6) : à portée. */
const SOUTH = { x: 240, y: 236 };
/** Le joueur au centre de la tuile (10, 10). */
const CENTER_10_10 = { x: 336, y: 336 };

/** Une tuile de ce type en (7, 6), le joueur juste au sud ; la récolte commencée. */
function startHarvest(tile, options = {}) {
  const { game, state } = createTestGame({
    map: { tiles: [[7, 6, tile]] },
    player: { position: SOUTH },
    ...options,
  });
  assert.deepEqual(game.execute(harvestTile({ column: 7, row: 6 })), { ok: true });
  return { game, state };
}

/** Fait passer ce nombre de ticks. */
function wait(game, ticks) {
  for (let tick = 0; tick < ticks; tick += 1) {
    game.update();
  }
}

describe('R-RES-REC-006 · Durée de récolte', () => {
  it('ex.1 — la hache en silex : 0 bois à 179 ticks, 1 bois et une souche à 180', () => {
    const { game, state } = startHarvest('tree');

    wait(game, 179);
    assert.equal(state.inventory.wood, 0);
    wait(game, 1);

    assert.equal(state.inventory.wood, 1);
    assert.equal(state.map.tileIdAt(7, 6), 'stump');
  });

  it('ex.2 — les haches en silex et en pierre : 3 bois à 90 ticks', () => {
    const { game, state } = startHarvest('tree', { tools: ['flint-axe', 'stone-axe'] });

    wait(game, 90);

    assert.equal(state.inventory.wood, 3);
  });

  it('ex.3 — des fleurs, à la main : 1 fleur à 60 ticks', () => {
    const { game, state } = startHarvest('flowers');

    wait(game, 60);

    assert.equal(state.inventory.flower, 1);
  });

  it("ex.4 — le joueur se déplace à 100 ticks : interrompue, 0 bois, l'arbre est là", () => {
    const { game, state } = startHarvest('tree');
    wait(game, 100);

    game.execute(setMoveIntent({ dx: -1, dy: 0 }));
    wait(game, 1);
    game.execute(setMoveIntent({ dx: 0, dy: 0 }));
    wait(game, 80);

    assert.equal(state.harvesting, undefined);
    assert.equal(state.inventory.wood, 0);
    assert.equal(state.map.tileIdAt(7, 6), 'tree');
  });

  it('ex.5 — la pioche en silex : 1 pierre à 180 ticks', () => {
    const { game, state } = startHarvest('rock');

    wait(game, 180);

    assert.equal(state.inventory.stone, 1);
  });
});

describe('R-IHM-RCL-001 · Récolte en cours', () => {
  it('ex.1 — aucune récolte : ni icône ni barre', () => {
    assert.equal(harvestView(createTestGame().state), undefined);
  });

  it('ex.2 — la hache en silex, 90 ticks : la hache, barre à 50 %', () => {
    const { game, state } = startHarvest('tree');
    wait(game, 90);

    const view = harvestView(state);

    assert.deepEqual([view.icon, view.progress], ['axe', 0.5]);
  });

  it("ex.3 — des fleurs, 30 ticks : l'icône d'une main, barre à 50 %", () => {
    const { game, state } = startHarvest('flowers');
    wait(game, 30);

    const view = harvestView(state);

    assert.deepEqual([view.icon, view.progress], ['gloves', 0.5]);
  });
});

describe("R-IHM-INS-002 · Fenêtre d'information", () => {
  it('ex.5 — la hache en pierre, un arbre : « Couper : 3 bois, 2 branches · 1,5 s »', () => {
    const { game } = createTestGame({
      map: { tiles: [[7, 6, 'tree']] },
      player: { position: SOUTH },
      tools: ['stone-axe'],
    });
    const controller = new InspectionController();
    controller.designate({ column: 7, row: 6 }, game);

    assert.equal(controller.view(game).action, 'Couper : 3 bois, 2 branches · 1,5 s');
  });
});

describe("R-IHM-INV-001 · Fenêtre d'inventaire", () => {
  it('ex.14 — 1 champignon grillé : « Champ. grillés 1 »', () => {
    const { state } = createTestGame({ inventory: { 'grilled-mushroom': 1 } });
    const entry = inventoryView(state).resources.find(({ id }) => id === 'grilled-mushroom');

    assert.equal(`${entry.label} ${entry.amount}`, 'Champ. grillés 1');
  });
});

/** Le feu de camp connu, 3 pierres et 2 bois, de l'eau devant le joueur. */
const facingWater = () =>
  createTestGame({
    map: { tiles: [[11, 10, 'water']] },
    player: { position: CENTER_10_10, facing: 'right' },
    knownRecipes: ['campfire'],
    inventory: { stone: 3, wood: 2 },
  });

describe("R-IHM-ART-001 · Fenêtre d'artisanat", () => {
  it("ex.7 — de l'eau devant le joueur : bouton inactif, « Il faut une place libre devant vous »", () => {
    const [entry] = craftView(facingWater().game).entries;

    assert.deepEqual(
      [entry.isEnabled, entry.warning],
      [false, 'Il faut une place libre devant vous'],
    );
  });
});

describe("R-ART-FAB-002 · Refus d'une fabrication", () => {
  it("ex.5 — de l'eau devant le joueur : refus CANNOT_PLACE, inventaire inchangé", () => {
    const { game, state } = facingWater();

    assert.deepEqual(craftAt(game, 'campfire'), { ok: false, reason: 'CANNOT_PLACE' });
    assert.deepEqual([state.inventory.stone, state.inventory.wood], [3, 2]);
  });
});
