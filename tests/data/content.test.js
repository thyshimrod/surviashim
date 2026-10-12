// Validation du contenu de data/ : types de tuiles, cartes, feuilles de sprites (GUIDELINES § 7).
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { GAME_PARAMETERS } from '../../data/gameParameters.js';
import { VALLEY_MAP } from '../../data/maps/valley.js';
import { CHARACTER_SHEETS } from '../../data/sprites.js';
import { TILE_DEFINITIONS } from '../../data/tilesets.js';

const projectFile = (path) => new URL(`../../${path}`, import.meta.url);

/** Largeur et hauteur d'une image PNG, lues dans son en-tête. */
function pngSize(path) {
  const bytes = readFileSync(projectFile(path));
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

describe('data/tilesets.js', () => {
  const tiles = Object.entries(TILE_DEFINITIONS);

  it('chaque type de tuile a pour clé son identifiant', () => {
    for (const [key, tile] of tiles) {
      assert.equal(tile.id, key);
    }
  });

  it('chaque symbole est un caractère unique', () => {
    const symbols = tiles.map(([, tile]) => tile.symbol);
    assert.ok(symbols.every((symbol) => symbol.length === 1));
    assert.equal(new Set(symbols).size, symbols.length);
  });

  it('un élément debout est infranchissable', () => {
    for (const [, tile] of tiles) {
      assert.ok(!tile.isStanding || tile.isBlocking, tile.id);
    }
  });

  it('est gelé', () => {
    assert.ok(Object.isFrozen(TILE_DEFINITIONS));
    assert.ok(tiles.every(([, tile]) => Object.isFrozen(tile)));
  });
});

describe('data/maps/valley.js', () => {
  const symbols = new Set(Object.values(TILE_DEFINITIONS).map((tile) => tile.symbol));

  it('a la taille MAP_WIDTH × MAP_HEIGHT', () => {
    assert.equal(VALLEY_MAP.rows.length, GAME_PARAMETERS.MAP_HEIGHT);
    for (const row of VALLEY_MAP.rows) {
      assert.equal(row.length, GAME_PARAMETERS.MAP_WIDTH);
    }
  });

  it("n'utilise que des types de tuiles définis", () => {
    for (const row of VALLEY_MAP.rows) {
      for (const symbol of row) {
        assert.ok(symbols.has(symbol), `symbole inconnu « ${symbol} »`);
      }
    }
  });

  it('place le départ du joueur sur une tuile franchissable', () => {
    const { x, y } = GAME_PARAMETERS.PLAYER_START_TILE;
    const symbol = VALLEY_MAP.rows[y][x];
    const tile = Object.values(TILE_DEFINITIONS).find((definition) => definition.symbol === symbol);
    assert.equal(tile.isBlocking, false);
  });

  it('est gelée', () => {
    assert.ok(Object.isFrozen(VALLEY_MAP) && Object.isFrozen(VALLEY_MAP.rows));
  });
});

describe('data/sprites.js', () => {
  for (const [name, sheet] of Object.entries(CHARACTER_SHEETS)) {
    it(`${name} : l'image existe et contient toutes les images décrites`, () => {
      assert.ok(existsSync(projectFile(sheet.image)), sheet.image);
      const size = pngSize(sheet.image);
      const rowCount = Math.max(...Object.values(sheet.rows)) + 1;
      assert.ok(sheet.origin.x + sheet.columns * sheet.frameWidth <= size.width);
      assert.ok(sheet.origin.y + rowCount * sheet.frameHeight <= size.height);
    });

    it(`${name} : 4 orientations et des images assez nombreuses pour l'animation`, () => {
      assert.deepEqual(Object.keys(sheet.rows).sort(), ['down', 'left', 'right', 'up']);
      const frames = [...GAME_PARAMETERS.WALK_FRAME_SEQUENCE, GAME_PARAMETERS.IDLE_FRAME];
      assert.ok(frames.every((frame) => frame >= 1 && frame <= sheet.columns));
    });

    it(`${name} : le point d'ancrage est dans l'image affichée`, () => {
      assert.ok(sheet.anchor.x >= 0 && sheet.anchor.x <= sheet.displayWidth);
      assert.ok(sheet.anchor.y >= 0 && sheet.anchor.y <= sheet.displayHeight);
    });
  }
});
