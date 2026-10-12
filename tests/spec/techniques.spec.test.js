import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { GAME_PARAMETERS } from '../../data/gameParameters.js';
import { researchPlan } from '../../src/core/commands/commands.js';
import { levelThreshold } from '../../src/core/systems/experience.js';
import { researchView } from '../../src/presentation/ui/researchView.js';
import { createTestGame, harvestAt } from '../helpers/testGame.js';

/** Expérience qui donne tout juste ce niveau (R-JOU-EXP-003). */
const levelXp = (level) =>
  levelThreshold(level, {
    firstLevel: GAME_PARAMETERS.LEVEL_FIRST_XP,
    step: GAME_PARAMETERS.LEVEL_XP_STEP,
  });

/** La fumée de sauge découverte, à ce niveau. */
const withSageSmoke = (level) =>
  createTestGame({ experience: levelXp(level), discoveredPlans: ['sage-smoke'] });

describe('R-TEC-REC-002 · Rechercher un plan', () => {
  it('ex.6 — niveau 9, la fumée de sauge découverte : refus LEVEL_TOO_LOW', () => {
    const { game } = withSageSmoke(9);

    assert.deepEqual(game.execute(researchPlan('sage-smoke')), {
      ok: false,
      reason: 'LEVEL_TOO_LOW',
    });
  });

  it('ex.7 — niveau 10, la fumée de sauge découverte : recherchée, aucune recette nouvelle', () => {
    const { game, state } = withSageSmoke(10);

    assert.deepEqual(game.execute(researchPlan('sage-smoke')), { ok: true });
    assert.deepEqual(state.researched, ['sage-smoke']);
    assert.deepEqual(state.knownRecipes, []);
  });
});

describe('R-IHM-REC-001 · Fenêtre de recherche', () => {
  it('ex.6 — niveau 3, la fumée de sauge : bouton inactif, « Niveau 10 requis »', () => {
    const [entry] = researchView(withSageSmoke(3).game).entries;

    assert.deepEqual(
      [entry.name, entry.isEnabled, entry.warning],
      ['Fumée de sauge', false, 'Niveau 10 requis'],
    );
  });
});

describe('R-RES-ELE-001 · Éléments récoltables', () => {
  it('ex.9 — des hautes herbes se ramassent et donnent 2 fibres', () => {
    const { game } = createTestGame({ map: { tiles: [[3, 3, 'tall-grass']] } });
    const { action, resource, amount, tool } = game.inspect({ column: 3, row: 3 }).harvest;

    assert.deepEqual([action, resource, amount, tool], ['pick', 'fiber', 2, undefined]);
  });
});

describe('R-RES-REC-002 · Gain de ressources', () => {
  it("ex.4 — 0 branche, récolte d'un arbre : 2 branches", () => {
    const { game, state } = createTestGame({
      map: { tiles: [[7, 6, 'tree']] },
      player: { position: { x: 240, y: 236 } },
    });

    harvestAt(game, 7, 6);

    assert.equal(state.inventory.branch, 2);
  });
});
