// @ts-check

/**
 * Textes du contenu de la vallée (spécification B.6) : noms des lieux et des PNJ, pages des
 * dialogues. Les identifiants sont ceux de data/places.js et data/npcs.js.
 */
export const CONTENT_TEXTS = Object.freeze({
  /** @type {Readonly<Record<string, string>>} */
  placeNames: Object.freeze({
    vale: 'Le Vallon',
    'watchtower-ruins': 'Les Ruines du Guet',
    'silver-lake': "Le Lac d'Argent",
    'sunken-chapel': 'La Chapelle engloutie',
    'abandoned-hamlet': 'Le Hameau abandonné',
    'whispering-wood': 'Le Bois des Murmures',
    'rocky-hills': 'Les Collines rocheuses',
  }),
  /** Nom complet et prénom seul (pour « Indice d'Aldric »). */
  npcNames: Object.freeze({
    aldric: Object.freeze({ full: "Aldric, l'ermite", short: 'Aldric' }),
    elwyn: Object.freeze({ full: 'Elwyn, la pêcheuse', short: 'Elwyn' }),
    maelle: Object.freeze({ full: "Maëlle, l'ancienne meunière", short: 'Maëlle' }),
  }),
  /** Titre et texte des livres (data/books.js). */
  books: Object.freeze({
    'flint-knapping': Object.freeze({
      title: 'Le Tailleur de silex',
      text: "Choisis un silex sans fêlure. Frappe-le d'un geste sec avec une pierre plus dure : l'éclat qui se détache sera ta lame. Lie-la à un manche de bois vert avec des fibres tressées, et tu tiendras une hache digne de ce nom.",
    }),
    stonework: Object.freeze({
      title: "L'Art de la pierre",
      text: 'Le silex coupe, mais il casse. Une bonne pierre, bien choisie et patiemment polie, tient des saisons entières. Emmanche-la serré : le bûcheron qui la porte abat deux fois plus de bois.',
    }),
    'forager-guide': Object.freeze({
      title: 'Le Guide du cueilleur',
      text: "Tresse un sac de fibres, large et souple : rien ne se perd plus quand on cueille. Et ne mange pas les champignons crus quand un feu brûle à côté : grillés, ils tiennent au corps jusqu'au soir.",
    }),
    'watchman-notebook': Object.freeze({
      title: 'Carnet du guetteur',
      text: "Troisième nuit sans relève. Des feux partout sur les collines, et ce silence… Le vieux prêtre dit que la fumée de la sauge de l'aube les tient à distance. J'ai allumé un feu de camp au pied de la tour. Pourvu qu'il tienne jusqu'au matin.",
    }),
  }),
  /** Titre et description des quêtes (data/quests.js). */
  quests: Object.freeze({
    'blue-doll': Object.freeze({
      title: 'La poupée de Maëlle',
      description:
        "Maëlle, l'ancienne meunière, a laissé au Hameau abandonné la poupée de chiffon bleue de sa fille : dans le coffre de sa maison, au nord-est du hameau. Elle aimerait tant la retrouver.",
    }),
  }),
  /** Noms des plans décrits par les livres. */
  /** @type {Readonly<Record<string, string>>} */
  plans: Object.freeze({
    'flint-axe': 'hache en silex',
    'flint-pickaxe': 'pioche en silex',
    campfire: 'feu de camp',
    'stone-axe': 'hache en pierre',
    'stone-pickaxe': 'pioche en pierre',
    'gatherer-bag': 'sac du cueilleur',
    'grilled-mushroom': 'champignons grillés',
  }),
  /** @type {Readonly<Record<string, string>>} */
  pages: Object.freeze({
    'aldric-1':
      "Tiens, un visage nouveau… Bienvenue dans le Vallon. Ici, la Horde n'est jamais venue. Personne ne sait vraiment pourquoi.",
    'aldric-2':
      'Si tu veux comprendre ce qui est arrivé à la vallée, monte vers le nord. Les Ruines du Guet surveillaient jadis toute la contrée.',
    'aldric-3':
      "Mais rien ne presse. Cueille des fleurs… Et pour couper du bois, il te faudra une hache : les anciens savaient la tailler dans le silex. La vallée t'attendra.",
    'elwyn-1': 'Chut… Tu vas faire fuir les poissons.',
    'elwyn-2':
      "Le Lac d'Argent n'a pas toujours été si grand. À l'est, l'eau a englouti une vieille chapelle. Les soirs de pleine lune, on voit encore luire ses vitraux.",
    'maelle-1':
      'Je viens du hameau, au sud-est. Nous sommes tous partis quand les loups noirs sont arrivés.',
    'maelle-2':
      'Tout y est resté : les maisons, le vieux moulin, nos affaires… Si tu y vas, sois prudent. On dit que des ombres y rôdent la nuit.',
    'maelle-3':
      'Et si tu trouves une poupée de chiffon bleue… elle était à ma fille. Elle doit être restée dans le coffre de notre maison, au nord-est du hameau. Rapporte-la-moi.',
    'maelle-4':
      'Ma fille ne lâche plus sa poupée. Le hameau me manque, mais grâce à toi, un peu de lui est revenu.',
    'maelle-thanks':
      "Sa poupée ! Tu l'as retrouvée… Merci, du fond du cœur. Ma fille va pleurer de joie.",
  }),
});
