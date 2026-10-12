// Validation des livres, des cachettes, de l'atlas d'icônes et des planches (GUIDELINES § 7).
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { BOOKS } from '../../data/books.js';
import { GAME_PARAMETERS } from '../../data/gameParameters.js';
import { ICON_SET, ICONS } from '../../data/icons.js';
import { INTERIOR_SPRITES } from '../../data/interiorSprites.js';
import { VALLEY_MAP } from '../../data/maps/valley.js';
import { RECIPES } from '../../data/recipes.js';
import { RESOURCES } from '../../data/resources.js';
import { SEARCH_SPOTS } from '../../data/searchSpots.js';
import { SPRITES, TILESETS } from '../../data/tileset.js';
import { TILE_DEFINITIONS } from '../../data/tilesets.js';
import { TOOLS } from '../../data/tools.js';
import { TEXTS } from '../../src/presentation/i18n/fr.js';
import { CONTENT_TEXTS } from '../../src/presentation/i18n/frContent.js';

const projectFile = (path) => new URL(`../../${path}`, import.meta.url);
const pngSize = (path) => {
  const bytes = readFileSync(projectFile(path));
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
};

describe('data/books.js', () => {
  for (const [key, book] of Object.entries(BOOKS)) {
    it(`${key} : identifiant, icône, titre, texte et noms des plans`, () => {
      assert.equal(book.id, key);
      assert.ok(book.icon in ICONS, book.icon);
      assert.ok(CONTENT_TEXTS.books[key]?.title && CONTENT_TEXTS.books[key]?.text);
      assert.ok(book.plans.length > 0);
      assert.ok(
        book.plans.every((plan) => CONTENT_TEXTS.plans[plan]),
        'nom de plan manquant',
      );
    });
  }
});

describe('data/tools.js et data/recipes.js', () => {
  it('chaque outil a un identifiant, une icône et un nom', () => {
    for (const [key, tool] of Object.entries(TOOLS)) {
      assert.equal(tool.id, key);
      assert.ok(tool.icon in ICONS, tool.icon);
      assert.ok(TEXTS.toolNames[key], key);
    }
  });

  it("chaque recette est le plan d'un livre, donne un outil et consomme des ressources", () => {
    const plans = Object.values(BOOKS).flatMap((book) => book.plans);
    for (const [key, recipe] of Object.entries(RECIPES)) {
      assert.equal(recipe.id, key);
      assert.ok(plans.includes(key), key);
      assert.ok(recipe.tool in TOOLS, recipe.tool);
      for (const [resource, amount] of Object.entries(recipe.ingredients)) {
        assert.ok(resource in RESOURCES, resource);
        assert.ok(Number.isInteger(amount) && amount > 0);
      }
    }
  });

  it('les outils exigés par les récoltes existent (R-RES-OUT-001)', () => {
    const kinds = Object.values(TOOLS).map((tool) => tool.kind);
    for (const definition of Object.values(TILE_DEFINITIONS)) {
      const kind = definition.harvest?.tool;
      assert.ok(kind === undefined || kinds.includes(kind), definition.id);
      assert.ok(kind === undefined || TEXTS.toolNeeded[kind], definition.id);
    }
  });

  it('les Ruines du Guet fournissent de quoi fabriquer la hache et la pioche (B.8)', () => {
    const found = {};
    for (const spot of SEARCH_SPOTS.filter(({ column }) => column < 40)) {
      for (const [resource, amount] of Object.entries(spot.resources)) {
        found[resource] = (found[resource] ?? 0) + amount;
      }
    }
    for (const recipe of ['flint-axe', 'flint-pickaxe']) {
      for (const [resource, amount] of Object.entries(RECIPES[recipe].ingredients)) {
        found[resource] = (found[resource] ?? 0) - amount;
      }
    }
    assert.ok(
      Object.values(found).every((amount) => amount >= 0),
      JSON.stringify(found),
    );
  });
});

describe('data/searchSpots.js', () => {
  it('chaque cachette est un élément à fouiller placé sur la carte', () => {
    for (const spot of SEARCH_SPOTS) {
      assert.ok(TILE_DEFINITIONS[spot.tile]?.search, spot.tile);
      assert.equal(VALLEY_MAP.rows[spot.row][spot.column], TILE_DEFINITIONS[spot.tile].symbol);
    }
  });

  it('aucune cachette ne contient plus de SEARCH_MAX_BOOKS livres (R-RES-FOU-003)', () => {
    for (const spot of SEARCH_SPOTS) {
      assert.ok(spot.books.length <= GAME_PARAMETERS.SEARCH_MAX_BOOKS);
    }
  });

  it('ne cite que des livres et des ressources existants, en quantités positives', () => {
    for (const spot of SEARCH_SPOTS) {
      assert.ok(spot.books.every((book) => book in BOOKS));
      for (const [resource, amount] of Object.entries(spot.resources)) {
        assert.ok(resource in RESOURCES, resource);
        assert.ok(Number.isInteger(amount) && amount > 0);
      }
    }
  });

  it('deux cachettes ne partagent pas une tuile', () => {
    const keys = SEARCH_SPOTS.map(({ column, row }) => `${column},${row}`);
    assert.equal(new Set(keys).size, keys.length);
  });
});

describe('data/icons.js', () => {
  it("l'image existe et a la taille annoncée", () => {
    assert.deepEqual(pngSize(ICON_SET.image), {
      width: ICON_SET.columns * ICON_SET.iconSize,
      height: ICON_SET.rows * ICON_SET.iconSize,
    });
  });

  it('chaque icône est dans la planche', () => {
    for (const [name, icon] of Object.entries(ICONS)) {
      assert.ok(icon.column >= 0 && icon.column < ICON_SET.columns, name);
      assert.ok(icon.row >= 0 && icon.row < ICON_SET.rows, name);
    }
  });

  it('chaque ressource a une icône', () => {
    for (const resource of Object.values(RESOURCES)) {
      assert.ok(resource.icon in ICONS, resource.id);
    }
  });
});

describe('planches de tuiles', () => {
  it('chaque planche existe et a la taille annoncée', () => {
    for (const [key, tileset] of Object.entries(TILESETS)) {
      assert.ok(existsSync(projectFile(tileset.image)), key);
      assert.deepEqual(pngSize(tileset.image), {
        width: tileset.columns * tileset.tileSize,
        height: tileset.rows * tileset.tileSize,
      });
    }
  });

  it('chaque sprite vit sur une planche connue et y tient', () => {
    for (const [name, sprite] of Object.entries(SPRITES)) {
      const tileset = TILESETS[sprite.sheet ?? 'main'];
      assert.ok(tileset, `${name} : planche ${sprite.sheet}`);
      assert.ok(sprite.column + sprite.width <= tileset.columns, name);
      assert.ok(sprite.row + sprite.height <= tileset.rows, name);
    }
  });

  it('les sprites des ruines et des intérieurs ne sont pas masqués par un homonyme', () => {
    for (const [name, sprite] of Object.entries(INTERIOR_SPRITES)) {
      assert.equal(SPRITES[name], sprite, name);
    }
  });
});
