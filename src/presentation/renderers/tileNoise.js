// @ts-check

const HASH_PRIME_X = 374761393;
const HASH_PRIME_Y = 668265263;
const HASH_MIX = 1274126177;
const HASH_SHIFT_A = 13;
const HASH_SHIFT_B = 16;
const UINT32_RANGE = 4294967296;

/**
 * Valeur pseudo-aléatoire stable dans [0, 1[ pour une tuile : l'aspect du décor est identique à
 * chaque affichage, sans utiliser d'aléatoire (purement décoratif, aucun effet sur le jeu).
 * @param {number} column
 * @param {number} row
 * @param {number} salt Distingue plusieurs tirages pour la même tuile.
 * @returns {number}
 */
export function tileNoise(column, row, salt) {
  let hash = Math.imul(column + salt, HASH_PRIME_X) + Math.imul(row - salt, HASH_PRIME_Y);
  hash = Math.imul(hash ^ (hash >>> HASH_SHIFT_A), HASH_MIX);
  return ((hash ^ (hash >>> HASH_SHIFT_B)) >>> 0) / UINT32_RANGE;
}

/**
 * Choisit un élément d'une liste, de façon stable pour une tuile.
 * @template T
 * @param {readonly T[]} items Liste non vide.
 * @param {number} column
 * @param {number} row
 * @param {number} salt
 * @returns {T}
 */
export function pickForTile(items, column, row, salt) {
  return items[Math.floor(tileNoise(column, row, salt) * items.length)];
}
