// Validation des lieux et des PNJ de la vallée (spécification B.6, GUIDELINES § 7).
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { GAME_PARAMETERS } from '../../data/gameParameters.js';
import { VALLEY_MAP } from '../../data/maps/valley.js';
import { NPCS } from '../../data/npcs.js';
import { PLACES } from '../../data/places.js';
import { CHARACTER_SHEETS } from '../../data/sprites.js';
import { TILE_DEFINITIONS } from '../../data/tilesets.js';
import { CONTENT_TEXTS } from '../../src/presentation/i18n/frContent.js';
import { reachableTiles } from '../../tools/maps/reachability.js';

const start = {
  column: GAME_PARAMETERS.PLAYER_START_TILE.x,
  row: GAME_PARAMETERS.PLAYER_START_TILE.y,
};
const reachable = reachableTiles(VALLEY_MAP.rows, start);
const isReachable = (column, row) => reachable.has(`${column},${row}`);
const symbolAt = (column, row) => VALLEY_MAP.rows[row][column];
const blockingSymbols = new Set(
  Object.values(TILE_DEFINITIONS)
    .filter((tile) => tile.isBlocking)
    .map((tile) => tile.symbol),
);

describe('data/places.js', () => {
  it('chaque lieu a pour clé son identifiant, un nom affiché, et tient dans la vallée', () => {
    for (const [key, place] of Object.entries(PLACES)) {
      const { column, row, width, height } = place.area;
      assert.equal(place.id, key);
      assert.ok(CONTENT_TEXTS.placeNames[key], `nom de ${key}`);
      assert.ok(column >= 0 && row >= 0 && width > 0 && height > 0, key);
      assert.ok(column + width <= GAME_PARAMETERS.MAP_WIDTH, key);
      assert.ok(row + height <= GAME_PARAMETERS.MAP_HEIGHT, key);
    }
  });

  it('chaque lieu est accessible depuis le départ', () => {
    for (const place of Object.values(PLACES)) {
      const { column, row, width, height } = place.area;
      let found = false;
      for (let y = row; y < row + height && !found; y += 1) {
        for (let x = column; x < column + width && !found; x += 1) {
          found = isReachable(x, y);
        }
      }
      assert.ok(found, `lieu ${place.id} inaccessible`);
    }
  });

  it('le départ est dans le Vallon', () => {
    assert.ok(
      start.column >= PLACES.vale.area.column &&
        start.column < PLACES.vale.area.column + PLACES.vale.area.width &&
        start.row >= PLACES.vale.area.row &&
        start.row < PLACES.vale.area.row + PLACES.vale.area.height,
    );
  });
});

describe('data/npcs.js', () => {
  for (const [key, npc] of Object.entries(NPCS)) {
    it(`${key} : identifiant, feuille de sprites, nom et textes existent`, () => {
      assert.equal(npc.id, key);
      assert.ok(npc.sheet in CHARACTER_SHEETS, npc.sheet);
      assert.ok(CONTENT_TEXTS.npcNames[key], `nom de ${key}`);
      assert.ok(npc.pages.length > 0);
      for (const page of npc.pages) {
        assert.ok(CONTENT_TEXTS.pages[page.id], `texte de ${page.id}`);
        assert.ok(page.reveals === undefined || page.reveals in PLACES, `lieu de ${page.id}`);
      }
    });

    it(`${key} : sur une tuile franchissable, accessible depuis le départ`, () => {
      const { column, row } = npc.tile;
      assert.ok(!blockingSymbols.has(symbolAt(column, row)), `${key} sur un obstacle`);
      const neighbours = [
        [column + 1, row],
        [column - 1, row],
        [column, row + 1],
        [column, row - 1],
      ];
      assert.ok(
        neighbours.some(([x, y]) => isReachable(x, y)),
        `${key} inaccessible`,
      );
    });
  }

  it('les identifiants de pages sont uniques', () => {
    const ids = Object.values(NPCS).flatMap((npc) => npc.pages.map((page) => page.id));
    assert.equal(new Set(ids).size, ids.length);
  });
});
