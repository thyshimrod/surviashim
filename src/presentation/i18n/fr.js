// @ts-check

/**
 * Nom d'une ressource selon la quantité.
 * @typedef {{ one: string, many: string }} ResourceNoun
 */

/** Textes affichés au joueur. */
export const TEXTS = Object.freeze({
  loading: 'Chargement…',
  loadError: (/** @type {string} */ file) => `Impossible de charger ${file}`,
  facings: Object.freeze({ up: 'haut', down: 'bas', left: 'gauche', right: 'droite' }),
  /** Nom des types de tuiles (fenêtre d'information, R-IHM-INS-002). */
  tileNames: Object.freeze({
    grass: 'Herbe',
    flowers: 'Fleurs',
    path: 'Chemin',
    water: 'Eau',
    tree: 'Arbre',
    rock: 'Rocher',
    stump: 'Souche',
    'ruin-floor': 'Dallage ancien',
    ruin: 'Vestige',
    'ruin-bookshelf': 'Bibliothèque en ruine',
    'ruin-bookshelf-searched': 'Bibliothèque fouillée',
    'ruin-chest': 'Coffre ancien',
    'ruin-chest-open': 'Coffre ouvert',
    'ruin-crate': 'Caisse',
    'ruin-crate-empty': 'Caisse vide',
  }),
  /** Verbe de chaque action de récolte. */
  harvestActions: Object.freeze({ cut: 'Couper', mine: 'Piocher', pick: 'Ramasser' }),
  /** @type {Readonly<Record<string, ResourceNoun>>} */
  resourceNouns: Object.freeze({
    wood: Object.freeze({ one: 'bois', many: 'bois' }),
    stone: Object.freeze({ one: 'pierre', many: 'pierres' }),
    flower: Object.freeze({ one: 'fleur', many: 'fleurs' }),
    flint: Object.freeze({ one: 'silex', many: 'silex' }),
    branch: Object.freeze({ one: 'branche', many: 'branches' }),
    fiber: Object.freeze({ one: 'fibre', many: 'fibres' }),
  }),
  /** Libellés du bandeau d'inventaire (R-IHM-HUD-001). */
  hudLabels: Object.freeze({
    wood: 'Bois',
    stone: 'Pierre',
    flower: 'Fleurs',
    flint: 'Silex',
    branch: 'Branches',
    fiber: 'Fibres',
  }),
  harvestButton: 'Récolter',
  closeButton: 'Fermer',
  tooFar: 'Trop loin : approchez-vous',
  /** Outil manquant, par sorte d'outil (R-IHM-INS-007). */
  toolNeeded: Object.freeze({ axe: 'Il faut une hache', pickaxe: 'Il faut une pioche' }),
  /** Nom des outils (data/tools.js). */
  toolNames: Object.freeze({
    'flint-axe': 'Hache en silex',
    'flint-pickaxe': 'Pioche en silex',
  }),
  // Fenêtre d'inventaire (R-IHM-INV-001).
  inventoryTitle: 'Inventaire',
  resourcesTitle: 'Ressources',
  toolsTitle: 'Outils',
  toolsEmpty: 'Aucun outil.',
  readButton: 'Lire',
  // Fenêtre de lecture (R-IHM-LIV-001).
  recipesLabel: (/** @type {string} */ list) => 'Recettes : ' + list,
  recipeLearned: (/** @type {string} */ name) => 'Recette apprise : ' + name,
  // Fenêtre d'artisanat (R-IHM-ART-001).
  craftTitle: 'Artisanat',
  craftButton: 'Fabriquer',
  craftEmpty: 'Aucune recette connue : lisez des livres pour en apprendre.',
  alreadyOwned: 'Déjà possédé',
  missingIngredients: 'Il manque des matériaux',
  crafted: (/** @type {string} */ name) => 'Fabriqué : ' + name,
  notCraftable: 'Pas encore fabricable',
  /** Nom des objets (data/items.js) : avec majuscule, et dans une phrase. */
  itemNames: Object.freeze({
    'blue-doll': Object.freeze({
      title: 'Poupée de chiffon bleue',
      inline: 'poupée de chiffon bleue',
    }),
  }),
  itemsTitle: 'Objets',
  itemsEmpty: 'Aucun objet.',
  itemFound: (/** @type {string} */ name) => 'Objet trouvé : ' + name,
  // Donner l'objet d'une quête (R-IHM-INS-005).
  giveButton: 'Donner',
  giveAction: (/** @type {string} */ name) => 'Donner : ' + name,
  // Quêtes (R-IHM-JRN-003, R-IHM-NOT-003) et expérience (R-IHM-HUD-002).
  questsTitle: 'Quêtes',
  questsEmpty: "Aucune quête pour l'instant.",
  questStatus: Object.freeze({ active: 'En cours', done: 'Terminée' }),
  questStarted: (/** @type {string} */ title) => 'Nouvelle quête : ' + title,
  questCompleted: (/** @type {string} */ title) => 'Quête terminée : ' + title,
  experienceGained: (/** @type {number} */ points) => '+' + points + ' expérience',
  experienceLabel: 'Expérience',
  /** Barre d'actions (R-IHM-BAR-001) : nom et touche de chaque fenêtre. */
  toolbar: Object.freeze({
    inventory: 'Inventaire (I)',
    craft: 'Artisanat (C)',
    journal: 'Journal (J)',
  }),
  talkAction: 'Parler',
  searchAction: 'Fouiller',
  // Trouvailles d'une fouille (R-IHM-NOT-002).
  bookFound: (/** @type {string} */ title) => 'Livre trouvé : ' + title,
  materialsFound: (/** @type {string} */ list) => 'Trouvé : ' + list,
  nothingFound: "Rien d'intéressant.",
  // Partie « Livres » du journal (R-IHM-JRN-002).
  booksTitle: 'Livres',
  booksEmpty: "Aucun livre pour l'instant.",
  plansLabel: (/** @type {string} */ list) => 'Plans : ' + list,
  placesTitle: 'Lieux',
  /** Indicateur de suite d'un dialogue (R-IHM-DIA-001). */
  dialogueMore: '▼',
  journalTitle: 'Journal',
  journalEmpty: "Aucun lieu pour l'instant.",
  journalDiscovered: 'Découvert',
  journalHintFrom: (/** @type {string} */ name) =>
    (/^[AEIOUYÉÈÊ]/i.test(name) ? "Indice d'" : 'Indice de ') + name,
  journalHint: (/** @type {string} */ text) => '« ' + text + ' »',
  placeDiscovered: (/** @type {string} */ name) => 'Lieu découvert : ' + name,
  placeRumored: (/** @type {string} */ name) => 'Nouvel indice : ' + name,
});
