import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  goAndAct,
  goToTile,
  harvestTile,
  setMoveIntent,
  talkTo,
} from '../../src/core/commands/commands.js';
import { WindowsController } from '../../src/presentation/ui/WindowsController.js';
import { createTestGame, runUntil } from '../helpers/testGame.js';

/** Centre de la tuile (c, r), en px. */
const center = (column, row) => ({ x: column * 32 + 16, y: row * 32 + 16 });

/** Le joueur au centre de (10, 10), de l'herbe partout, plus les tuiles données. */
const fromCenter = (options = {}) =>
  createTestGame({ player: { position: center(10, 10) }, ...options });

/** De l'eau tout autour de la tuile (20, 20). */
const WATER_AROUND_20_20 = [-1, 0, 1].flatMap((dx) =>
  [-1, 0, 1].filter((dy) => dx !== 0 || dy !== 0).map((dy) => [20 + dx, 20 + dy, 'water']),
);

/** Fait passer des ticks. */
const wait = (game, ticks) => {
  for (let tick = 0; tick < ticks; tick += 1) {
    game.update();
  }
};

const arrived = (state) => () => state.travel === undefined;

describe('R-JOU-DEP-004 · Aller à une tuile', () => {
  it("ex.1 — de (10, 10) à (13, 10) : il arrive au centre de (13, 10) et s'arrête", () => {
    const { game, state } = fromCenter();

    assert.deepEqual(game.execute(goToTile({ column: 13, row: 10 })), { ok: true });
    assert.ok(runUntil(game, arrived(state)));
    wait(game, 5);

    assert.deepEqual(state.player.position, center(13, 10));
    assert.equal(state.player.isWalking, false);
  });

  it("ex.2 — de l'eau de (12, 8) à (12, 12) : il contourne et arrive en (14, 10)", () => {
    const water = [8, 9, 10, 11, 12].map((row) => [12, row, 'water']);
    const { game, state } = fromCenter({ map: { tiles: water } });
    let wetTicks = 0;

    game.execute(goToTile({ column: 14, row: 10 }));
    runUntil(game, () => {
      const { x, y } = state.player.position;
      wetTicks += state.map.tileIdAt(Math.floor(x / 32), Math.floor(y / 32)) === 'water' ? 1 : 0;
      return state.travel === undefined;
    });

    assert.deepEqual(state.player.position, center(14, 10));
    assert.equal(wetTicks, 0);
  });

  it("ex.3 — aller sur l'eau en (12, 10) : refus NO_PATH, il ne bouge pas", () => {
    const { game, state } = fromCenter({ map: { tiles: [[12, 10, 'water']] } });

    assert.deepEqual(game.execute(goToTile({ column: 12, row: 10 })), {
      ok: false,
      reason: 'NO_PATH',
    });
    wait(game, 10);
    assert.deepEqual(state.player.position, center(10, 10));
  });

  it("ex.4 — la tuile (20, 20) entourée d'eau : refus NO_PATH", () => {
    const { game } = fromCenter({ map: { tiles: WATER_AROUND_20_20 } });

    assert.deepEqual(game.execute(goToTile({ column: 20, row: 20 })), {
      ok: false,
      reason: 'NO_PATH',
    });
  });

  it("ex.5 — en chemin, « haut » demandé : chemin abandonné, il s'arrête au relâché", () => {
    const { game, state } = fromCenter();
    game.execute(goToTile({ column: 16, row: 10 }));
    wait(game, 10);

    game.execute(setMoveIntent({ dx: 0, dy: -1 }));
    wait(game, 3);
    game.execute(setMoveIntent({ dx: 0, dy: 0 }));
    const stopped = { ...state.player.position };
    wait(game, 30);

    assert.equal(state.travel, undefined);
    assert.deepEqual(state.player.position, stopped);
  });

  it('ex.6 — aller en (−1, 0), hors de la carte : refus NO_PATH', () => {
    const { game } = fromCenter();

    assert.deepEqual(game.execute(goToTile({ column: -1, row: 0 })), {
      ok: false,
      reason: 'NO_PATH',
    });
  });
});

describe('R-JOU-DEP-005 · Aller puis agir', () => {
  const treeAt = (column, row, options = {}) =>
    fromCenter({ ...options, map: { tiles: [[column, row, 'tree'], ...(options.tiles ?? [])] } });

  it('ex.1 — un arbre en (15, 10) : il y va, la récolte commence ; au terme, 1 bois', () => {
    const { game, state } = treeAt(15, 10);

    assert.deepEqual(game.execute(goAndAct(harvestTile({ column: 15, row: 10 }))), { ok: true });
    assert.ok(runUntil(game, () => state.harvesting !== undefined));
    assert.ok(runUntil(game, () => state.inventory.wood === 1));
  });

  it('ex.2 — un arbre à portée : la récolte commence aussitôt, sans marcher', () => {
    const { game, state } = treeAt(11, 10);

    game.execute(goAndAct(harvestTile({ column: 11, row: 10 })));

    assert.notEqual(state.harvesting, undefined);
    assert.equal(state.travel, undefined);
  });

  it('ex.3 — aucun outil, un arbre en (15, 10) : refus MISSING_TOOL, il ne bouge pas', () => {
    const { game, state } = treeAt(15, 10, { tools: [] });

    assert.deepEqual(game.execute(goAndAct(harvestTile({ column: 15, row: 10 }))), {
      ok: false,
      reason: 'MISSING_TOOL',
    });
    assert.equal(state.travel, undefined);
  });

  it("ex.4 — un arbre en (20, 20), entouré d'eau : refus NO_PATH", () => {
    const { game } = treeAt(20, 20, { tiles: WATER_AROUND_20_20 });

    assert.deepEqual(game.execute(goAndAct(harvestTile({ column: 20, row: 20 }))), {
      ok: false,
      reason: 'NO_PATH',
    });
  });

  it('ex.5 — Aldric à 200 px : il le rejoint, puis le dialogue commence', () => {
    const { game, state } = fromCenter({
      npcs: [{ id: 'aldric', position: { x: center(10, 10).x + 200, y: center(10, 10).y } }],
    });

    assert.deepEqual(game.execute(goAndAct(talkTo('aldric'))), { ok: true });

    assert.ok(runUntil(game, () => state.dialogue !== undefined));
    assert.equal(state.dialogue.npcId, 'aldric');
  });

  it("ex.6 — en chemin, une direction demandée : abandon, l'arbre n'est pas récolté", () => {
    const { game, state } = treeAt(15, 10);
    game.execute(goAndAct(harvestTile({ column: 15, row: 10 })));
    wait(game, 10);

    game.execute(setMoveIntent({ dx: 0, dy: -1 }));
    wait(game, 1);
    game.execute(setMoveIntent({ dx: 0, dy: 0 }));
    wait(game, 400);

    assert.equal(state.travel, undefined);
    assert.equal(state.inventory.wood, 0);
    assert.equal(state.map.tileIdAt(15, 10), 'tree');
  });
});

describe('R-IHM-CMD-002 · Toucher pour aller', () => {
  const goal = (state) => state.travel?.path.at(-1);

  it('ex.1 — clic sur la tuile (14, 10) : le héros y va', () => {
    const { game, state } = fromCenter();

    new WindowsController().designate({ column: 14, row: 10 }, game);

    assert.deepEqual(goal(state), { column: 14, row: 10 });
  });

  it("ex.2 — la fenêtre ouverte sur un arbre, clic sur l'herbe : fermée, le héros y va", () => {
    const { game, state } = fromCenter({ map: { tiles: [[7, 6, 'tree']] } });
    const windows = new WindowsController();
    windows.designate({ column: 7, row: 6 }, game);
    assert.equal(windows.open, 'inspection');

    windows.designate({ column: 14, row: 10 }, game);

    assert.equal(windows.open, undefined);
    assert.deepEqual(goal(state), { column: 14, row: 10 });
  });

  it("ex.3 — clic sur un arbre : la fenêtre d'information, le héros ne bouge pas", () => {
    const { game, state } = fromCenter({ map: { tiles: [[7, 6, 'tree']] } });
    const windows = new WindowsController();

    windows.designate({ column: 7, row: 6 }, game);

    assert.equal(windows.open, 'inspection');
    assert.equal(state.travel, undefined);
  });

  it("ex.4 — pendant un dialogue, clic sur l'herbe : rien ne se passe", () => {
    const { game, state } = fromCenter({
      npcs: [{ id: 'aldric', position: { x: center(10, 10).x + 40, y: center(10, 10).y } }],
    });
    game.execute(talkTo('aldric'));

    new WindowsController().designate({ column: 14, row: 10 }, game);

    assert.equal(state.travel, undefined);
  });

  it("ex.5 — clic sur l'eau en (12, 10) : le héros ne bouge pas", () => {
    const { game, state } = fromCenter({ map: { tiles: [[12, 10, 'water']] } });

    new WindowsController().designate({ column: 12, row: 10 }, game);
    wait(game, 10);

    assert.equal(state.travel, undefined);
    assert.deepEqual(state.player.position, center(10, 10));
  });
});

describe('R-IHM-AFF-003 · Écrans tactiles et petits écrans', () => {
  const projectFile = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');

  it('ex.1 — la balise « viewport » interdit le zoom', () => {
    const viewport = projectFile('index.html').match(/name="viewport"\s+content="([^"]*)"/)[1];

    assert.match(viewport, /maximum-scale=1/);
    assert.match(viewport, /user-scalable=no/);
  });

  it('ex.2 — la page : ni défilement, ni zoom, ni sélection au toucher', () => {
    const page = projectFile('src/presentation/styles/main.css').match(
      /html,\nbody \{([^}]*)\}/,
    )[1];

    assert.match(page, /touch-action: none;/);
    assert.match(page, /user-select: none;/);
  });
});
