# Surshim

RPG 2D en pixel art, vu de dessus : on rebâtit un village dans une vallée envahie par une horde de monstres. Cosy le jour, défense la nuit. JavaScript natif (canvas 2D), sans framework ni bundler.

*Surshim* est un nom de travail.

- Vision et concepts : [docs/GAME_DESIGN.md](docs/GAME_DESIGN.md) (spécification globale)
- Règles du jeu : [docs/SPECIFICATION.md](docs/SPECIFICATION.md) (spécification détaillée)
- Règles d'architecture et de code : [GUIDELINES.md](GUIDELINES.md)
- Décisions d'architecture : [docs/decisions/](docs/decisions/)

## État

**v0.10 (en cours) : le Foyer et la Flétrissure.** Le Foyer, un feu ancien qui ne s'éteint jamais, brûle au Vallon, à deux pas du départ : grand halo la nuit, il recharge l'énergie à proximité et l'on peut y dormir. Le Bois des Murmures et les Collines rocheuses sont flétris (brume violette) : l'énergie, affichée au bandeau, s'y épuise ; à zéro, on perd des PV. En lisière pousse la sauge de l'aube ; brûlée depuis l'inventaire (« Brûler ») près d'un feu allumé, elle purifie définitivement les tuiles flétries à 5 tuiles autour du feu.

**v0.9 (livrée) : la recherche.** On gagne de l'expérience en jouant : récolter (+1), fouiller (+5), fabriquer (+5), découvrir un lieu (+10), finir une quête. Les niveaux, de plus en plus espacés (100, 250, 450…), donnent chacun un point de recherche ; le bandeau affiche « Niveau 2 · 120/250 ». Deux livres de recherche sont cachés dans les ruines (« L'Art de la pierre » au Hameau, « Le Guide du cueilleur » à la Chapelle) : les lire découvre leurs plans, qu'on apprend dans la fenêtre « Recherche » (touche R ou icône parchemin) pour 1 point chacun. Hache et pioche en pierre (+1 bois, +1 pierre ; il faut d'abord l'outil en silex), sac du cueilleur (+1 baie ou champignon), champignons grillés (à cuire près d'un feu allumé, ils rassasient de 35).

**v0.8 (livrée) : vivre au rythme des jours.** Le bandeau affiche les PV et la faim. La faim baisse d'environ 40 points par journée ; rassasié, on récupère des PV, affamé on en perd ; à 0 PV, on s'évanouit et l'on se réveille au matin dans le Vallon, sans rien perdre. On cueille des baies sur les buissons du Vallon et des champignons en lisière des bois (ils repoussent en 2 jours), et on les mange depuis l'inventaire (« Manger »). Dès 18:00, on peut dormir près d'un feu allumé (« Dormir » dans sa fenêtre) : réveil à 6:00, PV au maximum, et la partie est sauvegardée ; au lancement, elle reprend. L'icône « Partie » de la barre d'actions permet de recommencer. Les habitants se promènent autour de chez eux.

**v0.7 (livrée) : le temps passe.** Une horloge tourne en bout de bandeau (« Jour 1 · 6:00 ») : de 6:00 à 2:00, une journée dure 12 minutes réelles. Le soir, la lumière baisse ; la nuit, on ne voit qu'autour du héros et des feux. Le feu de camp (3 pierres + 2 bois, appris dans le *Carnet du guetteur*) se pose devant le héros depuis l'inventaire ; il brûle 10 heures de jeu et se ravive avec 1 bois. Les arbres coupés repoussent en 3 jours.

**v0.6 (livrée) : la première quête.** Une barre d'actions verticale, à gauche, ouvre l'inventaire, l'artisanat et le journal (le survol indique le nom et la touche). Maëlle confie une quête : retrouver la poupée de chiffon bleue de sa fille, cachée dans un coffre du Hameau abandonné. On la lui rend avec le bouton « Donner » de sa fenêtre d'information ; elle remercie et la quête rapporte 50 points d'expérience, affichés en fin de bandeau. Le journal suit les quêtes.

**v0.5 (livrée) : premier artisanat.** Au départ, on ne peut que ramasser : couper un arbre demande une hache, piocher un rocher une pioche. Dans les Ruines du Guet, on trouve le livre « Le Tailleur de silex » et de quoi fabriquer ces deux outils. La fenêtre d'inventaire (touche I) montre les ressources, les outils et les livres ; « Lire » ouvre un livre et en apprend les recettes. La fenêtre d'artisanat (touche C) liste les recettes connues et fabrique les outils. Les fenêtres s'ouvrent au milieu de l'écran, une à la fois.

**v0.4 (livrée) : fouiller.** Les ruines contiennent des bibliothèques, des coffres et des caisses. Un clic ouvre la fenêtre d'information ; à portée, « Fouiller » donne des livres (au plus 2) et des matériaux (silex, branches, fibres). Chaque élément ne se fouille qu'une fois. Les livres trouvés, avec leurs plans, sont rangés dans le journal. L'inventaire et le journal utilisent l'atlas d'icônes (`data/icons.js`), et les ruines sont dessinées avec trois nouvelles planches d'intérieurs.

**v0.3 (livrée) : explorer.** Une vallée de 160 × 120 tuiles, générée par `tools/maps/generateValley.js`. On part du Vallon, un coin préservé. On découvre des lieux et trois ruines (tour de guet, chapelle engloutie, hameau abandonné). Trois habitants (Aldric, Elwyn, Maëlle) racontent la vallée et donnent des indices. Un journal (touche J) garde les lieux découverts et les indices, et des notifications signalent chaque découverte. Une forêt dense entoure la vallée.

**v0.2 (livrée) : récolter.** Cliquer sur un arbre, un rocher ou des fleurs ouvre une fenêtre d'information ; à portée, le bouton « Récolter » donne du bois, de la pierre ou des fleurs (l'arbre laisse une souche). L'inventaire est affiché en haut à gauche. La caméra garde le héros au centre de l'écran, et l'affichage a la taille de la fenêtre, en pixels physiques.

**v0.1 (livrée) : se déplacer dans la clairière** (carte à tuiles, héros animé, collisions), dessinée avec la planche RPG Maker cataloguée dans `data/tileset.js`.

## Prérequis

- Node.js ≥ 22

```bash
npm install
```

## Jouer

```bash
npm run serve
```

Puis ouvrir <http://localhost:8081> (port 8081).

| Touche | Effet |
|---|---|
| Flèches, ou ZQSD (WASD en QWERTY) | Se déplacer ; deux touches pour une diagonale |
| Clic sur un arbre, un rocher, des fleurs, une bibliothèque, un coffre, une caisse | Ouvrir la fenêtre d'information |
| Bouton « Récolter » ou « Fouiller » | Récolter ou fouiller l'élément (il faut être à côté, et avoir une hache ou une pioche pour couper ou piocher) |
| Clic sur un habitant, puis « Parler » | Engager la conversation (il faut être à côté) |
| Clic sur la boîte de dialogue, Espace ou Entrée | Page suivante |
| Icônes de la barre d'actions, ou I, C, J, R | Ouvrir ou fermer l'inventaire (bouton « Lire » sur un livre), l'artisanat (bouton « Fabriquer »), le journal, la recherche (bouton « Rechercher ») |
| Clic sur un habitant, puis « Donner » | Rendre l'objet d'une quête |
| Clic sur un feu de camp allumé, puis « Dormir » | Dormir jusqu'au matin (dès 18:00) et sauvegarder |
| Échap ou × | Terminer le dialogue, ou fermer la fenêtre ouverte |

### Mode debug

Ouvrir <http://localhost:8081/index.html?debug=1> : panneau (FPS, tick, position, tuile, orientation, marche), boîte de collision du joueur en rouge, tuiles infranchissables encadrées.

| Touche | Effet |
|---|---|
| `P` | Pause / reprise |
| `N` | En pause : avance d'un tick |
| `H` | Avance l'horloge d'une heure (pour voir la nuit) |
| `+` / `-` | Vitesse ×2 / ÷2 |

Catalogue des sprites (toutes les planches), des icônes nommées et des personnages : <http://localhost:8081/tools/catalog/>.

Dans la console : `surshim.game.getState()`, `surshim.loop.togglePause()`, `surshim.parameters`, et `surshim.renderer` / `surshim.ui` pour l'affichage.

## Réduire une planche RPG Maker MV (48 px) en 32 px

```bash
node tools/assets/downscaleTileset.js assets/images/tilesets/mv-48px/interior-haunted.png assets/images/tilesets/interior-haunted.png
```

## Regénérer la vallée

```bash
node tools/maps/generateValley.js
```

L'aléatoire est seedé : la même graine redonne la même carte. L'outil vérifie que chaque lieu et chaque habitant est accessible depuis le départ. On peut ensuite retoucher `data/maps/valley.js` à la main.

## Vérifier

| Commande | Rôle |
|---|---|
| `npm run check` | **Tout** : lint (SonarJS, JSDoc), typage, formatage, duplication, tests, couverture de la spécification. À lancer avant chaque commit. |
| `npm test` | Tests unitaires, de spécification, de données et d'architecture |
| `npm run spec:check` | Bilan des règles de la spécification et de leurs tests |
| `npm run quality:report` | Rapport HTML de qualité dans `reports/quality.html` |

## Faire évoluer le jeu

1. Proposer ou faire évoluer un concept dans `docs/GAME_DESIGN.md` ; une fois `VALIDÉ`…
2. … le décliner en règles dans `docs/SPECIFICATION.md` (statut `NOUVEAU` ou `MODIFIÉ`, historique).
3. Écrire les tests de `tests/spec/` : un `describe('R-…')` par règle, un `it('ex.N — …')` par exemple.
4. Implémenter dans `src/core/`, puis l'affichage dans `src/presentation/`.
5. `npm run check`.
