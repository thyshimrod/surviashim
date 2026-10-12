import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createTileMapFromRows, TileMap } from '../../../../src/core/model/TileMap.js';
import { TILE_DEFINITIONS } from '../../../../data/tilesets.js';

describe('TileMap', () => {
  it('refuse des listes de tuiles de mauvaise longueur', () => {
    assert.throws(
      () =>
        new TileMap({ columns: 2, rows: 2, tileSize: 32, tileIds: ['grass'], blocking: [false] }),
      RangeError,
    );
  });

  it("refuse d'interroger une tuile hors de la carte", () => {
    const map = createTileMapFromRows({
      rows: ['..'],
      definitions: TILE_DEFINITIONS,
      tileSize: 32,
    });

    assert.throws(() => map.isBlocking(2, 0), RangeError);
    assert.throws(() => map.tileIdAt(0, -1), RangeError);
  });

  it("n'a aucune tuile pour un point de coordonnée négative", () => {
    const map = createTileMapFromRows({
      rows: ['..'],
      definitions: TILE_DEFINITIONS,
      tileSize: 32,
    });

    assert.equal(map.tileAt({ x: -1, y: 5 }), undefined);
  });

  it('liste les tuiles infranchissables chevauchées, pas celles qui sont seulement touchées', () => {
    const map = createTileMapFromRows({
      rows: ['.o', 'o.'],
      definitions: TILE_DEFINITIONS,
      tileSize: 32,
    });

    assert.deepEqual(map.blockingTilesOverlapping({ left: 10, right: 32, top: 0, bottom: 32 }), []);
    assert.equal(
      map.blockingTilesOverlapping({ left: 10, right: 40, top: 10, bottom: 40 }).length,
      2,
    );
  });
});

describe('createTileMapFromRows', () => {
  it('lit les identifiants et les tuiles infranchissables', () => {
    const map = createTileMapFromRows({
      rows: ['.T', '~='],
      definitions: TILE_DEFINITIONS,
      tileSize: 16,
    });

    assert.deepEqual(map.tileIds, ['grass', 'tree', 'water', 'path']);
    assert.deepEqual(map.blocking, [false, true, true, false]);
    assert.equal(map.widthPx, 32);
  });

  it('refuse des lignes de longueurs différentes', () => {
    assert.throws(
      () =>
        createTileMapFromRows({ rows: ['..', '.'], definitions: TILE_DEFINITIONS, tileSize: 32 }),
      /row 1/,
    );
  });

  it('refuse un symbole inconnu en le nommant', () => {
    assert.throws(
      () => createTileMapFromRows({ rows: ['.X'], definitions: TILE_DEFINITIONS, tileSize: 32 }),
      /"X" at \(1, 0\)/,
    );
  });
});
