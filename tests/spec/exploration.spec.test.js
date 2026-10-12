import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { endDialogue, nextPage, talkTo } from '../../src/core/commands/commands.js';
import { Game } from '../../src/core/Game.js';
import { isInPlace } from '../../src/core/systems/discoverPlaces.js';
import { createTestGame, makeMap, walk } from '../helpers/testGame.js';

/** Un lieu de 5 × 4 tuiles dont le coin est la tuile (10, 10). */
const PLACE = { id: 'test-place', area: { column: 10, row: 10, width: 5, height: 4 } };

/** Dialogue d'essai : 3 pages, la page 2 donne un indice sur le lieu d'essai. */
const TEST_NPCS = {
  aldric: {
    id: 'aldric',
    sheet: 'villager-blond',
    tile: { column: 0, row: 0 },
    facing: 'left',
    pages: [{ id: 'aldric-1' }, { id: 'aldric-2', reveals: 'test-place' }, { id: 'aldric-3' }],
  },
};

/** Partie avec Aldric en (300, 300) et le joueur à la position donnée. */
function withAldric(position = { x: 300, y: 340 }, options = {}) {
  return createTestGame({
    npcs: [{ id: 'aldric', position: { x: 300, y: 300 }, facing: 'left' }],
    npcDefinitions: TEST_NPCS,
    places: { 'test-place': PLACE },
    player: { position },
    ...options,
  });
}

describe('R-MON-CAR-001 · Carte de la vallée', () => {
  it('ex.5 — une carte de 160 × 120 tuiles de 32 px fait 5120 × 3840 px', () => {
    const map = makeMap({ columns: 160, rows: 120 });

    assert.deepEqual({ width: map.widthPx, height: map.heightPx }, { width: 5120, height: 3840 });
  });
});

describe('R-MON-LIE-001 · Lieux nommés', () => {
  const inPlace = (x, y) => isInPlace(PLACE, { x, y }, 32);

  it('ex.1 — le point (330, 330), tuile (10, 10), appartient au lieu', () => {
    assert.equal(inPlace(330, 330), true);
  });

  it('ex.2 — le point (479, 330), tuile (14, 10), appartient au lieu', () => {
    assert.equal(inPlace(479, 330), true);
  });

  it("ex.3 — le point (480, 330), tuile (15, 10), n'appartient pas au lieu", () => {
    assert.equal(inPlace(480, 330), false);
  });

  it("ex.4 — le point (330, 448), tuile (10, 14), n'appartient pas au lieu", () => {
    assert.equal(inPlace(330, 448), false);
  });
});

describe("R-MON-LIE-002 · Découverte d'un lieu", () => {
  const nearPlace = (options = {}) =>
    createTestGame({
      places: { 'test-place': PLACE },
      player: { position: { x: 310, y: 340 } }, // tuile (9, 10), juste à gauche du lieu
      ...options,
    });

  it('ex.1 — le joueur entre dans le lieu : il est découvert et entre au journal', () => {
    const { game, state } = nearPlace();

    walk(game, 'droite', 10);

    assert.deepEqual(state.journal, [{ placeId: 'test-place', status: 'discovered' }]);
  });

  it('ex.2 — en sortir et y revenir ne le découvre pas une seconde fois', () => {
    const { game, state } = nearPlace();
    walk(game, 'droite', 10);
    walk(game, 'gauche', 20);
    const discoveries = [];
    game.events.on('place-discovered', (payload) => discoveries.push(payload));

    walk(game, 'droite', 20);

    assert.equal(state.journal.length, 1);
    assert.deepEqual(discoveries, []);
  });

  it('ex.3 — un lieu noté comme indice devient découvert, à la même place, avec son indice', () => {
    const hint = { npcId: 'aldric', pageId: 'aldric-2' };
    const { game, state } = nearPlace({
      journal: [
        { placeId: 'other', status: 'discovered' },
        { placeId: 'test-place', status: 'rumored', hint },
      ],
    });

    walk(game, 'droite', 10);

    assert.deepEqual(state.journal[1], { placeId: 'test-place', status: 'discovered', hint });
  });

  it('ex.4 — une nouvelle partie : après 1 tick, le Vallon est découvert', () => {
    const game = Game.create();

    game.advanceTicks(1);

    assert.deepEqual(game.getState().journal, [{ placeId: 'vale', status: 'discovered' }]);
  });
});

describe('R-MON-LIE-003 · Retour dans un lieu', () => {
  const nearPlace = (journal = []) => {
    const { game, state } = createTestGame({
      places: { 'test-place': PLACE },
      player: { position: { x: 310, y: 340 } }, // tuile (9, 10), juste à gauche du lieu
      journal,
    });
    const entered = [];
    game.events.on('place-entered', ({ placeId }) => entered.push(placeId));
    return { game, state, entered };
  };
  const DISCOVERED = [{ placeId: 'test-place', status: 'discovered' }];

  it('ex.1 — le lieu découvert, le joueur y entre : il est annoncé', () => {
    const { game, entered } = nearPlace(DISCOVERED);

    walk(game, 'droite', 10);

    assert.deepEqual(entered, ['test-place']);
  });

  it('ex.2 — un lieu jamais découvert : découvert, pas annoncé comme un retour', () => {
    const { game, state, entered } = nearPlace();

    walk(game, 'droite', 10);

    assert.deepEqual(state.journal, DISCOVERED);
    assert.deepEqual(entered, []);
  });

  it("ex.3 — déjà dans le lieu, un pas de plus : rien n'est annoncé", () => {
    const { game, entered } = nearPlace(DISCOVERED);
    walk(game, 'droite', 10);
    entered.length = 0;

    walk(game, 'droite', 1);

    assert.deepEqual(entered, []);
  });
});

describe("R-PNJ-POS-001 · Position d'un PNJ", () => {
  it('ex.1 — Aldric est au centre de sa tuile (38, 90), orienté vers le bas', () => {
    const aldric = Game.create()
      .getState()
      .npcs.find((npc) => npc.id === 'aldric');

    assert.deepEqual(aldric, { id: 'aldric', position: { x: 1232, y: 2896 }, facing: 'down' });
  });

  it("ex.2 — 600 ticks plus tard, Aldric n'a pas bougé", () => {
    const game = Game.create();

    game.advanceTicks(600);

    const aldric = game.getState().npcs.find((npc) => npc.id === 'aldric');
    assert.deepEqual(aldric.position, { x: 1232, y: 2896 });
  });
});

describe('R-PNJ-POS-002 · Un PNJ est un obstacle', () => {
  const withNpcAt300 = (position) =>
    createTestGame({
      npcs: [{ id: 'aldric', position: { x: 300, y: 200 } }],
      player: { position },
    });

  it('ex.1 — vers la droite depuis (270, 200) : arrêt en (280, 200), au contact', () => {
    const { game, state } = withNpcAt300({ x: 270, y: 200 });

    walk(game, 'droite', 10);

    assert.deepEqual(state.player.position, { x: 280, y: 200 });
  });

  it('ex.2 — depuis (270, 220), il passe sous le PNJ : (285, 220)', () => {
    const { game, state } = withNpcAt300({ x: 270, y: 220 });

    walk(game, 'droite', 10);

    assert.deepEqual(state.player.position, { x: 285, y: 220 });
  });
});

describe('R-PNJ-DIA-001 · Engager la conversation', () => {
  it('ex.1 — au sud, à 40 px : le dialogue commence page 1, Aldric se tourne vers le bas', () => {
    const { game, state } = withAldric({ x: 300, y: 340 });

    const result = game.execute(talkTo('aldric'));

    assert.deepEqual(result, { ok: true });
    assert.deepEqual([state.dialogue?.npcId, state.dialogue?.page], ['aldric', 0]);
    assert.equal(state.npcs[0].facing, 'down');
  });

  it("ex.2 — à 64 px à l'est : le dialogue commence, Aldric se tourne vers la droite", () => {
    const { game, state } = withAldric({ x: 364, y: 300 });

    assert.deepEqual(game.execute(talkTo('aldric')), { ok: true });
    assert.equal(state.npcs[0].facing, 'right');
  });

  it('ex.3 — à 65 px : refus OUT_OF_REACH', () => {
    const { game, state } = withAldric({ x: 365, y: 300 });

    assert.deepEqual(game.execute(talkTo('aldric')), { ok: false, reason: 'OUT_OF_REACH' });
    assert.equal(state.dialogue, undefined);
  });

  it('ex.4 — un PNJ inconnu : refus NOBODY_TO_TALK_TO', () => {
    const { game } = withAldric();

    assert.deepEqual(game.execute(talkTo('personne')), {
      ok: false,
      reason: 'NOBODY_TO_TALK_TO',
    });
  });

  it('ex.5 — un dialogue déjà en cours : refus ALREADY_TALKING', () => {
    const { game } = withAldric();
    game.execute(talkTo('aldric'));

    assert.deepEqual(game.execute(talkTo('aldric')), { ok: false, reason: 'ALREADY_TALKING' });
  });
});

describe('R-PNJ-DIA-002 · Pages du dialogue', () => {
  it('ex.1 — page 1, page suivante : page 2', () => {
    const { game, state } = withAldric();
    game.execute(talkTo('aldric'));

    game.execute(nextPage());

    assert.equal(state.dialogue.page, 1);
  });

  it('ex.2 — page 3, page suivante : le dialogue est terminé', () => {
    const { game, state } = withAldric();
    game.execute(talkTo('aldric'));
    game.execute(nextPage());
    game.execute(nextPage());

    assert.deepEqual(game.execute(nextPage()), { ok: true });
    assert.equal(state.dialogue, undefined);
  });

  it('ex.3 — page 1, terminer : le dialogue est terminé', () => {
    const { game, state } = withAldric();
    game.execute(talkTo('aldric'));

    game.execute(endDialogue());

    assert.equal(state.dialogue, undefined);
  });

  it('ex.4 — sans dialogue, page suivante : refus NO_DIALOGUE', () => {
    const { game } = withAldric();

    assert.deepEqual(game.execute(nextPage()), { ok: false, reason: 'NO_DIALOGUE' });
  });
});

describe('R-PNJ-DIA-003 · Immobile pendant un dialogue', () => {
  it("ex.1 — pendant un dialogue, 10 ticks à droite : le joueur n'a pas bougé et ne marche pas", () => {
    const { game, state } = withAldric({ x: 300, y: 340 });
    game.execute(talkTo('aldric'));

    walk(game, 'droite', 10);

    assert.deepEqual(state.player.position, { x: 300, y: 340 });
    assert.equal(state.player.isWalking, false);
  });

  it('ex.2 — le dialogue terminé, 10 ticks à droite : le joueur avance de 15 px', () => {
    const { game, state } = withAldric({ x: 300, y: 340 });
    game.execute(talkTo('aldric'));
    game.execute(endDialogue());

    walk(game, 'droite', 10);

    assert.deepEqual(state.player.position, { x: 315, y: 340 });
  });
});

describe('R-PNJ-DIA-004 · Indices', () => {
  it("ex.1 — la page 2 d'Aldric devient la page en cours : l'indice entre au journal", () => {
    const { game, state } = withAldric();
    game.execute(talkTo('aldric'));

    game.execute(nextPage());

    assert.deepEqual(state.journal, [
      { placeId: 'test-place', status: 'rumored', hint: { npcId: 'aldric', pageId: 'aldric-2' } },
    ]);
  });

  it('ex.2 — le lieu déjà découvert : le journal ne change pas', () => {
    const discovered = [{ placeId: 'test-place', status: 'discovered' }];
    const { game, state } = withAldric(undefined, { journal: discovered });
    game.execute(talkTo('aldric'));

    game.execute(nextPage());

    assert.deepEqual(state.journal, discovered);
  });

  it('ex.3 — reparler à Aldric et relire la page 2 : pas de doublon', () => {
    const { game, state } = withAldric();
    game.execute(talkTo('aldric'));
    game.execute(nextPage());
    game.execute(endDialogue());
    game.execute(talkTo('aldric'));

    game.execute(nextPage());

    assert.equal(state.journal.length, 1);
  });

  it('ex.4 — la page 1, sans indice : le journal ne change pas', () => {
    const { game, state } = withAldric();

    game.execute(talkTo('aldric'));

    assert.deepEqual(state.journal, []);
  });
});
