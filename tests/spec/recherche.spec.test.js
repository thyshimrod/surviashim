import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { craftItem, researchPlan, searchTile } from '../../src/core/commands/commands.js';
import { GAME_EVENTS } from '../../src/core/events/gameEvents.js';
import { levelOf, researchPoints } from '../../src/core/systems/experience.js';
import { craftView } from '../../src/presentation/ui/craftView.js';
import { notificationsFor } from '../../src/presentation/ui/gameNotifications.js';
import { experienceEntry } from '../../src/presentation/ui/inventoryEntries.js';
import { researchView } from '../../src/presentation/ui/researchView.js';
import { WindowsController } from '../../src/presentation/ui/WindowsController.js';
import { at, createTestGame, readAt, walk, harvestAt } from '../helpers/testGame.js';

/** Le joueur au centre de la tuile (10, 10), orienté à droite. */
const CENTER_10_10 = { x: 336, y: 336 };
/** Expérience des niveaux 1, 2 et 3. */
const LEVEL = Object.freeze({ 1: 0, 2: 100, 3: 250 });

/** Partie où le joueur se tient en (10, 10), un élément en (11, 10). */
function beside(tile, options = {}) {
  return createTestGame({
    map: { tiles: tile === undefined ? [] : [[11, 10, tile]] },
    player: { position: CENTER_10_10, facing: 'right' },
    ...options,
  });
}

/** Récolte l'élément en (11, 10) et renvoie l'inventaire. */
function harvestBeside(tile, tools) {
  const { game, state } = beside(tile, { tools });
  harvestAt(game, 11, 10);
  return state.inventory;
}

describe("R-JOU-EXP-002 · Gagner de l'expérience", () => {
  it('ex.1 — récolter un arbre : 1 expérience', () => {
    const { game, state } = beside('tree');

    harvestAt(game, 11, 10);

    assert.equal(state.experience, 1);
  });

  it('ex.2 — fouiller un coffre : 5 expérience', () => {
    const { game, state } = beside('ruin-chest');

    game.execute(searchTile({ column: 11, row: 10 }));

    assert.equal(state.experience, 5);
  });

  it('ex.3 — fabriquer la hache : 5 expérience', () => {
    const { game, state } = createTestGame({
      tools: [],
      knownRecipes: ['flint-axe'],
      inventory: { flint: 1, branch: 2, fiber: 1 },
    });

    game.execute(craftItem('flint-axe'));

    assert.equal(state.experience, 5);
  });

  it('ex.4 — découvrir un lieu : 10 expérience', () => {
    const { game, state } = createTestGame({
      places: {
        'test-place': { id: 'test-place', area: { column: 10, row: 10, width: 5, height: 4 } },
      },
      player: { position: { x: 310, y: 340 } },
    });

    walk(game, 'droite', 10);

    assert.equal(state.experience, 10);
  });

  it('ex.5 — un arbre hors de portée : refus, 0 expérience', () => {
    const { game, state } = createTestGame({
      map: { tiles: [[20, 20, 'tree']] },
      player: { position: CENTER_10_10 },
    });

    harvestAt(game, 20, 20);

    assert.equal(state.experience, 0);
  });
});

describe('R-JOU-EXP-003 · Niveaux', () => {
  const { rules } = createTestGame().game;

  it('ex.1 — 99 : niveau 1', () => assert.equal(levelOf(99, rules), 1));
  it('ex.2 — 100 : niveau 2', () => assert.equal(levelOf(100, rules), 2));
  it('ex.3 — 249 : niveau 2', () => assert.equal(levelOf(249, rules), 2));
  it('ex.4 — 250 : niveau 3', () => assert.equal(levelOf(250, rules), 3));
  it('ex.5 — 450 : niveau 4', () => assert.equal(levelOf(450, rules), 4));
});

describe('R-TEC-REC-001 · Points de recherche', () => {
  const points = (options) => {
    const { game, state } = createTestGame(options);
    return researchPoints(state, game.rules);
  };

  it('ex.1 — niveau 1 : 0 point', () => {
    assert.equal(points({ experience: LEVEL[1] }), 0);
  });

  it('ex.2 — niveau 3, aucun plan recherché : 2 points', () => {
    assert.equal(points({ experience: LEVEL[3] }), 2);
  });

  it('ex.3 — niveau 3, un plan recherché : 1 point', () => {
    assert.equal(points({ experience: LEVEL[3], researched: ['gatherer-bag'] }), 1);
  });
});

describe('R-TEC-REC-002 · Rechercher un plan', () => {
  const research = (planId, options) => {
    const { game, state } = createTestGame(options);
    return { result: game.execute(researchPlan(planId)), state, game };
  };
  const STONE_AXE = {
    experience: LEVEL[2],
    discoveredPlans: ['stone-axe'],
    knownRecipes: ['flint-axe'],
  };

  it('ex.1 — niveau 2, hache en pierre découverte, hache en silex connue : apprise, 0 point', () => {
    const { result, state, game } = research('stone-axe', STONE_AXE);

    assert.deepEqual(result, { ok: true });
    assert.ok(state.knownRecipes.includes('stone-axe'));
    assert.equal(researchPoints(state, game.rules), 0);
  });

  it('ex.2 — aucun plan découvert : refus UNKNOWN_PLAN', () => {
    const { result } = research('stone-axe', { experience: LEVEL[2] });

    assert.deepEqual(result, { ok: false, reason: 'UNKNOWN_PLAN' });
  });

  it('ex.3 — déjà recherchée : refus ALREADY_RESEARCHED', () => {
    const { result } = research('stone-axe', {
      ...STONE_AXE,
      experience: LEVEL[3],
      researched: ['stone-axe'],
    });

    assert.deepEqual(result, { ok: false, reason: 'ALREADY_RESEARCHED' });
  });

  it('ex.4 — la hache en silex inconnue : refus MISSING_PREREQUISITE', () => {
    const { result } = research('stone-axe', { ...STONE_AXE, knownRecipes: [] });

    assert.deepEqual(result, { ok: false, reason: 'MISSING_PREREQUISITE' });
  });

  it('ex.5 — niveau 1 : refus NOT_ENOUGH_POINTS', () => {
    const { result } = research('gatherer-bag', {
      experience: LEVEL[1],
      discoveredPlans: ['gatherer-bag'],
    });

    assert.deepEqual(result, { ok: false, reason: 'NOT_ENOUGH_POINTS' });
  });
});

describe('R-INV-LIV-002 · Lire un livre', () => {
  it("ex.6 — « L'Art de la pierre » : hache et pioche en pierre découvertes, pas connues", () => {
    const { game, state } = createTestGame({ books: ['stonework'] });

    readAt(game, 'stonework');

    assert.deepEqual(state.discoveredPlans, ['stone-axe', 'stone-pickaxe']);
    assert.deepEqual(state.knownRecipes, []);
  });
});

describe('R-RES-OUT-002 · Meilleurs outils', () => {
  it('ex.1 — la hache en silex : 1 bois et 2 branches', () => {
    const inventory = harvestBeside('tree', ['flint-axe']);

    assert.deepEqual([inventory.wood, inventory.branch], [1, 2]);
  });

  it('ex.2 — les haches en silex et en pierre : 3 bois et 2 branches', () => {
    const inventory = harvestBeside('tree', ['flint-axe', 'stone-axe']);

    assert.deepEqual([inventory.wood, inventory.branch], [3, 2]);
  });

  it('ex.3 — la pioche en pierre : 2 pierres', () => {
    assert.equal(harvestBeside('rock', ['stone-pickaxe']).stone, 2);
  });

  it('ex.4 — le sac du cueilleur, un buisson : 4 baies', () => {
    assert.equal(harvestBeside('berry-bush', ['gatherer-bag']).berry, 4);
  });

  it('ex.5 — le sac du cueilleur, des fleurs : 1 fleur', () => {
    assert.equal(harvestBeside('flowers', ['gatherer-bag']).flower, 1);
  });
});

describe('R-ART-FAB-003 · Cuisiner au feu', () => {
  const cooking = ({ fire }) =>
    beside(fire === undefined ? undefined : 'campfire', {
      knownRecipes: ['grilled-mushroom'],
      inventory: { mushroom: 1 },
      campfires:
        fire === undefined ? [] : [{ column: 11, row: 10, burnsUntil: fire ? at(9, '0:00') : 0 }],
    });

  it('ex.1 — un feu allumé à portée : 1 champignon grillé, 0 champignon', () => {
    const { game, state } = cooking({ fire: true });

    assert.deepEqual(game.execute(craftItem('grilled-mushroom')), { ok: true });
    assert.deepEqual([state.inventory['grilled-mushroom'], state.inventory.mushroom], [1, 0]);
  });

  it('ex.2 — aucun feu : refus NEEDS_FIRE', () => {
    const { game } = cooking({ fire: undefined });

    assert.deepEqual(game.execute(craftItem('grilled-mushroom')), {
      ok: false,
      reason: 'NEEDS_FIRE',
    });
  });

  it('ex.3 — un feu éteint : refus NEEDS_FIRE', () => {
    const { game } = cooking({ fire: false });

    assert.deepEqual(game.execute(craftItem('grilled-mushroom')), {
      ok: false,
      reason: 'NEEDS_FIRE',
    });
  });
});

describe('R-IHM-HUD-002 · Expérience au bandeau', () => {
  it('ex.3 — 260 expérience : « Niveau 3 · 260/450 »', () => {
    assert.equal(experienceEntry(260).label, 'Niveau 3 · 260/450');
  });
});

describe("R-IHM-ART-001 · Fenêtre d'artisanat", () => {
  it('ex.6 — champignons grillés, aucun feu : « Il faut un feu de camp allumé à portée »', () => {
    const { game } = beside(undefined, {
      knownRecipes: ['grilled-mushroom'],
      inventory: { mushroom: 1 },
    });
    const [entry] = craftView(game).entries;

    assert.deepEqual(
      [entry.isEnabled, entry.warning],
      [false, 'Il faut un feu de camp allumé à portée'],
    );
  });
});

describe('R-IHM-FEN-001 · Une fenêtre à la fois', () => {
  it("ex.7 — la recherche ouverte, touche I : l'inventaire la remplace", () => {
    const windows = new WindowsController();
    windows.handleKey('r');

    windows.handleKey('i');

    assert.equal(windows.open, 'inventory');
  });
});

describe('R-IHM-REC-001 · Fenêtre de recherche', () => {
  const view = (options) => researchView(createTestGame(options).game);
  const STONE_AXE = {
    experience: LEVEL[2],
    discoveredPlans: ['stone-axe'],
    knownRecipes: ['flint-axe'],
  };

  it('ex.1 — aucun plan découvert : « Points de recherche : 0 » et le message', () => {
    const content = view({ experience: LEVEL[1] });

    assert.equal(content.points, 'Points de recherche : 0');
    assert.equal(
      content.empty,
      'Aucun plan à rechercher : trouvez des livres de recherche dans les ruines.',
    );
  });

  it('ex.2 — niveau 2, hache en pierre : 1 point, « Hache en pierre », bouton actif', () => {
    const content = view(STONE_AXE);
    const [entry] = content.entries;

    assert.equal(content.points, 'Points de recherche : 1');
    assert.deepEqual(
      [entry.name, entry.cost, entry.button, entry.isEnabled],
      ['Hache en pierre', '1 point', 'Rechercher', true],
    );
  });

  it("ex.3 — la hache en silex inconnue : « Il faut d'abord : hache en silex »", () => {
    const [entry] = view({ ...STONE_AXE, knownRecipes: [] }).entries;

    assert.deepEqual([entry.isEnabled, entry.warning], [false, "Il faut d'abord : hache en silex"]);
  });

  it('ex.4 — niveau 1 : « Pas assez de points »', () => {
    const [entry] = view({ experience: LEVEL[1], discoveredPlans: ['gatherer-bag'] }).entries;

    assert.deepEqual([entry.isEnabled, entry.warning], [false, 'Pas assez de points']);
  });

  it('ex.5 — clic sur « Rechercher » : « Recherché », 0 point, « Recette apprise »', () => {
    const { game } = createTestGame(STONE_AXE);
    const notifications = [];
    game.events.on(GAME_EVENTS.RESEARCHED, (payload) =>
      notifications.push(...notificationsFor(GAME_EVENTS.RESEARCHED, payload).map((n) => n.text)),
    );
    const windows = new WindowsController();
    windows.toggle('research');

    windows.research('stone-axe', game);
    const content = researchView(game);

    assert.deepEqual(
      [content.entries[0].warning, content.points],
      ['Recherché', 'Points de recherche : 0'],
    );
    assert.deepEqual(notifications, ['Recette apprise : hache en pierre']);
  });
});

describe('R-IHM-NOT-004 · Niveau gagné', () => {
  const levelUps = (experience) => {
    const { game } = beside('tree', { experience });
    const messages = [];
    game.events.on(GAME_EVENTS.LEVEL_UP, (payload) =>
      messages.push(...notificationsFor(GAME_EVENTS.LEVEL_UP, payload)),
    );
    harvestAt(game, 11, 10);
    return messages;
  };

  it('ex.1 — 99 expérience, +1 : « Niveau 2 ! +1 point de recherche », importante', () => {
    assert.deepEqual(levelUps(99), [{ text: 'Niveau 2 ! +1 point de recherche', important: true }]);
  });

  it('ex.2 — 50 expérience, +1 : aucune notification de niveau', () => {
    assert.deepEqual(levelUps(50), []);
  });
});
