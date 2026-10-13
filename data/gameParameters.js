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
 * @property {number} TICK_PER_GAME_MINUTE Ticks par minute de jeu (R-MON-TPS-001).
 * @property {number} DAY_START Minute du jour où commence une partie, fin de l'aube (6:00).
 * @property {number} DUSK_START Minute du jour où commence le crépuscule (18:00).
 * @property {number} NIGHT_START Minute du jour où la nuit est complète (21:00).
 * @property {number} DAWN_START Minute du jour où commence l'aube (4:00).
 * @property {number} NIGHT_DARKNESS Opacité du voile en pleine nuit (0 à 1).
 * @property {number} HERO_LIGHT_RADIUS Rayon du halo autour du héros (px).
 * @property {number} CAMPFIRE_LIGHT_RADIUS Rayon du halo d'un feu de camp allumé (px).
 * @property {number} CAMPFIRE_BURN_MINUTES Durée de combustion d'un feu de camp (minutes de jeu).
 * @property {number} CAMPFIRE_REKINDLE_WOOD Bois pour raviver un feu de camp.
 * @property {number} TREE_REGROW_DAYS Jours de jeu avant qu'une souche redevienne un arbre.
 * @property {number} HEALTH_MAX PV maximum.
 * @property {number} HUNGER_MAX Faim maximale (rassasié).
 * @property {number} HUNGER_MINUTES_PER_POINT Minutes de jeu pour perdre 1 point de faim.
 * @property {number} HEALTH_MINUTES_PER_POINT Minutes de jeu entre deux variations de PV.
 * @property {number} WELL_FED Faim au-dessus de laquelle les PV remontent.
 * @property {number} FAINT_HEALTH PV au réveil après un évanouissement.
 * @property {number} FAINT_HUNGER Faim minimale au réveil après un évanouissement.
 * @property {number} SLEEP_START Minute du jour à partir de laquelle on peut dormir (18:00).
 * @property {number} SLEEP_HUNGER Faim perdue pendant une nuit de sommeil.
 * @property {number} BERRY_YIELD Baies cueillies sur un buisson.
 * @property {number} MUSHROOM_YIELD Champignons ramassés.
 * @property {number} BERRY_FOOD Faim rendue par une baie.
 * @property {number} MUSHROOM_FOOD Faim rendue par un champignon.
 * @property {number} BUSH_REGROW_DAYS Jours avant que les baies repoussent.
 * @property {number} MUSHROOM_REGROW_DAYS Jours avant que les champignons repoussent.
 * @property {number} NPC_WALK_SPEED Vitesse de marche des PNJ (px/tick).
 * @property {number} NPC_PAUSE_MINUTES Pause d'un PNJ à chaque étape de sa promenade (minutes de jeu).
 * @property {number} XP_HARVEST Expérience par récolte.
 * @property {number} XP_SEARCH Expérience par fouille.
 * @property {number} XP_CRAFT Expérience par fabrication.
 * @property {number} XP_DISCOVER Expérience par lieu découvert.
 * @property {number} LEVEL_FIRST_XP Expérience pour passer au niveau 2.
 * @property {number} LEVEL_XP_STEP Expérience demandée en plus à chaque niveau suivant.
 * @property {number} RESEARCH_COST Coût d'un plan en points de recherche.
 * @property {number} STONE_AXE_BONUS Bois en plus avec une hache en pierre.
 * @property {number} STONE_PICKAXE_BONUS Pierre en plus avec une pioche en pierre.
 * @property {number} BAG_BONUS Baies et champignons en plus avec le sac du cueilleur.
 * @property {number} GRILLED_MUSHROOM_FOOD Faim rendue par un champignon grillé.
 * @property {number} ENERGY_MAX Énergie maximale.
 * @property {number} ENERGY_DRAIN_MINUTES Minutes de jeu pour perdre 1 point d'énergie en zone flétrie.
 * @property {number} BLIGHT_HEALTH_MINUTES Minutes de jeu entre deux PV perdus sans énergie en zone flétrie.
 * @property {number} ENERGY_REGEN_MINUTES Minutes de jeu pour regagner 1 point d'énergie près du Foyer.
 * @property {number} FAINT_ENERGY Énergie minimale au réveil après un évanouissement.
 * @property {FrozenPoint} HEARTH_TILE Tuile du Foyer (x = colonne, y = ligne).
 * @property {number} HEARTH_REACH Distance au Foyer pour recharger l'énergie (px).
 * @property {number} HEARTH_LIGHT_RADIUS Rayon du halo du Foyer (px).
 * @property {number} SAGE_YIELD Sauge ramassée par plant.
 * @property {number} SAGE_REGROW_DAYS Jours avant que la sauge repousse.
 * @property {number} SAGE_RADIUS Rayon de purification de la sauge (tuiles).
 * @property {number} IMPORTANT_NOTIFICATION_TICKS Durée d'une notification importante (ticks).
 * @property {number} TREE_BRANCH_YIELD Branches données par un arbre coupé.
 * @property {number} TALL_GRASS_FIBER_YIELD Fibres données par des hautes herbes.
 * @property {number} TALL_GRASS_REGROW_DAYS Jours avant que les hautes herbes repoussent.
 * @property {number} SAGE_SMOKE_LEVEL Niveau requis pour rechercher la fumée de sauge.
 * @property {number} FLINT_HARVEST_TICKS Durée d'une récolte avec un outil en silex (ticks).
 * @property {number} STONE_HARVEST_TICKS Durée d'une récolte avec un outil en pierre (ticks).
 * @property {number} HAND_HARVEST_TICKS Durée d'une récolte à la main (ticks).
 * @property {number} PATH_STUCK_TICKS Ticks sans avancer avant d'abandonner un chemin.
 * @property {number} APPROACH_ATTEMPTS Essais pour rejoindre un élément avant d'agir.
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
  TREE_WOOD_YIELD: 1,
  ROCK_STONE_YIELD: 1,
  FLOWERS_YIELD: 1,
  TALK_REACH: 64,
  NOTIFICATION_TICKS: 240,
  SEARCH_MAX_BOOKS: 2,
  TICK_PER_GAME_MINUTE: 36,
  DAY_START: 360,
  DUSK_START: 1080,
  NIGHT_START: 1260,
  DAWN_START: 240,
  NIGHT_DARKNESS: 0.8,
  HERO_LIGHT_RADIUS: 96,
  CAMPFIRE_LIGHT_RADIUS: 192,
  CAMPFIRE_BURN_MINUTES: 600,
  CAMPFIRE_REKINDLE_WOOD: 1,
  TREE_REGROW_DAYS: 3,
  HEALTH_MAX: 100,
  HUNGER_MAX: 100,
  HUNGER_MINUTES_PER_POINT: 30,
  HEALTH_MINUTES_PER_POINT: 10,
  WELL_FED: 50,
  FAINT_HEALTH: 50,
  FAINT_HUNGER: 50,
  SLEEP_START: 1080,
  SLEEP_HUNGER: 10,
  BERRY_YIELD: 3,
  MUSHROOM_YIELD: 1,
  BERRY_FOOD: 10,
  MUSHROOM_FOOD: 20,
  BUSH_REGROW_DAYS: 2,
  MUSHROOM_REGROW_DAYS: 2,
  NPC_WALK_SPEED: 1,
  NPC_PAUSE_MINUTES: 20,
  XP_HARVEST: 1,
  XP_SEARCH: 5,
  XP_CRAFT: 5,
  XP_DISCOVER: 10,
  LEVEL_FIRST_XP: 100,
  LEVEL_XP_STEP: 50,
  RESEARCH_COST: 1,
  STONE_AXE_BONUS: 2,
  STONE_PICKAXE_BONUS: 1,
  BAG_BONUS: 1,
  GRILLED_MUSHROOM_FOOD: 35,
  ENERGY_MAX: 100,
  ENERGY_DRAIN_MINUTES: 3,
  BLIGHT_HEALTH_MINUTES: 10,
  ENERGY_REGEN_MINUTES: 2,
  FAINT_ENERGY: 50,
  HEARTH_TILE: Object.freeze({ x: 32, y: 91 }),
  HEARTH_REACH: 160,
  HEARTH_LIGHT_RADIUS: 320,
  SAGE_YIELD: 1,
  SAGE_REGROW_DAYS: 3,
  SAGE_RADIUS: 5,
  IMPORTANT_NOTIFICATION_TICKS: 600,
  TREE_BRANCH_YIELD: 2,
  TALL_GRASS_FIBER_YIELD: 2,
  TALL_GRASS_REGROW_DAYS: 2,
  SAGE_SMOKE_LEVEL: 10,
  FLINT_HARVEST_TICKS: 180,
  STONE_HARVEST_TICKS: 90,
  HAND_HARVEST_TICKS: 60,
  PATH_STUCK_TICKS: 30,
  APPROACH_ATTEMPTS: 3,
});
