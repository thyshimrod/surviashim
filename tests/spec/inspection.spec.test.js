import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { screenToWorld } from '../../src/presentation/camera/camera.js';
import { designateTile } from '../../src/presentation/input/designateTile.js';
import { InspectionController } from '../../src/presentation/ui/InspectionController.js';
import { inventoryEntries } from '../../src/presentation/ui/inventoryEntries.js';
import { createTestGame, makeMap, walk } from '../helpers/testGame.js';

const map = makeMap();

/** Arbre sur la tuile (7, 6) : sprite de 1 × 2 tuiles, x de 224 à 256, y de 160 à 224. */
const TREE_76 = {
  column: 7,
  row: 6,
  footY: 224,
  sprite: { left: 224, right: 256, top: 160, bottom: 224 },
};
const TREE_77 = {
  column: 7,
  row: 7,
  footY: 256,
  sprite: { left: 224, right: 256, top: 192, bottom: 256 },
};

/** Partie avec un arbre (7, 6), un rocher (10, 6), des fleurs (12, 6) ; joueur à la position donnée. */
function gameWithElements(position = { x: 240, y: 236 }) {
  return createTestGame({
    map: {
      tiles: [
        [7, 6, 'tree'],
        [12, 6, 'flowers'],
      ],
      rocks: [[10, 6]],
    },
    player: { position },
  });
}

/** Contrôleur dont la fenêtre est ouverte sur la tuile donnée. */
function openOn(game, column, row) {
  const controller = new InspectionController();
  controller.designate({ column, row }, game);
  return controller;
}

describe('R-IHM-INS-001 · Désigner une tuile au clic', () => {
  it('ex.1 — vue en (100, 50), clic au pixel (40, 30) : point (140, 80)', () => {
    assert.deepEqual(screenToWorld({ x: 40, y: 30 }, { x: 100, y: 50 }), { x: 140, y: 80 });
  });

  it("ex.2 — clic sur le feuillage de l'arbre, en (240, 170) : tuile (7, 6)", () => {
    assert.deepEqual(designateTile({ point: { x: 240, y: 170 }, elements: [TREE_76], map }), {
      column: 7,
      row: 6,
    });
  });

  it('ex.3 — clic en (300, 300), hors du sprite : tuile (9, 9)', () => {
    assert.deepEqual(designateTile({ point: { x: 300, y: 300 }, elements: [TREE_76], map }), {
      column: 9,
      row: 9,
    });
  });

  it("ex.4 — deux sprites superposés en (240, 200) : l'arbre de devant, tuile (7, 7)", () => {
    const point = { x: 240, y: 200 };

    assert.deepEqual(designateTile({ point, elements: [TREE_76, TREE_77], map }), {
      column: 7,
      row: 7,
    });
  });
});

describe("R-IHM-INS-002 · Fenêtre d'information", () => {
  it('ex.1 — un arbre : « Arbre », « Couper : 3 bois »', () => {
    const { game } = gameWithElements();

    const view = openOn(game, 7, 6).view(game);

    assert.deepEqual([view.title, view.action], ['Arbre', 'Couper : 3 bois']);
  });

  it('ex.2 — un rocher : « Rocher », « Piocher : 2 pierres »', () => {
    const { game } = gameWithElements();

    const view = openOn(game, 10, 6).view(game);

    assert.deepEqual([view.title, view.action], ['Rocher', 'Piocher : 2 pierres']);
  });

  it('ex.3 — des fleurs : « Fleurs », « Ramasser : 1 fleur »', () => {
    const { game } = gameWithElements();

    const view = openOn(game, 12, 6).view(game);

    assert.deepEqual([view.title, view.action], ['Fleurs', 'Ramasser : 1 fleur']);
  });

  it("ex.4 — fenêtre ouverte, on désigne de l'herbe : la fenêtre est fermée", () => {
    const { game } = gameWithElements();
    const controller = openOn(game, 7, 6);

    controller.designate({ column: 2, row: 2 }, game);

    assert.equal(controller.view(game), undefined);
  });
});

describe('R-IHM-INS-003 · Bouton « Récolter »', () => {
  it('ex.1 — arbre à portée : le bouton est actif', () => {
    const { game } = gameWithElements({ x: 240, y: 236 });

    const view = openOn(game, 7, 6).view(game);

    assert.equal(view.isActionEnabled, true);
    assert.equal(view.warning, undefined);
  });

  it('ex.2 — arbre hors de portée : bouton inactif, « Trop loin : approchez-vous »', () => {
    const { game } = gameWithElements({ x: 240, y: 400 });

    const view = openOn(game, 7, 6).view(game);

    assert.equal(view.isActionEnabled, false);
    assert.equal(view.warning, 'Trop loin : approchez-vous');
  });

  it("ex.3 — le joueur s'approche à portée : le bouton devient actif", () => {
    const { game } = gameWithElements({ x: 240, y: 300 });
    const controller = openOn(game, 7, 6);
    assert.equal(controller.view(game).isActionEnabled, false);

    walk(game, 'haut', 40); // 60 px vers le haut, à 1,5 px/tick : y = 240

    assert.equal(controller.view(game).isActionEnabled, true);
  });

  it('ex.4 — clic sur « Récolter » : 3 bois, fenêtre fermée', () => {
    const { game, state } = gameWithElements({ x: 240, y: 236 });
    const controller = openOn(game, 7, 6);

    controller.confirm(game);

    assert.equal(state.inventory.wood, 3);
    assert.equal(controller.isOpen, false);
  });
});

describe("R-IHM-INS-004 · Fermer la fenêtre d'information", () => {
  it('ex.1 — la touche Échap ferme la fenêtre', () => {
    const { game } = gameWithElements();
    const controller = openOn(game, 7, 6);

    controller.handleKey('Escape');

    assert.equal(controller.isOpen, false);
  });

  it('ex.2 — le bouton × ferme la fenêtre', () => {
    const { game } = gameWithElements();
    const controller = openOn(game, 7, 6);

    controller.close();

    assert.equal(controller.view(game), undefined);
  });
});

describe("R-IHM-HUD-001 · Affichage de l'inventaire", () => {
  const labels = (inventory) =>
    inventoryEntries(inventory).map((entry) => `${entry.label} ${entry.amount}`);

  it('ex.1 — 3 bois, 0 pierre, 1 fleur, 2 silex, 0 branche, 4 fibres, 5 baies, 1 champignon', () => {
    assert.deepEqual(
      labels({
        wood: 3,
        stone: 0,
        flower: 1,
        flint: 2,
        branch: 0,
        fiber: 4,
        berry: 5,
        mushroom: 1,
      }),
      [
        'Bois 3',
        'Pierre 0',
        'Fleurs 1',
        'Silex 2',
        'Branches 0',
        'Fibres 4',
        'Baies 5',
        'Champignons 1',
        'Champignons grillés 0',
      ],
    );
  });

  it('ex.2 — nouvelle partie : tout à 0', () => {
    const { state } = createTestGame();

    assert.deepEqual(labels(state.inventory), [
      'Bois 0',
      'Pierre 0',
      'Fleurs 0',
      'Silex 0',
      'Branches 0',
      'Fibres 0',
      'Baies 0',
      'Champignons 0',
      'Champignons grillés 0',
    ]);
  });
});
