import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { GameLoop } from '../../../src/app/GameLoop.js';

/** Boucle pilotée à la main : `advanceTo(t)` simule une image à l'instant t (ms). */
function createManualLoop({ stepMs = 10 } = {}) {
  let pendingFrame;
  const calls = { updates: 0, renders: 0 };
  const loop = new GameLoop({
    stepMs,
    update: () => {
      calls.updates += 1;
    },
    render: () => {
      calls.renders += 1;
    },
    requestFrame: (callback) => {
      pendingFrame = callback;
    },
  });
  const advanceTo = (time) => pendingFrame(time);
  return { loop, calls, advanceTo };
}

describe('GameLoop', () => {
  it('exécute un tick par tranche complète de stepMs écoulée, et un rendu par image', () => {
    const { loop, calls, advanceTo } = createManualLoop({ stepMs: 10 });
    loop.start();

    advanceTo(0);
    advanceTo(25);
    advanceTo(30);

    assert.equal(calls.updates, 3);
    assert.equal(calls.renders, 3);
  });

  it('limite le rattrapage après une longue interruption (onglet en arrière-plan)', () => {
    const { loop, calls, advanceTo } = createManualLoop({ stepMs: 10 });
    loop.start();

    advanceTo(0);
    advanceTo(10_000);

    assert.equal(calls.updates, 25);
  });

  it("n'exécute aucun tick en pause, mais continue de dessiner", () => {
    const { loop, calls, advanceTo } = createManualLoop({ stepMs: 10 });
    loop.start();
    loop.togglePause();

    advanceTo(0);
    advanceTo(100);

    assert.equal(calls.updates, 0);
    assert.equal(calls.renders, 2);
  });

  it("avance d'un seul tick à la demande, en pause uniquement", () => {
    const { loop, calls } = createManualLoop();

    loop.stepOnce();
    assert.equal(calls.updates, 0);

    loop.togglePause();
    loop.stepOnce();
    assert.equal(calls.updates, 1);
  });

  it('accélère le jeu avec le multiplicateur de vitesse, borné entre 0,25 et 8', () => {
    const { loop, calls, advanceTo } = createManualLoop({ stepMs: 10 });
    loop.setSpeed(2);
    loop.start();

    advanceTo(0);
    advanceTo(50);

    assert.equal(calls.updates, 10);
    loop.setSpeed(100);
    assert.equal(loop.speed, 8);
    loop.setSpeed(0);
    assert.equal(loop.speed, 0.25);
  });

  it("s'arrête : plus aucune image n'est traitée après stop()", () => {
    const { loop, calls, advanceTo } = createManualLoop();
    loop.start();

    loop.stop();
    advanceTo(100);

    assert.equal(calls.renders, 0);
  });
});
