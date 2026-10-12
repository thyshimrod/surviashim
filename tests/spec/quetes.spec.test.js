import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { giveTo, nextPage, talkTo } from '../../src/core/commands/commands.js';
import { GAME_EVENTS } from '../../src/core/events/gameEvents.js';
import { Game } from '../../src/core/Game.js';
import { InspectionController } from '../../src/presentation/ui/InspectionController.js';
import { experienceEntry } from '../../src/presentation/ui/inventoryEntries.js';
import { journalView } from '../../src/presentation/ui/journalView.js';
import {
  questCompletedMessages,
  questStartedMessage,
} from '../../src/presentation/ui/questMessages.js';
import { createTestGame } from '../helpers/testGame.js';

/** Maëlle telle que dans la vallée, sur la tuile (100, 88) : en (3216, 2832). */
const MAELLE = { x: 3216, y: 2832 };
/** À 40 px au sud de Maëlle : à portée de parole. */
const NEAR = { x: 3216, y: 2872 };
const ACTIVE = [{ questId: 'blue-doll', status: 'active' }];
const DONE = [{ questId: 'blue-doll', status: 'done' }];

/** Partie dans la vallée avec Maëlle ; le joueur près d'elle par défaut. */
function withMaelle({ position = NEAR, ...options } = {}) {
  return createTestGame({
    map: { columns: 160, rows: 120 },
    npcs: [{ id: 'maelle', position: MAELLE }],
    player: { position },
    ...options,
  });
}

/** Parle à Maëlle et avance jusqu'à la page donnée (1 = première page). */
function talkUntilPage(game, page) {
  game.execute(talkTo('maelle'));
  for (let current = 1; current < page; current += 1) {
    game.execute(nextPage());
  }
}

describe('R-JOU-EXP-001 · Expérience', () => {
  it("ex.1 — une nouvelle partie commence à 0 point d'expérience", () => {
    assert.equal(Game.create().getState().experience, 0);
  });

  it('ex.2 — 20 points, une quête qui rapporte 50 est terminée : 70 points', () => {
    const { game, state } = withMaelle({ items: ['blue-doll'], quests: ACTIVE, experience: 20 });

    game.execute(giveTo('maelle'));

    assert.equal(state.experience, 70);
  });
});

describe('R-INV-OBJ-001 · Objets', () => {
  it('ex.1 — une nouvelle partie commence sans objet', () => {
    assert.deepEqual(Game.create().getState().items, []);
  });

  it('ex.2 — la poupée donnée à Maëlle : plus aucun objet', () => {
    const { game, state } = withMaelle({ items: ['blue-doll'], quests: ACTIVE });

    game.execute(giveTo('maelle'));

    assert.deepEqual(state.items, []);
  });
});

describe('R-PNJ-QUE-001 · Recevoir une quête', () => {
  it('ex.1 — page 3 de Maëlle : la quête « La poupée de Maëlle » est en cours', () => {
    const { game, state } = withMaelle();

    talkUntilPage(game, 3);

    assert.deepEqual(state.quests, ACTIVE);
  });

  it('ex.2 — la quête déjà en cours, page 3 de nouveau : une seule fois', () => {
    const { game, state } = withMaelle({ quests: ACTIVE });

    talkUntilPage(game, 3);

    assert.deepEqual(state.quests, ACTIVE);
  });

  it('ex.3 — début du dialogue (page 1) : aucune quête', () => {
    const { game, state } = withMaelle();

    talkUntilPage(game, 1);

    assert.deepEqual(state.quests, []);
  });
});

describe("R-PNJ-QUE-002 · Donner l'objet d'une quête", () => {
  it('ex.1 — la poupée donnée : quête terminée, 50 points, remerciement', () => {
    const { game, state } = withMaelle({ items: ['blue-doll'], quests: ACTIVE });

    assert.deepEqual(game.execute(giveTo('maelle')), { ok: true });
    assert.deepEqual(state.items, []);
    assert.deepEqual(state.quests, DONE);
    assert.equal(state.experience, 50);
    assert.deepEqual(state.dialogue?.pages, ['maelle-thanks']);
  });

  it('ex.2 — la poupée possédée, la quête jamais reçue : refus NOTHING_TO_GIVE', () => {
    const { game } = withMaelle({ items: ['blue-doll'] });

    assert.deepEqual(game.execute(giveTo('maelle')), { ok: false, reason: 'NOTHING_TO_GIVE' });
  });

  it('ex.3 — la quête en cours, sans la poupée : refus NOTHING_TO_GIVE', () => {
    const { game } = withMaelle({ quests: ACTIVE });

    assert.deepEqual(game.execute(giveTo('maelle')), { ok: false, reason: 'NOTHING_TO_GIVE' });
  });

  it('ex.4 — Maëlle à 100 px : refus OUT_OF_REACH, la poupée reste', () => {
    const { game, state } = withMaelle({
      items: ['blue-doll'],
      quests: ACTIVE,
      position: { x: 3216, y: 2932 },
    });

    assert.deepEqual(game.execute(giveTo('maelle')), { ok: false, reason: 'OUT_OF_REACH' });
    assert.deepEqual(state.items, ['blue-doll']);
  });

  it('ex.5 — la quête terminée : refus NOTHING_TO_GIVE', () => {
    const { game } = withMaelle({ items: ['blue-doll'], quests: DONE });

    assert.deepEqual(game.execute(giveTo('maelle')), { ok: false, reason: 'NOTHING_TO_GIVE' });
  });
});

describe('R-PNJ-QUE-003 · Dialogue après la quête', () => {
  it('ex.1 — la quête non terminée : maelle-1, maelle-2, maelle-3', () => {
    const { game, state } = withMaelle({ quests: ACTIVE });

    game.execute(talkTo('maelle'));

    assert.deepEqual(state.dialogue?.pages, ['maelle-1', 'maelle-2', 'maelle-3']);
  });

  it('ex.2 — la quête terminée : maelle-1, maelle-2, maelle-4', () => {
    const { game, state } = withMaelle({ quests: DONE });

    game.execute(talkTo('maelle'));

    assert.deepEqual(state.dialogue?.pages, ['maelle-1', 'maelle-2', 'maelle-4']);
  });
});

describe('R-IHM-INS-005 · Désigner un PNJ', () => {
  const designated = (options) => {
    const { game, state } = withMaelle(options);
    const controller = new InspectionController();
    controller.designate({ npcId: 'maelle' }, game);
    return { game, state, controller };
  };

  it('ex.5 — la quête en cours, la poupée possédée : « Donner : poupée de chiffon bleue »', () => {
    const { game, controller } = designated({ items: ['blue-doll'], quests: ACTIVE });

    assert.deepEqual(controller.view(game).give, {
      action: 'Donner : poupée de chiffon bleue',
      button: 'Donner',
      isEnabled: true,
    });
  });

  it('ex.6 — clic sur « Donner » : la poupée est donnée, la fenêtre fermée', () => {
    const { game, state, controller } = designated({ items: ['blue-doll'], quests: ACTIVE });

    controller.give(game);

    assert.deepEqual(state.items, []);
    assert.equal(controller.isOpen, false);
  });

  it('ex.7 — la poupée possédée, la quête jamais reçue : pas de bouton « Donner »', () => {
    const { game, controller } = designated({ items: ['blue-doll'] });

    assert.equal(controller.view(game).give, undefined);
  });
});

describe('R-IHM-HUD-002 · Expérience au bandeau', () => {
  const label = (experience) => {
    const entry = experienceEntry(experience);
    return `${entry.label} ${entry.amount}`;
  };

  it('ex.1 — une nouvelle partie : « Expérience 0 »', () => {
    assert.equal(label(Game.create().getState().experience), 'Expérience 0');
  });

  it('ex.2 — 70 points : « Expérience 70 »', () => {
    assert.equal(label(70), 'Expérience 70');
  });
});

describe('R-IHM-JRN-003 · Quêtes au journal', () => {
  it("ex.1 — aucune quête : « Aucune quête pour l'instant. »", () => {
    const view = journalView([], [], []);

    assert.deepEqual(view.quests, []);
    assert.equal(view.noQuest, "Aucune quête pour l'instant.");
  });

  it('ex.2 — la quête de Maëlle en cours : titre, état et description', () => {
    const [quest] = journalView([], [], ACTIVE).quests;

    assert.equal(quest.heading, 'La poupée de Maëlle — En cours');
    assert.ok(quest.description.length > 0);
  });

  it('ex.3 — la quête de Maëlle terminée : « Terminée »', () => {
    const [quest] = journalView([], [], DONE).quests;

    assert.equal(quest.heading, 'La poupée de Maëlle — Terminée');
  });
});

describe('R-IHM-NOT-003 · Quêtes et expérience', () => {
  it('ex.1 — la page qui confie la quête : « Nouvelle quête : La poupée de Maëlle »', () => {
    const { game } = withMaelle();
    const notifications = [];
    game.events.on(GAME_EVENTS.QUEST_STARTED, ({ questId }) =>
      notifications.push(questStartedMessage(questId)),
    );

    talkUntilPage(game, 3);

    assert.deepEqual(notifications, ['Nouvelle quête : La poupée de Maëlle']);
  });

  it('ex.2 — la poupée donnée : « Quête terminée » puis « +50 expérience »', () => {
    const { game } = withMaelle({ items: ['blue-doll'], quests: ACTIVE });
    const notifications = [];
    game.events.on(GAME_EVENTS.QUEST_COMPLETED, ({ questId, experience }) =>
      notifications.push(...questCompletedMessages(questId, experience)),
    );

    game.execute(giveTo('maelle'));

    assert.deepEqual(notifications, ['Quête terminée : La poupée de Maëlle', '+50 expérience']);
  });
});
