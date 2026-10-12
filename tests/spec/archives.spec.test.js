import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readBook } from '../../src/core/commands/commands.js';
import { bookView } from '../../src/presentation/ui/bookView.js';
import { hudEntries } from '../../src/presentation/ui/inventoryEntries.js';
import { inventoryView } from '../../src/presentation/ui/inventoryView.js';
import { journalView } from '../../src/presentation/ui/journalView.js';
import { WindowsController } from '../../src/presentation/ui/WindowsController.js';
import { createTestGame } from '../helpers/testGame.js';

describe('R-IHM-HUD-003 · Santé et faim au bandeau', () => {
  it("ex.3 — 12 bois : le bandeau n'affiche aucune ressource", () => {
    const { game, state } = createTestGame({ inventory: { wood: 12 } });

    const entries = hudEntries(state, game.time());

    assert.deepEqual(
      entries.map(({ id }) => id),
      ['health', 'hunger', 'energy', 'experience', 'clock'],
    );
  });
});

describe('R-INV-LIV-002 · Lire un livre', () => {
  it('ex.7 — « Le Tailleur de silex » jamais lu, lu : rangé aux archives', () => {
    const { game, state } = createTestGame({ books: ['flint-knapping'] });

    game.execute(readBook('flint-knapping'));

    assert.deepEqual(state.readBooks, ['flint-knapping']);
  });
});

describe("R-IHM-INV-001 · Fenêtre d'inventaire", () => {
  it('ex.13 — « Le Tailleur de silex » lu, onglet « Livres » : « Aucun livre à lire. »', () => {
    const { state } = createTestGame({
      books: ['flint-knapping'],
      readBooks: ['flint-knapping'],
    });

    const view = inventoryView(state, undefined, 'books');

    assert.deepEqual(view.books, []);
    assert.equal(view.noBook, 'Aucun livre à lire.');
  });
});

describe('R-IHM-JRN-004 · Archives du journal', () => {
  it('ex.1 — aucun livre lu : « Aucun livre archivé. »', () => {
    const view = journalView([], [], []);

    assert.deepEqual(view.archives, []);
    assert.equal(view.noArchive, 'Aucun livre archivé.');
  });

  it('ex.2 — « Le Tailleur de silex » lu : son titre et « Relire »', () => {
    const view = journalView([], [], ['flint-knapping']);

    assert.deepEqual(
      view.archives.map(({ title, button }) => [title, button]),
      [['Le Tailleur de silex', 'Relire']],
    );
    assert.equal(view.noArchive, undefined);
  });

  it('ex.3 — clic sur « Relire » : la fenêtre de lecture affiche « Le Tailleur de silex »', () => {
    const { game } = createTestGame({ books: ['flint-knapping'], readBooks: ['flint-knapping'] });
    const windows = new WindowsController();
    windows.toggle('journal');

    windows.read('flint-knapping', game);

    assert.equal(windows.open, 'book');
    assert.equal(bookView(windows.bookId).title, 'Le Tailleur de silex');
  });
});
