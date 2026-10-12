import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { GAME_EVENTS } from '../../src/core/events/gameEvents.js';
import { CONTENT_TEXTS } from '../../src/presentation/i18n/frContent.js';
import { bookView } from '../../src/presentation/ui/bookView.js';
import { craftedMessage, learnedMessages } from '../../src/presentation/ui/craftingMessages.js';
import { craftView } from '../../src/presentation/ui/craftView.js';
import { InspectionController } from '../../src/presentation/ui/InspectionController.js';
import { inventoryView } from '../../src/presentation/ui/inventoryView.js';
import { toolbarView } from '../../src/presentation/ui/toolbarView.js';
import { WindowsController } from '../../src/presentation/ui/WindowsController.js';
import { createTestGame } from '../helpers/testGame.js';

/** Juste au sud de la tuile (7, 6) : à portée. */
const SOUTH = { x: 240, y: 236 };

describe('R-IHM-INS-007 · Outil manquant', () => {
  const viewOf = (tile, { tools = [], position = SOUTH } = {}) => {
    const { game } = createTestGame({
      map: { tiles: [[7, 6, tile]] },
      player: { position },
      tools,
    });
    const controller = new InspectionController();
    controller.designate({ column: 7, row: 6 }, game);
    return controller.view(game);
  };

  it('ex.1 — aucun outil, un arbre à portée : « Il faut une hache »', () => {
    const view = viewOf('tree');

    assert.equal(view.action, 'Couper : 3 bois');
    assert.equal(view.isActionEnabled, false);
    assert.equal(view.warning, 'Il faut une hache');
  });

  it('ex.2 — aucun outil, un rocher hors de portée : « Il faut une pioche »', () => {
    const view = viewOf('rock', { position: { x: 240, y: 400 } });

    assert.equal(view.isActionEnabled, false);
    assert.equal(view.warning, 'Il faut une pioche');
  });

  it('ex.3 — la hache en silex, un arbre à portée : bouton actif', () => {
    assert.equal(viewOf('tree', { tools: ['flint-axe'] }).isActionEnabled, true);
  });

  it('ex.4 — aucun outil, des fleurs à portée : bouton actif', () => {
    assert.equal(viewOf('flowers').isActionEnabled, true);
  });
});

describe('R-IHM-FEN-001 · Une fenêtre à la fois', () => {
  const setup = () => {
    const { game } = createTestGame({
      map: { tiles: [[7, 6, 'tree']] },
      player: { position: SOUTH },
    });
    return { game, windows: new WindowsController() };
  };

  it("ex.1 — l'inventaire ouvert, touche C : l'artisanat remplace l'inventaire", () => {
    const { windows } = setup();
    windows.handleKey('i');

    windows.handleKey('c');

    assert.equal(windows.open, 'craft');
  });

  it("ex.2 — la fenêtre d'information ouverte, touche I : l'inventaire la remplace", () => {
    const { game, windows } = setup();
    windows.designate({ column: 7, row: 6 }, game);
    assert.equal(windows.open, 'inspection');

    windows.handleKey('i');

    assert.equal(windows.open, 'inventory');
    assert.equal(windows.inspection.isOpen, false);
  });

  it("ex.3 — l'artisanat ouvert, on désigne un arbre : la fenêtre d'information le remplace", () => {
    const { game, windows } = setup();
    windows.handleKey('c');

    windows.designate({ column: 7, row: 6 }, game);

    assert.equal(windows.open, 'inspection');
  });

  it("ex.4 — l'artisanat ouvert, touche Échap : aucune fenêtre", () => {
    const { windows } = setup();
    windows.handleKey('c');

    assert.equal(windows.handleKey('Escape'), true);
    assert.equal(windows.open, undefined);
  });

  it("ex.5 — le journal ouvert, touche I : l'inventaire remplace le journal", () => {
    const { windows } = setup();
    windows.handleKey('j');

    windows.handleKey('i');

    assert.equal(windows.open, 'inventory');
    assert.equal(windows.journalOpen, false);
  });

  it("ex.6 — l'inventaire ouvert, clic sur « Journal » : le journal remplace l'inventaire", () => {
    const { windows } = setup();
    windows.toggle('inventory');

    windows.toggle('journal');

    assert.equal(windows.open, 'journal');
    assert.equal(windows.journalOpen, true);
  });
});

describe("R-IHM-INV-001 · Fenêtre d'inventaire", () => {
  it('ex.1 — une nouvelle partie, touche I : six ressources à 0, ni outil ni livre', () => {
    const { state } = createTestGame({ tools: [] });
    const windows = new WindowsController();

    windows.handleKey('I');
    const view = inventoryView(state);

    assert.equal(windows.open, 'inventory');
    assert.deepEqual(
      view.resources.map(({ label, amount }) => `${label} ${amount}`),
      ['Bois 0', 'Pierre 0', 'Fleurs 0', 'Silex 0', 'Branches 0', 'Fibres 0'],
    );
    assert.equal(view.noTool, 'Aucun outil.');
    assert.equal(view.noBook, "Aucun livre pour l'instant.");
    assert.equal(view.noItem, 'Aucun objet.');
  });

  it('ex.2 — la hache en silex possédée : « Hache en silex »', () => {
    const { state } = createTestGame({ tools: ['flint-axe'] });

    assert.deepEqual(
      inventoryView(state).tools.map((tool) => tool.name),
      ['Hache en silex'],
    );
  });

  it('ex.3 — « Le Tailleur de silex » trouvé : son titre et un bouton « Lire »', () => {
    const view = inventoryView(createTestGame({ books: ['flint-knapping'] }).state);

    assert.deepEqual(
      view.books.map((book) => book.title),
      ['Le Tailleur de silex'],
    );
    assert.equal(view.readButton, 'Lire');
  });

  it('ex.5 — la poupée possédée : « Objets » affiche « Poupée de chiffon bleue »', () => {
    const view = inventoryView(createTestGame({ items: ['blue-doll'] }).state);

    assert.deepEqual(
      view.items.map((item) => item.name),
      ['Poupée de chiffon bleue'],
    );
  });

  it('ex.4 — la fenêtre ouverte, touche I : elle se ferme', () => {
    const windows = new WindowsController();
    windows.handleKey('i');

    windows.handleKey('i');

    assert.equal(windows.open, undefined);
  });
});

describe('R-IHM-LIV-001 · Lire un livre', () => {
  const reading = (knownRecipes = []) => {
    const { game } = createTestGame({ books: ['flint-knapping'], knownRecipes });
    const notifications = [];
    game.events.on(GAME_EVENTS.BOOK_READ, ({ recipes }) =>
      notifications.push(...learnedMessages(recipes)),
    );
    const windows = new WindowsController();
    windows.handleKey('i');
    windows.read('flint-knapping', game);
    return { windows, notifications };
  };

  it('ex.1 — jamais lu, clic sur « Lire » : titre, texte, recettes et deux notifications', () => {
    const { windows, notifications } = reading();
    const view = bookView(windows.bookId);

    assert.equal(windows.open, 'book');
    assert.equal(view.title, 'Le Tailleur de silex');
    assert.equal(view.text, CONTENT_TEXTS.books['flint-knapping'].text);
    assert.equal(view.recipes, 'Recettes : hache en silex, pioche en silex');
    assert.deepEqual(notifications, [
      'Recette apprise : hache en silex',
      'Recette apprise : pioche en silex',
    ]);
  });

  it('ex.2 — déjà lu, clic sur « Lire » : la fenêtre est ouverte, aucune notification', () => {
    const { windows, notifications } = reading(['flint-axe', 'flint-pickaxe']);

    assert.equal(windows.open, 'book');
    assert.deepEqual(notifications, []);
  });

  it('ex.3 — la fenêtre de lecture ouverte, touche Échap : elle se ferme', () => {
    const { windows } = reading();

    windows.handleKey('Escape');

    assert.equal(windows.open, undefined);
  });
});

describe("R-IHM-ART-001 · Fenêtre d'artisanat", () => {
  const EMPTY = 'Aucune recette connue : lisez des livres pour en apprendre.';
  const craftGame = ({ knownRecipes = ['flint-axe'], inventory, tools = [] } = {}) =>
    createTestGame({ knownRecipes, inventory, tools }).game;

  it('ex.1 — aucune recette connue : message', () => {
    const view = craftView(craftGame({ knownRecipes: [] }));

    assert.deepEqual(view.entries, []);
    assert.equal(view.empty, EMPTY);
  });

  it('ex.2 — 2 silex, 1 branche, 1 fibre : bouton inactif, « Il manque : 1 branche »', () => {
    const [entry] = craftView(craftGame({ inventory: { flint: 2, branch: 1, fiber: 1 } })).entries;

    assert.equal(entry.name, 'Hache en silex');
    assert.equal(entry.ingredients, 'Silex 2/1 · Branches 1/2 · Fibres 1/1');
    assert.equal(entry.button, 'Fabriquer');
    assert.equal(entry.isEnabled, false);
    assert.equal(entry.warning, 'Il manque : 1 branche');
  });

  it('ex.3 — les ingrédients exacts, clic sur « Fabriquer » : hache et notification', () => {
    const game = craftGame({ inventory: { flint: 1, branch: 2, fiber: 1 } });
    const notifications = [];
    game.events.on(GAME_EVENTS.ITEM_CRAFTED, ({ tool }) =>
      notifications.push(craftedMessage(tool)),
    );
    const windows = new WindowsController();
    windows.handleKey('c');

    assert.equal(craftView(game).entries[0].isEnabled, true);
    windows.craft('flint-axe', game);

    assert.deepEqual(game.getState().tools, ['flint-axe']);
    assert.deepEqual(notifications, ['Fabriqué : hache en silex']);
  });

  it('ex.4 — la hache déjà possédée : bouton inactif, « Déjà possédé »', () => {
    const [entry] = craftView(
      craftGame({ tools: ['flint-axe'], inventory: { flint: 1, branch: 2, fiber: 1 } }),
    ).entries;

    assert.equal(entry.isEnabled, false);
    assert.equal(entry.warning, 'Déjà possédé');
  });
});

describe("R-IHM-BAR-001 · Barre d'actions", () => {
  const entry = (windows, id) => toolbarView(windows).find((button) => button.id === id);

  it('ex.1 — survol de « Inventaire » : « Inventaire (I) »', () => {
    assert.deepEqual(
      toolbarView(new WindowsController()).map((button) => button.label),
      ['Inventaire (I)', 'Artisanat (C)', 'Journal (J)'],
    );
  });

  it("ex.2 — clic sur « Inventaire » : la fenêtre s'ouvre, l'icône est mise en valeur", () => {
    const windows = new WindowsController();

    windows.toggle('inventory');

    assert.equal(windows.open, 'inventory');
    assert.equal(entry(windows, 'inventory').isActive, true);
  });

  it("ex.3 — l'inventaire ouvert, clic sur « Inventaire » : il se ferme", () => {
    const windows = new WindowsController();
    windows.toggle('inventory');

    windows.toggle('inventory');

    assert.equal(windows.open, undefined);
  });

  it('ex.4 — le journal fermé, clic sur « Journal » : il est ouvert', () => {
    const windows = new WindowsController();

    windows.toggle('journal');

    assert.equal(windows.journalOpen, true);
    assert.equal(entry(windows, 'journal').isActive, true);
  });
});
