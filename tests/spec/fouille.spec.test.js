import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../../src/core/Game.js';
import { CONTENT_TEXTS } from '../../src/presentation/i18n/frContent.js';
import { findingsMessages } from '../../src/presentation/ui/findingsMessages.js';
import { InspectionController } from '../../src/presentation/ui/InspectionController.js';
import { journalView } from '../../src/presentation/ui/journalView.js';
import { createTestGame, searchAt } from '../helpers/testGame.js';

/** Juste au sud de la tuile (7, 6) (centre (240, 208)) : distance 28 px, à portée. */
const SOUTH = { x: 240, y: 236 };

/** Partie avec un élément à fouiller sur la tuile (7, 6) et, en option, sa cachette. */
function withElement(tile, { content, position = SOUTH, ...options } = {}) {
  const searchSpots = content === undefined ? [] : [{ column: 7, row: 6, tile, ...content }];
  return createTestGame({
    map: { tiles: [[7, 6, tile]] },
    player: { position },
    searchSpots,
    ...options,
  });
}

describe('R-RES-FOU-001 · Éléments à fouiller', () => {
  const canSearch = (tile) =>
    withElement(tile).game.inspect({ column: 7, row: 6 }).search !== undefined;

  it('ex.1 — une bibliothèque en ruine se fouille', () => {
    assert.equal(canSearch('ruin-bookshelf'), true);
  });

  it('ex.2 — un coffre ancien se fouille', () => {
    assert.equal(canSearch('ruin-chest'), true);
  });

  it('ex.3 — une caisse se fouille', () => {
    assert.equal(canSearch('ruin-crate'), true);
  });

  it('ex.4 — un arbre ne se fouille pas', () => {
    assert.equal(canSearch('tree'), false);
  });
});

describe('R-RES-FOU-002 · Portée de fouille', () => {
  it('ex.1 — le joueur en (240, 236) : fouille acceptée', () => {
    const { game } = withElement('ruin-chest');

    assert.deepEqual(searchAt(game, 7, 6), { ok: true });
  });

  it('ex.2 — le joueur en (240, 257), à 49 px : refus OUT_OF_REACH', () => {
    const { game } = withElement('ruin-chest', { position: { x: 240, y: 257 } });

    assert.deepEqual(searchAt(game, 7, 6), { ok: false, reason: 'OUT_OF_REACH' });
  });
});

describe("R-RES-FOU-003 · Contenu d'une cachette", () => {
  const withBookAndFlint = (options = {}) =>
    withElement('ruin-bookshelf', {
      content: { books: ['le-tailleur'], resources: { flint: 2 } },
      ...options,
    });

  it("ex.1 — un livre et 2 silex : ils rejoignent la bibliothèque et l'inventaire", () => {
    const { game, state } = withBookAndFlint();

    searchAt(game, 7, 6);

    assert.deepEqual(state.books, ['le-tailleur']);
    assert.equal(state.inventory.flint, 2);
  });

  it('ex.2 — un coffre sans contenu défini : rien ne change', () => {
    const { game, state } = withElement('ruin-chest');
    const inventory = { ...state.inventory };

    assert.deepEqual(searchAt(game, 7, 6), { ok: true });
    assert.deepEqual(state.books, []);
    assert.deepEqual(state.inventory, inventory);
  });

  it('ex.4 — une cachette avec la poupée : le joueur la possède', () => {
    const { game, state } = withElement('ruin-chest', {
      content: { books: [], items: ['blue-doll'], resources: {} },
    });

    searchAt(game, 7, 6);

    assert.deepEqual(state.items, ['blue-doll']);
  });

  it("ex.3 — un livre déjà possédé n'est pas ajouté une seconde fois", () => {
    const { game, state } = withBookAndFlint({ books: ['le-tailleur'] });

    searchAt(game, 7, 6);

    assert.deepEqual(state.books, ['le-tailleur']);
  });
});

describe('R-RES-FOU-004 · Une seule fouille', () => {
  it('ex.1 — un coffre ancien fouillé devient un coffre ouvert, infranchissable', () => {
    const { game, state } = withElement('ruin-chest');

    searchAt(game, 7, 6);

    assert.equal(state.map.tileIdAt(7, 6), 'ruin-chest-open');
    assert.equal(state.map.isBlocking(7, 6), true);
  });

  it('ex.2 — un coffre ouvert : refus NOTHING_TO_SEARCH', () => {
    const { game } = withElement('ruin-chest-open');

    assert.deepEqual(searchAt(game, 7, 6), { ok: false, reason: 'NOTHING_TO_SEARCH' });
  });

  it("ex.3 — de l'herbe : refus NOTHING_TO_SEARCH", () => {
    const { game } = withElement('grass');

    assert.deepEqual(searchAt(game, 7, 6), { ok: false, reason: 'NOTHING_TO_SEARCH' });
  });

  it('ex.4 — une caisse hors de portée : refus OUT_OF_REACH, la caisse est intacte', () => {
    const { game, state } = withElement('ruin-crate', { position: { x: 600, y: 600 } });

    assert.deepEqual(searchAt(game, 7, 6), { ok: false, reason: 'OUT_OF_REACH' });
    assert.equal(state.map.tileIdAt(7, 6), 'ruin-crate');
  });
});

describe('R-INV-LIV-001 · Bibliothèque du joueur', () => {
  it('ex.1 — une nouvelle partie commence sans livre', () => {
    assert.deepEqual(Game.create().getState().books, []);
  });

  it("ex.2 — « carnet » possédé, « le-tailleur » trouvé : dans l'ordre", () => {
    const { game, state } = withElement('ruin-bookshelf', {
      content: { books: ['le-tailleur'], resources: {} },
      books: ['carnet'],
    });

    searchAt(game, 7, 6);

    assert.deepEqual(state.books, ['carnet', 'le-tailleur']);
  });
});

describe('R-IHM-INS-006 · Désigner un élément à fouiller', () => {
  const open = (tile, position = SOUTH) => {
    const { game, state } = withElement(tile, { position });
    const controller = new InspectionController();
    controller.designate({ column: 7, row: 6 }, game);
    return { game, state, controller };
  };

  it('ex.1 — une bibliothèque en ruine : « Bibliothèque en ruine », « Fouiller »', () => {
    const { game, controller } = open('ruin-bookshelf');

    const view = controller.view(game);

    assert.deepEqual(
      [view.title, view.action, view.button],
      ['Bibliothèque en ruine', 'Fouiller', 'Fouiller'],
    );
  });

  it('ex.2 — un coffre hors de portée : bouton inactif, « Trop loin : approchez-vous »', () => {
    const { game, controller } = open('ruin-chest', { x: 240, y: 400 });

    const view = controller.view(game);

    assert.equal(view.isActionEnabled, false);
    assert.equal(view.warning, 'Trop loin : approchez-vous');
  });

  it('ex.3 — un coffre à portée, clic sur « Fouiller » : fouillé, fenêtre fermée', () => {
    const { game, state, controller } = open('ruin-chest');

    controller.confirm(game);

    assert.equal(state.map.tileIdAt(7, 6), 'ruin-chest-open');
    assert.equal(controller.isOpen, false);
  });

  it('ex.4 — un coffre déjà fouillé : la fenêtre reste fermée', () => {
    const { controller } = open('ruin-chest-open');

    assert.equal(controller.isOpen, false);
  });
});

describe('R-IHM-NOT-002 · Trouvailles', () => {
  it('ex.1 — un livre et 2 silex : deux notifications', () => {
    assert.deepEqual(findingsMessages({ books: ['flint-knapping'], resources: { flint: 2 } }), [
      'Livre trouvé : Le Tailleur de silex',
      'Trouvé : 2 silex',
    ]);
  });

  it('ex.2 — 3 branches et 1 fibre : « Trouvé : 3 branches, 1 fibre »', () => {
    assert.deepEqual(findingsMessages({ books: [], resources: { fiber: 1, branch: 3 } }), [
      'Trouvé : 3 branches, 1 fibre',
    ]);
  });

  it("ex.3 — une cachette vide : « Rien d'intéressant. »", () => {
    assert.deepEqual(findingsMessages({ books: [], resources: {} }), ["Rien d'intéressant."]);
  });

  it('ex.4 — la poupée et 2 silex : « Objet trouvé » puis « Trouvé : 2 silex »', () => {
    assert.deepEqual(
      findingsMessages({ books: [], items: ['blue-doll'], resources: { flint: 2 } }),
      ['Objet trouvé : Poupée de chiffon bleue', 'Trouvé : 2 silex'],
    );
  });
});

describe('R-IHM-JRN-002 · Livres au journal', () => {
  it("ex.1 — aucun livre : « Aucun livre pour l'instant. »", () => {
    const view = journalView([], []);

    assert.deepEqual(view.books, []);
    assert.equal(view.noBook, "Aucun livre pour l'instant.");
  });

  it('ex.2 — « Le Tailleur de silex » : titre, texte et plans', () => {
    const [book] = journalView([], ['flint-knapping']).books;

    assert.equal(book.title, 'Le Tailleur de silex');
    assert.equal(book.text, CONTENT_TEXTS.books['flint-knapping'].text);
    assert.equal(book.plans, 'Plans : hache en silex, pioche en silex');
  });
});
