// Validation du catalogue de la planche de tuiles et de l'apparence des terrains (GUIDELINES § 7).
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SPRINKLE_RATIO, TERRAIN_APPEARANCE } from '../../data/terrainAppearance.js';
import { AUTOTILES, SPRITES, TILESET_MAIN } from '../../data/tileset.js';
import { TILE_DEFINITIONS } from '../../data/tilesets.js';

const image = readFileSync(new URL(`../../${TILESET_MAIN.image}`, import.meta.url));
const imageSize = { width: image.readUInt32BE(16), height: image.readUInt32BE(20) };
const AUTOTILE_BLOCK = { width: 2, height: 3 };

describe('data/tileset.js', () => {
  it("décrit les dimensions réelles de l'image", () => {
    assert.deepEqual(imageSize, {
      width: TILESET_MAIN.columns * TILESET_MAIN.tileSize,
      height: TILESET_MAIN.rows * TILESET_MAIN.tileSize,
    });
  });

  it("chaque sprite tient dans l'image et a une taille entière positive", () => {
    for (const [name, sprite] of Object.entries(SPRITES)) {
      assert.ok(Number.isInteger(sprite.width) && sprite.width > 0, name);
      assert.ok(Number.isInteger(sprite.height) && sprite.height > 0, name);
      assert.ok(sprite.column >= 0 && sprite.column + sprite.width <= TILESET_MAIN.columns, name);
      assert.ok(sprite.row >= 0 && sprite.row + sprite.height <= TILESET_MAIN.rows, name);
    }
  });

  it("chaque autotile (2 × 3 tuiles par image d'animation) tient dans l'image", () => {
    for (const [name, block] of Object.entries(AUTOTILES)) {
      const lastColumn = block.column + block.frames * AUTOTILE_BLOCK.width;
      assert.ok(lastColumn <= TILESET_MAIN.columns, name);
      assert.ok(block.row + AUTOTILE_BLOCK.height <= TILESET_MAIN.rows, name);
    }
  });

  it('les noms sont en kebab-case', () => {
    for (const name of [...Object.keys(SPRITES), ...Object.keys(AUTOTILES)]) {
      assert.match(name, /^[a-z]+(?:-[a-z0-9]+)*$/);
    }
  });

  it('est gelé', () => {
    assert.ok(Object.isFrozen(SPRITES) && Object.isFrozen(AUTOTILES));
    assert.ok(Object.values(SPRITES).every((sprite) => Object.isFrozen(sprite)));
  });
});

describe('data/terrainAppearance.js', () => {
  it('chaque type de tuile a une apparence, et réciproquement', () => {
    assert.deepEqual(Object.keys(TERRAIN_APPEARANCE).sort(), Object.keys(TILE_DEFINITIONS).sort());
  });

  it('ne cite que des autotiles et des sprites du catalogue', () => {
    for (const [id, look] of Object.entries(TERRAIN_APPEARANCE)) {
      for (const autotile of [look.autotile, look.under].filter(Boolean)) {
        assert.ok(autotile in AUTOTILES, `${id} : autotile « ${autotile} » inconnu`);
      }
      for (const name of [
        ...(look.decor ?? []),
        ...(look.standing ?? []),
        ...(look.sprinkle ?? []),
      ]) {
        assert.ok(name in SPRITES, `${id} : sprite « ${name} » inconnu`);
      }
    }
  });

  it('les décors au sol tiennent dans une tuile', () => {
    for (const look of Object.values(TERRAIN_APPEARANCE)) {
      for (const name of [...(look.decor ?? []), ...(look.sprinkle ?? [])]) {
        assert.deepEqual([SPRITES[name].width, SPRITES[name].height], [1, 1], name);
      }
    }
  });

  it('seuls les types de tuiles debout ont des sprites debout', () => {
    for (const [id, look] of Object.entries(TERRAIN_APPEARANCE)) {
      assert.equal(look.standing !== undefined, TILE_DEFINITIONS[id].isStanding, id);
    }
  });

  it('la proportion de décor semé est entre 0 et 1', () => {
    assert.ok(SPRINKLE_RATIO >= 0 && SPRINKLE_RATIO <= 1);
  });
});
