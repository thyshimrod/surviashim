import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { selectAutotileQuarters } from '../../../src/presentation/renderers/autotile.js';
import { pickForTile, tileNoise } from '../../../src/presentation/renderers/tileNoise.js';

/** Terrain présent aux décalages donnés (« dx,dy »). */
const neighbours =
  (...offsets) =>
  (dx, dy) =>
    offsets.includes(`${dx},${dy}`);
const ALL = ['-1,-1', '0,-1', '1,-1', '-1,0', '1,0', '-1,1', '0,1', '1,1'];

describe('selectAutotileQuarters', () => {
  it("une tuile isolée prend les 4 coins extérieurs de l'îlot", () => {
    assert.deepEqual(selectAutotileQuarters(neighbours()), [
      { qx: 0, qy: 2 },
      { qx: 3, qy: 2 },
      { qx: 0, qy: 5 },
      { qx: 3, qy: 5 },
    ]);
  });

  it('une tuile entourée prend les 4 quarts intérieurs', () => {
    assert.deepEqual(selectAutotileQuarters(neighbours(...ALL)), [
      { qx: 2, qy: 4 },
      { qx: 1, qy: 4 },
      { qx: 2, qy: 3 },
      { qx: 1, qy: 3 },
    ]);
  });

  it("une tuile du bord supérieur prend le bord haut en haut, l'intérieur en bas", () => {
    const quarters = selectAutotileQuarters(neighbours('-1,0', '1,0', '-1,1', '0,1', '1,1'));

    assert.deepEqual(quarters, [
      { qx: 2, qy: 2 },
      { qx: 1, qy: 2 },
      { qx: 2, qy: 3 },
      { qx: 1, qy: 3 },
    ]);
  });

  it('un voisin diagonal manquant donne un coin intérieur', () => {
    const quarters = selectAutotileQuarters(
      neighbours(...ALL.filter((offset) => offset !== '1,-1')),
    );

    assert.deepEqual(quarters[1], { qx: 3, qy: 0 });
  });

  it('une tuile du bord gauche prend le bord gauche', () => {
    const quarters = selectAutotileQuarters(neighbours('0,-1', '1,-1', '1,0', '0,1', '1,1'));

    assert.deepEqual(quarters[0], { qx: 0, qy: 4 });
    assert.deepEqual(quarters[2], { qx: 0, qy: 3 });
  });
});

describe('tileNoise', () => {
  it('est stable et compris entre 0 et 1', () => {
    const value = tileNoise(12, 7, 3);

    assert.equal(tileNoise(12, 7, 3), value);
    assert.ok(value >= 0 && value < 1);
  });

  it('choisit toujours le même élément pour une tuile', () => {
    const items = ['a', 'b', 'c'];

    assert.equal(pickForTile(items, 4, 9, 1), pickForTile(items, 4, 9, 1));
    assert.ok(items.includes(pickForTile(items, 4, 9, 1)));
  });
});
