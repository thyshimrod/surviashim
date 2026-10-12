import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { selectCharacterFrame } from '../../src/presentation/animation/selectFrame.js';
import { computeViewOrigin } from '../../src/presentation/camera/camera.js';
import { computeViewSize } from '../../src/presentation/canvas/viewSize.js';
import { movementKeyForCode } from '../../src/presentation/input/movementKeys.js';
import { sortByDepth } from '../../src/presentation/renderers/depthSort.js';
import { createTestGame, walk } from '../helpers/testGame.js';

describe('R-IHM-CMD-001 · Touches de déplacement', () => {
  // Sur un clavier AZERTY, la touche Z a le code KeyW et la touche Q le code KeyA.
  it('ex.1 — AZERTY : la touche Z est la touche haut', () => {
    assert.equal(movementKeyForCode('KeyW'), 'up');
  });

  it('ex.2 — AZERTY : la touche Q est la touche gauche', () => {
    assert.equal(movementKeyForCode('KeyA'), 'left');
  });

  it('ex.3 — QWERTY : la touche W est la touche haut', () => {
    assert.equal(movementKeyForCode('KeyW'), 'up');
  });

  it('ex.4 — la flèche droite est la touche droite', () => {
    assert.equal(movementKeyForCode('ArrowRight'), 'right');
  });
});

describe('R-IHM-CAM-001 · Caméra centrée sur le joueur', () => {
  const originFor = (x, y, viewWidth = 640, viewHeight = 360) =>
    computeViewOrigin({ focus: { x, y }, viewWidth, viewHeight });

  it('ex.1 — joueur en (656, 496) : la vue commence en (336, 316)', () => {
    assert.deepEqual(originFor(656, 496), { x: 336, y: 316 });
  });

  it('ex.2 — joueur en (50, 496), près du bord : la vue commence en (−270, 316)', () => {
    assert.deepEqual(originFor(50, 496), { x: -270, y: 316 });
  });

  it('ex.3 — joueur en (1270, 950) : la vue commence en (950, 770)', () => {
    assert.deepEqual(originFor(1270, 950), { x: 950, y: 770 });
  });

  it('ex.4 — vue de 1920 × 1080, joueur en (656, 496) : la vue commence en (−304, −44)', () => {
    assert.deepEqual(originFor(656, 496, 1920, 1080), { x: -304, y: -44 });
  });
});

describe("R-IHM-AFF-001 · Vue à la taille de l'écran", () => {
  const viewFor = (cssWidth, cssHeight, pixelRatio) =>
    computeViewSize({ cssWidth, cssHeight, pixelRatio });

  it('ex.1 — fenêtre de 1920 × 1080, rapport 1 : vue de 1920 × 1080', () => {
    assert.deepEqual(viewFor(1920, 1080, 1), { width: 1920, height: 1080 });
  });

  it('ex.2 — fenêtre de 1536 × 864, rapport 1,25 : vue de 1920 × 1080', () => {
    assert.deepEqual(viewFor(1536, 864, 1.25), { width: 1920, height: 1080 });
  });

  it('ex.3 — fenêtre de 1366 × 768, rapport 1 : vue de 1366 × 768', () => {
    assert.deepEqual(viewFor(1366, 768, 1), { width: 1366, height: 768 });
  });

  it('ex.4 — fenêtre de 1001 × 601, rapport 1,5 : vue de 1502 × 902 (arrondi)', () => {
    assert.deepEqual(viewFor(1001, 601, 1.5), { width: 1502, height: 902 });
  });

  it('ex.5 — la fenêtre passe à 1280 × 720 : la vue suit', () => {
    assert.deepEqual(viewFor(1920, 1080, 1), { width: 1920, height: 1080 });

    assert.deepEqual(viewFor(1280, 720, 1), { width: 1280, height: 720 });
  });
});

describe('R-IHM-AFF-002 · Tri en profondeur', () => {
  const tree = { name: 'arbre', footY: 110, isCharacter: false };
  const drawOrder = (playerY) =>
    sortByDepth([{ name: 'joueur', footY: playerY, isCharacter: true }, tree]).map(
      (element) => element.name,
    );

  it("ex.1 — joueur en y = 100, pied de l'arbre en y = 110 : l'arbre est devant", () => {
    assert.deepEqual(drawOrder(100), ['joueur', 'arbre']);
  });

  it("ex.2 — joueur en y = 120 : le joueur est devant l'arbre", () => {
    assert.deepEqual(drawOrder(120), ['arbre', 'joueur']);
  });

  it("ex.3 — joueur en y = 110, à égalité : le joueur est devant l'arbre", () => {
    assert.deepEqual(drawOrder(110), ['arbre', 'joueur']);
  });
});

const ANIMATION = { frameTicks: 8, sequence: [3, 2, 1, 2], idleFrame: 2 };
const walkingFor = (walkingTicks) =>
  selectCharacterFrame({ isWalking: true, walkingTicks }, ANIMATION);

describe('R-IHM-ANI-001 · Animation de marche', () => {
  it("ex.1 — en marche depuis 0 tick : l'image 3", () => {
    assert.equal(walkingFor(0), 3);
  });

  it("ex.2 — en marche depuis 8 ticks : l'image 2", () => {
    assert.equal(walkingFor(8), 2);
  });

  it("ex.3 — en marche depuis 16 ticks : l'image 1", () => {
    assert.equal(walkingFor(16), 1);
  });

  it("ex.4 — en marche depuis 31 ticks : l'image 2", () => {
    assert.equal(walkingFor(31), 2);
  });

  it("ex.5 — en marche depuis 32 ticks : l'image 3", () => {
    assert.equal(walkingFor(32), 3);
  });

  it("ex.6 — en tournant vers le haut, le cycle continue à l'image 2", () => {
    const { game, state } = createTestGame();
    walk(game, 'gauche', 11);
    assert.equal(selectCharacterFrame(state.player, ANIMATION), 2);

    walk(game, 'haut', 1);

    assert.equal(state.player.facing, 'up');
    assert.equal(selectCharacterFrame(state.player, ANIMATION), 2);
  });
});

describe('R-IHM-ANI-002 · Pose immobile', () => {
  it("ex.1 — immobile, orienté vers la gauche : l'image 2 de la ligne « gauche »", () => {
    const { game, state } = createTestGame();
    walk(game, 'gauche', 3);

    walk(game, 'aucune', 1);

    assert.equal(state.player.facing, 'left');
    assert.equal(selectCharacterFrame(state.player, ANIMATION), 2);
  });

  it("ex.2 — arrêté sur l'image 1, il repart sur l'image 3", () => {
    const { game, state } = createTestGame();
    walk(game, 'droite', 17);
    assert.equal(selectCharacterFrame(state.player, ANIMATION), 1);
    walk(game, 'aucune', 1);

    walk(game, 'droite', 1);

    assert.equal(selectCharacterFrame(state.player, ANIMATION), 3);
  });
});
