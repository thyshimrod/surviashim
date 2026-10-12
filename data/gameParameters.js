// @ts-check

/**
 * Paramètres de jeu.
 *
 * Les noms et les valeurs reproduisent exactement la partie C de docs/SPECIFICATION.md
 * (paramètres non supprimés). Le test tests/data/gameParameters.test.js vérifie que les deux
 * restent identiques : toute modification se fait d'abord dans la spécification.
 *
 * Unités : distances en pixels de monde, durées et vitesses en ticks.
 */

/** @typedef {Readonly<{x: number, y: number}>} FrozenPoint */

/**
 * @typedef {object} GameParameters
 * @property {number} TICK_RATE Nombre de ticks par seconde de jeu.
 * @property {number} TILE_SIZE Côté d'une tuile de la carte (px).
 * @property {number} MAP_WIDTH Largeur de la vallée (tuiles).
 * @property {number} MAP_HEIGHT Hauteur de la vallée (tuiles).
 * @property {FrozenPoint} PLAYER_START_TILE Tuile de départ du joueur (x = colonne, y = ligne).
 * @property {number} PLAYER_WALK_SPEED Distance parcourue par tick de marche (px).
 * @property {number} PLAYER_HITBOX_WIDTH Largeur de la boîte de collision (px).
 * @property {number} PLAYER_HITBOX_HEIGHT Hauteur de la boîte de collision (px).
 * @property {number} WALK_FRAME_TICKS Durée d'affichage d'une image de marche (ticks).
 * @property {readonly number[]} WALK_FRAME_SEQUENCE Ordre des images (colonnes, à partir de 1) de la marche.
 * @property {number} IDLE_FRAME Image (colonne, à partir de 1) de la pose immobile.
 * @property {number} HARVEST_REACH Distance maximale entre le joueur et le centre d'une tuile pour la récolter (px).
 * @property {number} TREE_WOOD_YIELD Bois obtenu en coupant un arbre.
 * @property {number} ROCK_STONE_YIELD Pierres obtenues en piochant un rocher.
 * @property {number} FLOWERS_YIELD Fleurs obtenues en ramassant des fleurs.
 * @property {number} TALK_REACH Distance maximale pour parler à un PNJ (px).
 * @property {number} NOTIFICATION_TICKS Durée d'affichage d'une notification (ticks).
 * @property {number} SEARCH_MAX_BOOKS Nombre maximal de livres dans une cachette.
 */

/** @type {Readonly<GameParameters>} */
export const GAME_PARAMETERS = Object.freeze({
  TICK_RATE: 60,
  TILE_SIZE: 32,
  MAP_WIDTH: 160,
  MAP_HEIGHT: 120,
  PLAYER_START_TILE: Object.freeze({ x: 34, y: 92 }),
  PLAYER_WALK_SPEED: 3,
  PLAYER_HITBOX_WIDTH: 20,
  PLAYER_HITBOX_HEIGHT: 12,
  WALK_FRAME_TICKS: 8,
  WALK_FRAME_SEQUENCE: Object.freeze([3, 2, 1, 2]),
  IDLE_FRAME: 2,
  HARVEST_REACH: 48,
  TREE_WOOD_YIELD: 3,
  ROCK_STONE_YIELD: 2,
  FLOWERS_YIELD: 1,
  TALK_REACH: 64,
  NOTIFICATION_TICKS: 240,
  SEARCH_MAX_BOOKS: 2,
});
