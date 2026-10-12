import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { screenToWorld } from '../../src/presentation/camera/camera.js';
import { designateTile } from '../../src/presentation/input/designateTile.js';
import { InspectionController } from '../../src/presentation/ui/InspectionController.js';
import { createTestGame, makeMap, walk, finishHarvest } from '../helpers/testGame.js';

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
  it('ex.1 — la hache en silex, un arbre : « Couper : 1 bois, 2 branches · 3 s »', () => {
    const { game } = gameWithElements();

    const view = openOn(game, 7, 6).view(game);

    assert.deepEqual([view.title, view.action], ['Arbre', 'Couper : 1 bois, 2 branches · 3 s']);
  });

  it('ex.2 — la pioche en silex, un rocher : « Piocher : 1 pierre · 3 s »', () => {
    const { game } = gameWithElements();

    const view = openOn(game, 10, 6).view(game);

    assert.deepEqual([view.title, view.action], ['Rocher', 'Piocher : 1 pierre · 3 s']);
  });

  it('ex.3 — des fleurs : « Fleurs », « Ramasser : 1 fleur · 1 s »', () => {
    const { game } = gameWithElements();

    const view = openOn(game, 12, 6).view(game);

    assert.deepEqual([view.title, view.action], ['Fleurs', 'Ramasser : 1 fleur · 1 s']);
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

  it('ex.4 — clic sur « Récolter » : fenêtre fermée ; à la fin de la récolte, 1 bois', () => {
    const { game, state } = gameWithElements({ x: 240, y: 236 });
    const controller = openOn(game, 7, 6);

    controller.confirm(game);
    finishHarvest(game);

    assert.equal(controller.isOpen, false);
    assert.equal(state.inventory.wood, 1);
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
