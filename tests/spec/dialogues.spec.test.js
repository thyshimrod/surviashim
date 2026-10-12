import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { talkTo } from '../../src/core/commands/commands.js';
import { designateTile } from '../../src/presentation/input/designateTile.js';
import { CONTENT_TEXTS } from '../../src/presentation/i18n/frContent.js';
import { dialogueCommandForKey, dialogueView } from '../../src/presentation/ui/dialogueView.js';
import { InspectionController } from '../../src/presentation/ui/InspectionController.js';
import { journalView } from '../../src/presentation/ui/journalView.js';
import { NotificationQueue } from '../../src/presentation/ui/NotificationQueue.js';
import { WindowsController } from '../../src/presentation/ui/WindowsController.js';
import { createTestGame, makeMap } from '../helpers/testGame.js';

/** Aldric tel que dans la vallée, en (1232, 2896) ; le joueur à la position donnée. */
function withAldric(position) {
  return createTestGame({
    map: { columns: 160, rows: 120 },
    npcs: [{ id: 'aldric', position: { x: 1232, y: 2896 } }],
    player: { position },
  });
}

describe('R-IHM-INS-005 · Désigner un PNJ', () => {
  it("ex.1 — clic en (1230, 2880), sur le sprite d'Aldric : Aldric est désigné", () => {
    const aldric = {
      npcId: 'aldric',
      footY: 2896,
      sprite: { left: 1216, right: 1248, top: 2864, bottom: 2896 },
    };

    const target = designateTile({
      point: { x: 1230, y: 2880 },
      elements: [aldric],
      map: makeMap({ columns: 160, rows: 120 }),
    });

    assert.deepEqual(target, { npcId: 'aldric' });
  });

  it("ex.2 — la fenêtre affiche « Aldric, l'ermite » et « Parler »", () => {
    const { game } = withAldric({ x: 1232, y: 2936 });
    const controller = new InspectionController();

    controller.designate({ npcId: 'aldric' }, game);

    const view = controller.view(game);
    assert.deepEqual(
      [view.title, view.action, view.button],
      ["Aldric, l'ermite", 'Parler', 'Parler'],
    );
  });

  it('ex.3 — à 100 px : bouton inactif et « Trop loin : approchez-vous »', () => {
    const { game } = withAldric({ x: 1232, y: 2996 });
    const controller = new InspectionController();

    controller.designate({ npcId: 'aldric' }, game);

    const view = controller.view(game);
    assert.equal(view.isActionEnabled, false);
    assert.equal(view.warning, 'Trop loin : approchez-vous');
  });

  it('ex.4 — à 40 px, clic sur « Parler » : le dialogue commence, la fenêtre est fermée', () => {
    const { game, state } = withAldric({ x: 1232, y: 2936 });
    const controller = new InspectionController();
    controller.designate({ npcId: 'aldric' }, game);

    controller.confirm(game);

    assert.deepEqual([state.dialogue?.npcId, state.dialogue?.page], ['aldric', 0]);
    assert.equal(controller.isOpen, false);
  });
});

describe('R-IHM-DIA-001 · Boîte de dialogue', () => {
  it("ex.1 — page 1 sur 3 : nom d'Aldric, texte de la page 1 et « ▼ »", () => {
    assert.deepEqual(dialogueView({ npcId: 'aldric', page: 0 }), {
      speaker: "Aldric, l'ermite",
      text: CONTENT_TEXTS.pages['aldric-1'],
      more: '▼',
    });
  });

  it('ex.2 — page 3 sur 3 : texte de la page 3, sans « ▼ »', () => {
    const view = dialogueView({ npcId: 'aldric', page: 2 });

    assert.equal(view.text, CONTENT_TEXTS.pages['aldric-3']);
    assert.equal(view.more, undefined);
  });

  it('ex.3 — touche Espace : la page 2 est affichée', () => {
    const { game, state } = withAldric({ x: 1232, y: 2936 });
    game.execute(talkTo('aldric'));

    game.execute(dialogueCommandForKey(' '));

    assert.equal(dialogueView(state.dialogue).text, CONTENT_TEXTS.pages['aldric-2']);
  });

  it('ex.4 — touche Échap : le dialogue est terminé, la boîte disparaît', () => {
    const { game, state } = withAldric({ x: 1232, y: 2936 });
    game.execute(talkTo('aldric'));

    game.execute(dialogueCommandForKey('Escape'));

    assert.equal(dialogueView(state.dialogue), undefined);
  });
});

describe('R-IHM-JRN-001 · Journal des lieux', () => {
  it("ex.1 — journal vide : « Aucun lieu pour l'instant. »", () => {
    const view = journalView([]);

    assert.deepEqual(view.lines, []);
    assert.equal(view.empty, "Aucun lieu pour l'instant.");
  });

  it("ex.2 — le Vallon découvert, puis un indice d'Aldric sur les Ruines du Guet", () => {
    const view = journalView([
      { placeId: 'vale', status: 'discovered' },
      {
        placeId: 'watchtower-ruins',
        status: 'rumored',
        hint: { npcId: 'aldric', pageId: 'aldric-2' },
      },
    ]);

    assert.deepEqual(view.lines, [
      { place: 'Le Vallon', status: 'Découvert', hint: undefined },
      {
        place: 'Les Ruines du Guet',
        status: "Indice d'Aldric",
        hint: `« ${CONTENT_TEXTS.pages['aldric-2']} »`,
      },
    ]);
  });

  it('ex.3 — journal ouvert, touche J : le journal est fermé', () => {
    const windows = new WindowsController();
    windows.handleKey('j');

    windows.handleKey('J');

    assert.equal(windows.journalOpen, false);
  });
});

describe('R-IHM-NOT-001 · Notifications', () => {
  it('ex.1 — affichée du tick 100 au tick 339, disparue au tick 340', () => {
    const queue = new NotificationQueue(240);
    queue.push('Lieu découvert : Le Vallon', 100);

    assert.deepEqual(queue.visible(100), ['Lieu découvert : Le Vallon']);
    assert.deepEqual(queue.visible(339), ['Lieu découvert : Le Vallon']);
    assert.deepEqual(queue.visible(340), []);
  });

  it('ex.2 — deux notifications : les deux affichées, la plus récente en bas', () => {
    const queue = new NotificationQueue(240);
    queue.push('Lieu découvert : Le Vallon', 100);

    queue.push('Nouvel indice : Les Ruines du Guet', 150);

    assert.deepEqual(queue.visible(150), [
      'Lieu découvert : Le Vallon',
      'Nouvel indice : Les Ruines du Guet',
    ]);
  });
});
