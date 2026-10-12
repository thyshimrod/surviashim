# Surshim — Spécification détaillée

| Version courante | Date | Statut du document |
|---|---|---|
| **v0.6** | 2026-10-12 | Validée — prête pour l'implémentation |

La vision du jeu et ses concepts sont décrits dans la [spécification globale](GAME_DESIGN.md). Ce document-ci contient les **règles précises et testables**, version par version.

---

## Sommaire

- [Partie A — Mode d'emploi de la spécification](#partie-a--mode-demploi-de-la-spécification)
- [Partie B — Conventions du jeu](#partie-b--conventions-du-jeu)
- [Partie C — Paramètres](#partie-c--paramètres)
- [Partie D — Règles](#partie-d--règles)
  - [1. JOU — Joueur](#1-jou--joueur)
  - [2. MON — Monde](#2-mon--monde)
  - [3. IHM — Interface joueur](#3-ihm--interface-joueur)
  - [4. RES — Ressources et récolte](#4-res--ressources-et-récolte)
  - [5. INV — Inventaire](#5-inv--inventaire)
  - [6. PNJ — Personnages non joueurs](#6-pnj--personnages-non-joueurs)
  - [7. ART — Artisanat](#7-art--artisanat)
- [Partie E — Questions](#partie-e--questions)
- [Partie F — Journal des versions](#partie-f--journal-des-versions)

---

# Partie A — Mode d'emploi de la spécification

## A.1 Structure

Les règles sont rangées en arborescence **Thème → Sous-thème → Règle** :

```
1. JOU — Joueur                       ← thème
   1.1 DEP — Déplacement               ← sous-thème
       R-JOU-DEP-002 · Vitesse de marche   ← règle unitaire
```

- Un **thème** regroupe un domaine du jeu (le joueur, le monde, les villageois, la menace…).
- Un **sous-thème** regroupe un aspect de ce domaine (déplacement, orientation, collisions…).
- Une **règle** décrit **un seul comportement** vérifiable.

Lorsque ce fichier dépassera ~60 règles, il sera découpé en un fichier par thème dans `docs/spec/` ; les identifiants ne changeront pas.

## A.2 Identifiant d'une règle

Format : **`R-<THÈME>-<SOUS-THÈME>-<NNN>`** — par exemple `R-JOU-DEP-002`.

- `THÈME` et `SOUS-THÈME` : codes de 3 lettres majuscules, listés dans les titres de la partie D.
- `NNN` : numéro séquentiel dans le sous-thème, sur 3 chiffres.
- Un identifiant est **définitif** : il ne change jamais, même si la règle est modifiée ou déplacée, et il n'est **jamais réutilisé**, même après suppression de la règle.

## A.3 Format d'une règle

Chaque règle suit exactement ce gabarit (il est lu par le script de contrôle de couverture, cf. A.6) :

```markdown
#### R-JOU-DEP-002 · Vitesse de marche

| Statut | Version | Paramètres |
|---|---|---|
| NOUVEAU | v0.1 | `PLAYER_WALK_SPEED` |

**Règle** — À chaque tick où une direction de déplacement est demandée, le joueur avance de `PLAYER_WALK_SPEED` pixels dans cette direction.

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | le joueur en (100, 100), vitesse 2 px/tick | la direction droite est demandée pendant 1 tick | il est en (102, 100) |

**Notes** — Précisions, justification, cas exclus (facultatif).

**Historique** — v0.1 : création.
```

| Champ | Rôle |
|---|---|
| Titre | Identifiant + nom court, unique. |
| Statut | Voir A.4. |
| Version | Version de la spécification dans laquelle la règle a été créée ou modifiée pour la dernière fois. |
| Paramètres | Valeurs réglables utilisées par la règle (définies en partie C). La règle cite le **nom** du paramètre, jamais sa valeur seule, pour que l'équilibrage ne modifie pas le texte des règles. |
| Règle | Une ou deux phrases, au présent, sans ambiguïté. |
| Exemples | Cas concrets chiffrés au format **Étant donné / Quand / Alors**. Chaque ligne devient un test. Au moins un exemple par règle, plus les cas limites. Les exemples peuvent utiliser des positions ou valeurs propres au test, différentes des paramètres du jeu, pour rester simples à calculer. |
| Notes | Facultatif. |
| Historique | Une ligne par version : ce qui a changé et pourquoi. |

## A.4 Cycle de vie et statuts

| Statut | Signification | Testé ? |
|---|---|---|
| `À CONFIRMER` | Proposition en attente de validation. Ne pas implémenter. | Non |
| `NOUVEAU` | Règle créée dans la version **en cours**. | Oui |
| `MODIFIÉ` | Règle existante changée dans la version **en cours**. L'ancienne formulation est conservée dans l'historique. | Oui (tests mis à jour) |
| `EN VIGUEUR` | Règle stable, inchangée depuis une version précédente. | Oui |
| `SUPPRIMÉ` | Règle abandonnée. Elle reste dans le document, texte barré, avec la raison et la règle qui la remplace éventuellement. | Non — ses tests sont supprimés |

```
À CONFIRMER ──validation──▶ NOUVEAU ──clôture de version──▶ EN VIGUEUR
     │                                                         │
     │                                 ┌───────────────────────┤
     │                                 ▼                       ▼
     │                              MODIFIÉ ──clôture──▶  EN VIGUEUR
     │                                 │
     └──────────abandon───────────▶ SUPPRIMÉ   (définitif)
```

**Clôture d'une version** : quand une version est livrée, toutes ses règles `NOUVEAU` et `MODIFIÉ` passent à `EN VIGUEUR`, une entrée est ajoutée au journal (partie F), et la version courante est incrémentée. Ainsi, `NOUVEAU` et `MODIFIÉ` montrent toujours **ce qui change dans la version en cours de développement**.

**Modifier une règle `EN VIGUEUR`** :
1. passer le statut à `MODIFIÉ` et mettre à jour la version ;
2. réécrire la règle et ses exemples ;
3. ajouter dans l'historique : `vX.Y : <ancienne formulation> → <raison du changement>`.

Une règle encore `NOUVEAU` ou `À CONFIRMER` (jamais livrée) peut être retouchée sans changer de statut ; la retouche est simplement notée dans l'historique.

**Supprimer une règle** :
1. passer le statut à `SUPPRIMÉ` ;
2. barrer le texte (`~~…~~`) ;
3. indiquer dans l'historique la raison et, le cas échéant, `Remplacée par R-…`.

## A.5 Rédiger une bonne règle

| À faire | À éviter |
|---|---|
| Une règle = un comportement | « Le joueur frappe vers l’avant et inflige 1 dégât » (deux règles) |
| Valeurs chiffrées via un paramètre | « Le joueur marche lentement » |
| Observable de l'extérieur (position, PV, inventaire, heure du jour) | Décrire l'implémentation (« la classe Player appelle… ») |
| Cas limites explicites (égalité, zéro, simultanéité) | Laisser deviner ce qui se passe à la frontière |
| Vocabulaire du glossaire (partie B) | Synonymes variables (« monstre », « ennemi », « créature ») |

## A.6 Des règles aux tests

1. **Chaque exemple devient un test** dans `tests/spec/`, dont le nom commence par l'identifiant de la règle et le numéro d'exemple :

   ```js
   // tests/spec/joueur.spec.test.js
   describe('R-JOU-DEP-002 · Vitesse de marche', () => {
     it('ex.1 — le joueur en (100, 100) est en (102, 100) après 1 tick vers la droite', () => {
       const game = createTestGame({ player: { x: 100, y: 100 }, walkSpeed: 2 });

       game.execute(setMoveIntent('right'));
       game.advanceTicks(1);

       assert.deepEqual(game.getState().player.position, { x: 102, y: 100 });
     });
   });
   ```

2. **Les paramètres** (partie C) sont reproduits dans `data/` ; un test vérifie que les valeurs de `data/` sont égales à celles du tableau de la partie C.

3. **Le script de couverture de la spécification** (`npm run spec:check`) lit ce fichier et les tests, puis signale :
   - une règle `NOUVEAU`, `MODIFIÉ` ou `EN VIGUEUR` sans test ;
   - un exemple sans test correspondant ;
   - un test qui cite une règle `SUPPRIMÉ`, `À CONFIRMER` ou un identifiant inconnu.

4. **Dans le code**, l'implémentation d'une règle cite son identifiant en commentaire : `// R-JOU-DEP-002`.

## A.7 Lien avec la spécification globale

- Chaque règle découle d'un **concept** de la [spécification globale](GAME_DESIGN.md) (`C-<THÈME>-<NN>`), cité dans ses notes : `**Notes** — Concept C-JOU-01.`
- Un concept ne peut être décliné en règles que lorsqu'il est `VALIDÉ` ; une fois toutes ses règles écrites, il passe à `DÉCLINÉ` et cite ses règles.
- Les codes de thème sont communs aux deux documents :

| Code | Thème | Code | Thème |
|---|---|---|---|
| `PAR` | Partie (démarrage, tick, commandes) | `CON` | Construction |
| `JOU` | Joueur | `AGR` | Agriculture et élevage |
| `MON` | Monde (carte, collisions, temps, Foyer) | `VIL` | Villageois |
| `RES` | Ressources et récolte | `CBT` | Combat |
| `INV` | Inventaire et objets | `ENN` | Ennemis |
| `ART` | Artisanat | `MEN` | Menace (Flétrissure, raids) |
| `PRO` | Progression | `ECO` | Économie |
| `SAU` | Sauvegarde, mort, fin de journée | `IHM` | Interface joueur |
| `TEC` | Recherche et technologies | `PNJ` | Personnages non joueurs |

---

# Partie B — Conventions du jeu

## B.1 Glossaire

| Terme | Définition |
|---|---|
| **Partie** | Une session de jeu, d'une nouvelle partie (ou d'un chargement) jusqu'à la fermeture. |
| **Tick** | Une mise à jour de la logique du jeu. Il y a `TICK_RATE` ticks par seconde de jeu, quelle que soit la fréquence d'affichage de l'écran. |
| **Joueur** | Le personnage dirigé par la personne qui joue. |
| **Carte** | Grille de tuiles sur laquelle se déroule le jeu (B.3). Une carte correspond à une **zone** du monde. |
| **Tuile** | Case carrée de la carte, de `TILE_SIZE` px de côté (32 px). Elle est **franchissable** (herbe, terre, chemin) ou **infranchissable** (arbre, rocher, eau, mur). |
| **Position** | Point du monde où se trouve un personnage : le milieu de ses **pieds** (B.3). |
| **Boîte de collision** | Rectangle autour des pieds d'un personnage, qui ne peut pas chevaucher une tuile infranchissable (B.3). |
| **Orientation** | Direction cardinale vers laquelle le joueur fait face : haut, bas, gauche ou droite. |
| **Direction demandée** | Direction de déplacement résultant des touches enfoncées : aucune, l'une des 4 directions cardinales ou l'une des 4 diagonales. |
| **Vue** | Rectangle du monde affiché à l'écran ; il a la taille de la fenêtre, en pixels physiques (R-IHM-AFF-001). |
| **Élément récoltable** | Tuile dont on peut tirer une ressource : arbre, rocher, fleurs (R-RES-ELE-001). |
| **Ressource** | Matière que le joueur accumule : bois, pierre, fleur. |
| **Rendement** | Quantité de ressource que donne un élément récolté. |
| **Inventaire** | Quantité de chaque ressource que possède le joueur. |
| **Portée** | Distance maximale entre la position du joueur et le centre d'une tuile pour la récolter (`HARVEST_REACH`). |
| **Souche** | Ce qui reste d'un arbre coupé : franchissable, non récoltable. |
| **Désigner** | Choisir une tuile ou un PNJ en cliquant dessus (R-IHM-INS-001, R-IHM-INS-005). |
| **Vallée** | La carte du monde (R-MON-CAR-001). |
| **Lieu** | Rectangle de tuiles nommé de la vallée : le Vallon, le Lac d'Argent, des ruines… (R-MON-LIE-001). |
| **Découvrir** un lieu | Y entrer pour la première fois (R-MON-LIE-002). |
| **PNJ** | Personnage non joueur : un habitant de la vallée, immobile, à qui l'on peut parler (R-PNJ-POS-001). |
| **Dialogue** | Conversation avec un PNJ, faite de **pages** de texte lues l'une après l'autre (R-PNJ-DIA-001, 002). |
| **Indice** | Information donnée par un PNJ sur un lieu à visiter ; il est noté au journal (R-PNJ-DIA-004). |
| **Journal** | Fenêtre qui liste les quêtes, les lieux découverts et les indices reçus (R-IHM-JRN-001, R-IHM-JRN-003). |
| **Élément à fouiller** | Bibliothèque, coffre ou caisse des ruines, qu'on peut fouiller une fois (R-RES-FOU-001). |
| **Cachette** | Élément à fouiller dont le contenu est défini dans les données (`data/searchSpots.js`) : des livres et des matériaux. |
| **Livre** | Objet trouvé en fouillant ; il a un titre, un texte et décrit des plans. Les livres trouvés forment la **bibliothèque** du joueur (R-INV-LIV-001). |
| **Plan** | Recette que décrit un livre (hache en silex, feu de camp…). Lire un livre de survie l'apprend (R-INV-LIV-002) ; les plans avancés passeront par la recherche (concept C-TEC-03). |
| **Livre de survie** | Livre dont la lecture apprend les plans (tous les livres de la v0.5). |
| **Recette connue** | Plan appris en lisant un livre. On ne fabrique que les recettes connues qui ont une recette définie (B.8). |
| **Outil** | Objet qui permet une action de récolte : la **hache** pour couper, la **pioche** pour piocher. Le joueur en possède au plus un de chaque (R-INV-OUT-001). |
| **Fabriquer** | Transformer des ingrédients en objet, à la main, en suivant une recette connue (R-ART-FAB-001). |
| **Fenêtre d'information** | Fenêtre qui décrit l'élément désigné et permet de le récolter (R-IHM-INS-002). |
| **Barre d'actions** | Colonne d'icônes à gauche de l'écran qui ouvrent les fenêtres d'inventaire, d'artisanat et le journal (R-IHM-BAR-001). |
| **Quête** | Demande d'un PNJ, confiée par une page de son dialogue : rapporter un objet. Elle est **en cours**, puis **terminée** quand on lui a donné l'objet (R-PNJ-QUE-001, 002). |
| **Objet** | Chose unique que possède le joueur, comme la poupée de chiffon bleue ; on la trouve en fouillant et on peut la donner (R-INV-OBJ-001). |
| **Expérience** | Points que gagne le joueur, d'abord en terminant des quêtes (R-JOU-EXP-001). |
| **Fenêtres** | Fenêtres d'information, d'inventaire, de lecture, d'artisanat et journal : une seule est ouverte à la fois (R-IHM-FEN-001). |
| **Notification** | Court message affiché au-dessus du héros, avec un bouton × (R-IHM-NOT-001). |
| **Image** (d'animation) | Une vignette d'une feuille de sprites ; une animation fait défiler plusieurs images. Dans une feuille de personnage, chaque **ligne** correspond à une orientation et les images sont numérotées de 1 à 3, de gauche à droite. |
| **Commande** | Action demandée par le joueur. Le jeu l'accepte ou la refuse avec un motif. |
| **Foyer**, **Horde**, **Flétrissure**, **Villageois**, **Raid** | Voir la spécification globale ; ces termes seront définis ici quand une règle les utilisera. |

## B.2 Temps

- Toutes les vitesses et durées sont exprimées **en ticks** ([décision 0002](decisions/0002-temps-en-ticks.md)).
- `TICK_RATE` = 60 : 1 seconde de jeu = 60 ticks.
- L'heure **du monde** (matin, nuit…) sera dérivée du nombre de ticks écoulés (concept C-MON-02, à venir).

## B.3 Repère, unités et tuiles

- Repère en 2 dimensions, en **pixels de monde (px)**, indépendants de l'agrandissement à l'écran.
- Axe **x** horizontal, croissant vers la droite ; axe **y** vertical, croissant vers le **bas**. L'origine (0, 0) est le coin supérieur gauche de la carte.
- La tuile de colonne `c` et de ligne `r` (numérotées à partir de 0) couvre `c × TILE_SIZE ≤ x < (c + 1) × TILE_SIZE` et `r × TILE_SIZE ≤ y < (r + 1) × TILE_SIZE`. Notation : tuile `(c, r)`.
- La **position** d'un personnage est le milieu de ses pieds. Sa **boîte de collision** est le rectangle de `PLAYER_HITBOX_WIDTH` × `PLAYER_HITBOX_HEIGHT` px centré horizontalement sur la position, dont le bord inférieur passe par la position : de `x − largeur / 2` à `x + largeur / 2`, et de `y − hauteur` à `y`.
- Directions : **haut** = y décroissant, **bas** = y croissant, **gauche** = x décroissant, **droite** = x croissant.
- Les valeurs décimales s'écrivent avec une virgule ; dans une position, les deux coordonnées sont alors séparées par un point-virgule : (101,5 ; 100).

## B.4 Ordre d'exécution d'un tick

Un tick exécute, dans l'ordre : 1. le déplacement du joueur (R-JOU-DEP-*, R-MON-COL-*, R-PNJ-POS-002, R-PNJ-DIA-003) ; 2. la découverte des lieux (R-MON-LIE-002), puis l'annonce des lieux où le joueur revient (R-MON-LIE-003).

## B.5 Commandes du joueur

Les commandes sont traitées immédiatement, entre deux ticks.

| Commande | Effet | Motifs de refus possibles, vérifiés dans cet ordre |
|---|---|---|
| Direction demandée | Fixe la direction appliquée à chaque tick (R-JOU-DEP-001) | — (jamais refusée) |
| Récolter une tuile | Récolte l'élément de la tuile (R-RES-REC-001 à 004, R-RES-OUT-001) | `NOTHING_TO_HARVEST` : la tuile est hors de la carte ou n'est pas récoltable ; `MISSING_TOOL` : il faut un outil que le joueur n'a pas ; `OUT_OF_REACH` : l'élément est hors de portée |
| Parler à un PNJ | Commence un dialogue (R-PNJ-DIA-001) | `NOBODY_TO_TALK_TO` : ce PNJ n'existe pas ; `ALREADY_TALKING` : un dialogue est déjà en cours ; `OUT_OF_REACH` : le PNJ est trop loin |
| Fouiller une tuile | Fouille l'élément de la tuile (R-RES-FOU-001 à 004) | `NOTHING_TO_SEARCH` : la tuile est hors de la carte ou ne se fouille pas ; `OUT_OF_REACH` : l'élément est hors de portée |
| Page suivante | Passe à la page suivante du dialogue, ou le termine après la dernière (R-PNJ-DIA-002) | `NO_DIALOGUE` : aucun dialogue en cours |
| Terminer le dialogue | Termine le dialogue (R-PNJ-DIA-002) | `NO_DIALOGUE` : aucun dialogue en cours |
| Donner à un PNJ | Donne l'objet d'une quête en cours (R-PNJ-QUE-002) | `NOBODY_TO_TALK_TO` : ce PNJ n'existe pas ; `ALREADY_TALKING` : un dialogue est en cours ; `OUT_OF_REACH` : le PNJ est trop loin ; `NOTHING_TO_GIVE` : aucune quête en cours de ce PNJ dont le joueur a l'objet |
| Lire un livre | Apprend les plans du livre (R-INV-LIV-002) | `BOOK_NOT_OWNED` : le livre n'est pas dans la bibliothèque |
| Fabriquer | Fabrique l'objet d'une recette (R-ART-FAB-001, 002) | `UNKNOWN_RECIPE` : la recette n'existe pas ou n'a pas été apprise ; `ALREADY_OWNED` : l'outil est déjà possédé ; `MISSING_INGREDIENTS` : il manque des ingrédients |

## B.6 La vallée (v0.3)

La carte est générée une fois pour toutes par `tools/maps/generateValley.js` (aléatoire seedé, donc reproductible) et enregistrée dans `data/maps/valley.js`, qu'on peut retoucher à la main. Le contenu ci-dessous est une donnée (`data/places.js`, `data/npcs.js`, textes dans `src/presentation/i18n/`), pas une règle : on le change sans modifier la spécification.

```
  N        Bois des Murmures              Collines rocheuses
  ▲   Ruines du Guet
                         Lac d'Argent        Chapelle engloutie
                          (Elwyn)
      Le Vallon (départ, Aldric)       (Maëlle)
                                             Hameau abandonné
```

| Lieu | Ce qu'on y trouve | Indice donné par |
|---|---|---|
| Le Vallon | Départ, coin préservé, étang, fleurs | — |
| Les Ruines du Guet | Vieille tour de guet en ruine, au nord | Aldric, l'ermite (au Vallon) |
| Le Lac d'Argent | Grand lac au centre | — |
| La Chapelle engloutie | Ruines au bord est du lac | Elwyn, la pêcheuse (rive sud du lac) |
| Le Hameau abandonné | Maisons en ruine, au sud-est | Maëlle, l'ancienne meunière (au carrefour) |
| Le Bois des Murmures, les Collines rocheuses | Forêt dense, rochers | — |

## B.7 Les cachettes des ruines (v0.4)

Contenu défini dans `data/searchSpots.js` et `data/books.js` (textes dans `src/presentation/i18n/frContent.js`) ; c'est une donnée, pas une règle.

| Ruine | Élément | Contenu |
|---|---|---|
| Les Ruines du Guet | Bibliothèque en ruine | Livre « Le Tailleur de silex » (plans : hache et pioche en silex), 2 silex |
| Les Ruines du Guet | Coffre ancien | 4 branches, 2 fibres (v0.5 : 3 → 4 branches, pour fabriquer la hache **et** la pioche avec le contenu des Ruines du Guet) |
| La Chapelle engloutie | Bibliothèque en ruine | Livre « Carnet du guetteur » (plan : feu de camp ; il parle de la sauge de l'aube) |
| La Chapelle engloutie | Caisse | 1 silex, 3 fibres |
| Le Hameau abandonné | 2 caisses, 1 coffre | Branches, fibres, silex ; une caisse est vide. v0.6 : le coffre (tuile (127, 96)) contient aussi la **poupée de chiffon bleue** (B.9) |

## B.8 Outils et recettes (v0.5)

Contenu défini dans `data/tools.js`, `data/recipes.js` et `data/books.js` (noms dans `src/presentation/i18n/`) ; c'est une donnée, pas une règle.

| Objet | Sorte d'outil | Permet | Recette | Appris en lisant |
|---|---|---|---|---|
| Hache en silex | hache | couper un arbre | 1 silex, 2 branches, 1 fibre | « Le Tailleur de silex » |
| Pioche en silex | pioche | piocher un rocher | 1 silex, 2 branches, 1 fibre | « Le Tailleur de silex » |
| Feu de camp | — | — | pas encore de recette : il faudra pouvoir le poser (concept C-ART-05, v0.6) | « Carnet du guetteur » |

**Convention des exemples** — Dans les exemples des règles de récolte (R-RES-REC-001 à 004, R-IHM-INS-003), le joueur possède la hache et la pioche, sauf mention contraire.

## B.9 La première quête (v0.6)

Contenu défini dans `data/quests.js`, `data/items.js` et `data/npcs.js` (textes dans `src/presentation/i18n/`) ; c'est une donnée, pas une règle.

| Quête | Confiée par | Page qui la confie | Objet à rapporter | Où le trouver | Récompense | Remerciement | Page « après la quête » |
|---|---|---|---|---|---|---|---|
| La poupée de Maëlle | Maëlle, l'ancienne meunière (sa page 3 dit où chercher : le coffre de sa maison, au nord-est du hameau) | `maelle-3` | Poupée de chiffon bleue | Coffre du Hameau abandonné, tuile (127, 96) | 50 expérience | `maelle-thanks` | `maelle-4` (remplace `maelle-3`) |

---

# Partie C — Paramètres

Valeurs réglables **validées**. Les règles les citent par leur nom. Modifier une valeur ici = rééquilibrage (statut `MODIFIÉ` sur le paramètre, pas sur les règles). Les valeurs encore en discussion sont dans la partie E.1 ; elles ne sont recopiées ici qu'une fois validées.

| Paramètre | Valeur | Unité | Statut | Version | Utilisé par |
|---|---|---|---|---|---|
| `TICK_RATE` | 60 | ticks/s | EN VIGUEUR | v0.1 | B.2 |
| `TILE_SIZE` | 32 | px | EN VIGUEUR | v0.1 | B.3, R-MON-CAR-001 |
| `MAP_WIDTH` | 160 | tuiles (= 5120 px) | EN VIGUEUR | v0.3 | R-MON-CAR-001 — v0.1 : 40 |
| `MAP_HEIGHT` | 120 | tuiles (= 3840 px) | EN VIGUEUR | v0.3 | R-MON-CAR-001 — v0.1 : 30 |
| `PLAYER_START_TILE` | (34, 92) | tuile (colonne, ligne) | EN VIGUEUR | v0.3 | R-MON-CAR-002 — v0.1 : (20, 15) ; au cœur du Vallon |
| `PLAYER_WALK_SPEED` | 3 | px/tick (= 180 px/s, environ 5,6 tuiles/s) | EN VIGUEUR | v0.1 | R-JOU-DEP-002, R-JOU-DEP-003, R-MON-COL-002 |
| `PLAYER_HITBOX_WIDTH` | 20 | px | EN VIGUEUR | v0.1 | B.3, R-MON-CAR-003, R-MON-COL-001 |
| `PLAYER_HITBOX_HEIGHT` | 12 | px | EN VIGUEUR | v0.1 | B.3, R-MON-CAR-003, R-MON-COL-001 |
| ~~`VIEW_WIDTH`~~ | ~~1920~~ | px de monde | SUPPRIMÉ | v0.2 | La vue a la taille de la fenêtre (R-IHM-AFF-001) |
| ~~`VIEW_HEIGHT`~~ | ~~1080~~ | px de monde | SUPPRIMÉ | v0.2 | Idem |
| `WALK_FRAME_TICKS` | 8 | ticks | EN VIGUEUR | v0.1 | R-IHM-ANI-001 |
| `WALK_FRAME_SEQUENCE` | 3, 2, 1, 2 | numéros d'image (colonnes) | EN VIGUEUR | v0.1 | R-IHM-ANI-001 |
| `IDLE_FRAME` | 2 | numéro d'image (colonne) | EN VIGUEUR | v0.1 | R-IHM-ANI-002 |
| `HARVEST_REACH` | 48 | px (1,5 tuile) | EN VIGUEUR | v0.2 | R-RES-REC-001, R-IHM-INS-003 |
| `TREE_WOOD_YIELD` | 3 | bois | EN VIGUEUR | v0.2 | R-RES-ELE-001 |
| `ROCK_STONE_YIELD` | 2 | pierres | EN VIGUEUR | v0.2 | R-RES-ELE-001 |
| `FLOWERS_YIELD` | 1 | fleur | EN VIGUEUR | v0.2 | R-RES-ELE-001 |
| `TALK_REACH` | 64 | px (2 tuiles) | EN VIGUEUR | v0.3 | R-PNJ-DIA-001, R-IHM-INS-005 |
| `NOTIFICATION_TICKS` | 240 | ticks (= 4 s) | EN VIGUEUR | v0.3 | R-IHM-NOT-001, R-IHM-NOT-002 |
| `SEARCH_MAX_BOOKS` | 2 | livres par cachette | EN VIGUEUR | v0.4 | R-RES-FOU-003 |

---

# Partie D — Règles

## 1. JOU — Joueur

### 1.1 DEP — Déplacement

#### R-JOU-DEP-001 · Directions de déplacement

| Statut | Version | Paramètres |
|---|---|---|
| EN VIGUEUR | v0.1 | — |

**Règle** — La direction demandée combine les touches de déplacement enfoncées : une touche donne une direction cardinale, deux touches perpendiculaires donnent une diagonale, deux touches opposées s'annulent.

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | — | la touche droite est enfoncée | la direction demandée est « droite » |
| 2 | — | les touches haut et droite sont enfoncées | la direction demandée est « haut-droite » |
| 3 | — | les touches gauche et droite sont enfoncées | aucune direction n'est demandée |
| 4 | — | les touches haut, gauche et droite sont enfoncées | la direction demandée est « haut » |
| 5 | — | aucune touche n'est enfoncée | aucune direction n'est demandée |

**Notes** — Concept C-JOU-01. Q1 tranchée : 8 directions.

**Historique** — v0.1 : création. Q1 tranchée (8 directions), règle inchangée. Validée le 2026-10-11 (partie E.3) : passe à `NOUVEAU`.

#### R-JOU-DEP-002 · Vitesse de marche

| Statut | Version | Paramètres |
|---|---|---|
| EN VIGUEUR | v0.1 | `PLAYER_WALK_SPEED` |

**Règle** — À chaque tick où une direction cardinale est demandée, le joueur avance de `PLAYER_WALK_SPEED` px dans cette direction. Sans direction demandée, il ne bouge pas.

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | le joueur en (100, 100), vitesse 1,5 px/tick, aucun obstacle | « droite » est demandée pendant 1 tick | il est en (101,5 ; 100) |
| 2 | idem | « haut » est demandée pendant 10 ticks | il est en (100, 85) |
| 3 | le joueur en (100, 100) | aucune direction n'est demandée pendant 60 ticks | il est toujours en (100, 100) |

**Notes** — Concept C-JOU-01.

**Historique** — v0.1 : création. Validée le 2026-10-11 (partie E.3) : passe à `NOUVEAU`.

#### R-JOU-DEP-003 · Vitesse en diagonale

| Statut | Version | Paramètres |
|---|---|---|
| EN VIGUEUR | v0.1 | `PLAYER_WALK_SPEED` |

**Règle** — En diagonale, le joueur parcourt la même distance par tick qu'en ligne droite : il avance de `PLAYER_WALK_SPEED / √2` px sur chacun des deux axes.

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | le joueur en (100, 100), vitesse 1,5 px/tick, aucun obstacle | « bas-droite » est demandée pendant 1 tick | il est en (101,06 ; 101,06) à 0,01 près |
| 2 | le joueur en (200, 200), vitesse 1,5 px/tick, aucun obstacle | « haut-gauche » est demandée pendant 100 ticks | il est en (93,93 ; 93,93) à 0,01 près : il a parcouru 150 px, comme en ligne droite |

**Notes** — Concept C-JOU-01. Sans cette règle, le joueur irait environ 41 % plus vite en diagonale.

**Historique** — v0.1 : création. Validée le 2026-10-11 (partie E.3) : passe à `NOUVEAU`.

### 1.2 ORI — Orientation

#### R-JOU-ORI-001 · Orientation du joueur

| Statut | Version | Paramètres |
|---|---|---|
| EN VIGUEUR | v0.1 | — |

**Règle** — Le joueur fait face à la direction cardinale demandée. En diagonale, il garde son orientation si elle fait partie de la diagonale, sinon il prend la composante horizontale. Sans direction demandée, il garde son orientation. Au début d'une nouvelle partie, il fait face vers le bas.

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | le joueur orienté vers le bas | « gauche » est demandée pendant 1 tick | il est orienté vers la gauche |
| 2 | le joueur orienté vers le haut | « haut-droite » est demandée pendant 1 tick | il reste orienté vers le haut |
| 3 | le joueur orienté vers le bas | « haut-droite » est demandée pendant 1 tick | il est orienté vers la droite |
| 4 | le joueur orienté vers la gauche | plus aucune direction n'est demandée | il reste orienté vers la gauche |
| 5 | — | une nouvelle partie commence | le joueur est orienté vers le bas |

**Notes** — Concepts C-JOU-01 et C-JOU-03 (le joueur interagit avec ce qui est devant lui : son orientation doit être prévisible).

**Historique** — v0.1 : création. Validée le 2026-10-11 (partie E.3) : passe à `NOUVEAU`.

### 1.3 EXP — Expérience

#### R-JOU-EXP-001 · Expérience

| Statut | Version | Paramètres |
|---|---|---|
| NOUVEAU | v0.6 | — |

**Règle** — Le joueur a un compteur d'expérience, à 0 au début d'une nouvelle partie. Terminer une quête y ajoute sa récompense (R-PNJ-QUE-002).

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | — | une nouvelle partie commence | l'expérience vaut 0 |
| 2 | 20 points d'expérience, une quête dont la récompense est de 50 | la quête est terminée | l'expérience vaut 70 |

**Notes** — Concept C-JOU-09. Les niveaux viendront plus tard.

**Historique** — v0.6 : création.

## 2. MON — Monde

### 2.1 CAR — Carte

#### R-MON-CAR-001 · Carte de la vallée

| Statut | Version | Paramètres |
|---|---|---|
| EN VIGUEUR | v0.3 | `TILE_SIZE`, `MAP_WIDTH`, `MAP_HEIGHT` |

**Règle** — La carte du monde, la vallée, est une grille de `MAP_WIDTH` × `MAP_HEIGHT` tuiles de `TILE_SIZE` px. Un point appartient à la tuile définie en B.3 ; un point hors de la grille n'appartient à aucune tuile.

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | tuiles de 32 px, carte de 40 × 30 tuiles | on mesure la carte | elle fait 1280 × 960 px |
| 2 | idem | on cherche la tuile du point (70, 5) | c'est la tuile (2, 0) |
| 3 | idem | on cherche la tuile du point (32, 32) | c'est la tuile (1, 1) |
| 4 | idem | on cherche la tuile du point (1280, 10) | aucune tuile : le point est hors de la carte |
| 5 | tuiles de 32 px, carte de 160 × 120 tuiles | on mesure la carte | elle fait 5120 × 3840 px |

**Notes** — Concepts C-MON-01, C-MON-06. Le décor est une donnée (`data/maps/valley.js`, B.6).

**Historique** — v0.1 : création, « carte de départ » (la clairière, 40 × 30 tuiles) ; exemples recalculés pour les tuiles de 32 px. v0.3 : « La carte de départ » → « La carte du monde, la vallée » : une grande carte d'exploration de 160 × 120 tuiles (Q13 et demande du 2026-10-12) ; exemple 5 ajouté.

#### R-MON-CAR-002 · Position de départ

| Statut | Version | Paramètres |
|---|---|---|
| EN VIGUEUR | v0.1 | `TILE_SIZE`, `PLAYER_START_TILE` |

**Règle** — Au début d'une nouvelle partie, le joueur est au centre de la tuile `PLAYER_START_TILE`.

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | tuiles de 32 px, tuile de départ (20, 15) | une nouvelle partie commence | le joueur est en (656, 496) |

**Notes** — Concept C-UNI-03 (à terme, à côté du Foyer).

**Historique** — v0.1 : création. v0.1 : retouche après le passage aux tuiles de 32 px (G1) : exemples recalculés. Validée le 2026-10-11 (partie E.3) : passe à `NOUVEAU`.

#### R-MON-CAR-003 · Bords de la carte

| Statut | Version | Paramètres |
|---|---|---|
| EN VIGUEUR | v0.1 | `PLAYER_HITBOX_WIDTH`, `PLAYER_HITBOX_HEIGHT` |

**Règle** — La boîte de collision du joueur reste toujours entièrement dans la carte : un déplacement qui l'en ferait sortir s'arrête au bord.

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | boîte de 20 × 12 px, le joueur en (11, 100), vitesse 1,5 px/tick | « gauche » est demandée pendant 1 tick | il est en (10, 100) : sa boîte touche le bord gauche |
| 2 | le joueur en (10, 100) | « gauche » est demandée pendant 10 ticks | il reste en (10, 100) |
| 3 | carte de 960 px de haut, le joueur en (100, 959) | « bas » est demandée pendant 1 tick | il est en (100, 960) |

**Notes** — Concept C-MON-01.

**Historique** — v0.1 : création. v0.1 : retouche après le passage aux tuiles de 32 px (G1) : exemples recalculés. Validée le 2026-10-11 (partie E.3) : passe à `NOUVEAU`.

### 2.2 COL — Collisions

#### R-MON-COL-001 · Tuiles infranchissables

| Statut | Version | Paramètres |
|---|---|---|
| EN VIGUEUR | v0.1 | `PLAYER_HITBOX_WIDTH`, `PLAYER_HITBOX_HEIGHT` |

**Règle** — La boîte de collision du joueur ne chevauche jamais une tuile infranchissable : un déplacement qui la ferait chevaucher s'arrête au contact de la tuile.

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | tuiles de 32 px, un rocher sur la tuile (7, 6) (x de 224 à 256, y de 192 à 224), boîte de 20 × 12 px, le joueur en (212, 210), vitesse 1,5 px/tick | « droite » est demandée pendant 1 tick | il est en (213,5 ; 210) |
| 2 | idem | « droite » est demandée pendant 2 ticks | il est en (214, 210) : le bord droit de sa boîte touche le rocher |
| 3 | le joueur en (214, 210), contre le rocher | « droite » est demandée pendant 10 ticks | il reste en (214, 210) |
| 4 | le même rocher, le joueur en (212, 190) : sa boîte (y de 178 à 190) passe au-dessus du rocher | « droite » est demandée pendant 10 ticks | il est en (227, 190) : il passe sans être gêné |

**Notes** — Concept C-MON-01. Toucher une tuile (bords confondus) n'est pas la chevaucher.

**Historique** — v0.1 : création. v0.1 : retouche après le passage aux tuiles de 32 px (G1) : exemples recalculés. Validée le 2026-10-11 (partie E.3) : passe à `NOUVEAU`.

#### R-MON-COL-002 · Glissement le long d'un obstacle

| Statut | Version | Paramètres |
|---|---|---|
| EN VIGUEUR | v0.1 | `PLAYER_WALK_SPEED` |

**Règle** — En diagonale, si l'un des deux axes est bloqué, le joueur continue d'avancer sur l'autre axe, de `PLAYER_WALK_SPEED / √2` px par tick.

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | tuiles de 32 px, des rochers sur toute la colonne 7, boîte de 20 × 12 px, le joueur en (214, 210) contre eux, vitesse 1,5 px/tick | « haut-droite » est demandée pendant 1 tick | il est en (214 ; 208,94) à 0,01 près |
| 2 | le joueur en (10, 100), contre le bord gauche de la carte | « bas-gauche » est demandée pendant 1 tick | il est en (10 ; 101,06) à 0,01 près |

**Notes** — Concept C-JOU-01. Évite que le joueur reste « collé » aux obstacles, une gêne classique des jeux en vue de dessus.

**Historique** — v0.1 : création. v0.1 : retouche après le passage aux tuiles de 32 px (G1) : exemples recalculés. Q1 tranchée (8 directions). Validée le 2026-10-11 (partie E.3) : passe à `NOUVEAU`.

### 2.3 LIE — Lieux

#### R-MON-LIE-001 · Lieux nommés

| Statut | Version | Paramètres |
|---|---|---|
| EN VIGUEUR | v0.3 | — |

**Règle** — La vallée contient des lieux nommés ; chacun couvre un rectangle de tuiles. Un point appartient à un lieu s'il est dans l'une de ses tuiles.

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | tuiles de 32 px, un lieu de 5 × 4 tuiles dont le coin est la tuile (10, 10) | on teste le point (330, 330), tuile (10, 10) | il appartient au lieu |
| 2 | idem | on teste le point (479, 330), tuile (14, 10) | il appartient au lieu |
| 3 | idem | on teste le point (480, 330), tuile (15, 10) | il n'appartient pas au lieu |
| 4 | idem | on teste le point (330, 448), tuile (10, 14) | il n'appartient pas au lieu |

**Notes** — Concept C-MON-06. La liste des lieux est une donnée (`data/places.js`, B.6).

**Historique** — v0.3 : création.

#### R-MON-LIE-002 · Découverte d'un lieu

| Statut | Version | Paramètres |
|---|---|---|
| EN VIGUEUR | v0.3 | — |

**Règle** — À la fin de chaque tick, un lieu qui contient la position du joueur et n'est pas encore découvert devient découvert : il entre au journal, ou y passe d'« indice » à « découvert » en gardant sa place et son indice.

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | un lieu non découvert, le joueur juste à côté | le joueur y entre | le lieu est découvert et entre au journal |
| 2 | un lieu déjà découvert | le joueur en sort puis y revient | rien ne change : il n'est pas découvert une seconde fois |
| 3 | un lieu noté au journal comme indice d'Aldric | le joueur y entre | le lieu est « découvert », à la même place dans le journal, et l'indice d'Aldric est conservé |
| 4 | une nouvelle partie, le joueur au cœur du Vallon | 1 tick s'écoule | le Vallon est découvert |

**Notes** — Concept C-MON-06. Ordre du tick : B.4.

**Historique** — v0.3 : création.

#### R-MON-LIE-003 · Retour dans un lieu

| Statut | Version | Paramètres |
|---|---|---|
| NOUVEAU | v0.6 | — |

**Règle** — À la fin de chaque tick, un lieu déjà découvert qui contient la position du joueur, alors qu'il ne la contenait pas au tick précédent, est annoncé (le joueur y revient). Un lieu découvert pendant ce tick n'est pas annoncé une seconde fois.

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | le Vallon découvert, le joueur juste en dehors | le joueur y entre | le Vallon est annoncé |
| 2 | un lieu jamais découvert, le joueur juste en dehors | le joueur y entre | le lieu est découvert, il n'est pas annoncé comme un retour |
| 3 | le joueur déjà dans le Vallon découvert | il fait un pas dans le Vallon | rien n'est annoncé |

**Notes** — Concept C-MON-06. Retour de test : on aime retrouver le nom du lieu où l'on arrive. Ordre du tick : B.4, après la découverte.

**Historique** — v0.6 : création.

## 3. IHM — Interface joueur

### 3.1 CMD — Commandes au clavier

#### R-IHM-CMD-001 · Touches de déplacement

| Statut | Version | Paramètres |
|---|---|---|
| EN VIGUEUR | v0.1 | — |

**Règle** — Les flèches et les touches ZQSD (clavier AZERTY) déplacent le joueur. Les touches sont reconnues par leur **emplacement** sur le clavier : sur un clavier QWERTY, ce sont donc WASD.

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | un clavier AZERTY | la touche Z est enfoncée | la touche haut est enfoncée |
| 2 | un clavier AZERTY | la touche Q est enfoncée | la touche gauche est enfoncée |
| 3 | un clavier QWERTY | la touche W est enfoncée | la touche haut est enfoncée |
| 4 | — | la flèche droite est enfoncée | la touche droite est enfoncée |

**Notes** — Concept C-IHM-04. La reconfiguration des touches viendra plus tard.

**Historique** — v0.1 : création. Validée le 2026-10-11 (partie E.3) : passe à `NOUVEAU`.

### 3.2 CAM — Caméra

#### R-IHM-CAM-001 · Caméra centrée sur le joueur

| Statut | Version | Paramètres |
|---|---|---|
| EN VIGUEUR | v0.3 | — |

**Règle** — La vue est toujours centrée sur la position du joueur, y compris près des bords de la carte : le joueur reste au milieu de l'écran et le décor défile autour de lui. La partie de la vue située hors de la carte montre une forêt dense.

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | vue de 640 × 360 px, carte de 1280 × 960 px, le joueur en (656, 496) | l'écran est affiché | le coin supérieur gauche de la vue est en (336, 316) |
| 2 | idem, le joueur en (50, 496), près du bord gauche | l'écran est affiché | le coin supérieur gauche de la vue est en (−270, 316) : le joueur reste au centre |
| 3 | idem, le joueur en (1270, 950) | l'écran est affiché | le coin supérieur gauche de la vue est en (950, 770) |
| 4 | vue de 1920 × 1080 px, le joueur en (656, 496) | l'écran est affiché | le coin supérieur gauche de la vue est en (−304, −44) |

**Notes** — Concepts C-IHM-02, C-IHM-07.

**Historique** — v0.1 : création ; exemples recalculés pour les tuiles de 32 px. v0.2 : « La vue est centrée sur la position du joueur », bornée à la carte par R-IHM-CAM-002 → la vue reste centrée même près des bords : le personnage est toujours au centre et le décor bouge (demande du 2026-10-11). R-IHM-CAM-002 est supprimée. v0.3 : hors de la carte, la vue montre une forêt dense au lieu d'une couleur unie (Q15).

#### R-IHM-CAM-002 · ~~Caméra bornée à la carte~~

| Statut | Version | Paramètres |
|---|---|---|
| SUPPRIMÉ | v0.2 | ~~`VIEW_WIDTH`, `VIEW_HEIGHT`~~ |

**Règle** — ~~La vue ne montre jamais l'extérieur de la carte : près d'un bord, elle s'arrête contre ce bord et le joueur n'est plus au centre de l'écran. Sur un axe où la carte est plus petite que la vue, la carte est centrée à l'écran.~~

**Historique** — v0.1 : création. v0.2 : supprimée, le joueur doit toujours rester au centre de l'écran. Remplacée par R-IHM-CAM-001.

### 3.3 AFF — Affichage

#### R-IHM-AFF-001 · Vue à la taille de l'écran

| Statut | Version | Paramètres |
|---|---|---|
| EN VIGUEUR | v0.2 | — |

**Règle** — La vue a exactement la taille de la zone d'affichage de la fenêtre, en pixels physiques : la largeur et la hauteur de la fenêtre sont multipliées par le rapport de pixels de l'appareil, puis arrondies. Un pixel de monde occupe un pixel de l'écran, sans lissage. Quand la fenêtre change de taille, la vue suit.

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | une fenêtre de 1920 × 1080, rapport de pixels 1 | l'écran est affiché | la vue fait 1920 × 1080 px (60 × 33,75 tuiles) |
| 2 | une fenêtre de 1536 × 864, rapport 1,25 (écran 1080p, mise à l'échelle Windows à 125 %) | l'écran est affiché | la vue fait 1920 × 1080 px |
| 3 | une fenêtre de 1366 × 768, rapport 1 | l'écran est affiché | la vue fait 1366 × 768 px |
| 4 | une fenêtre de 1001 × 601, rapport 1,5 | l'écran est affiché | la vue fait 1502 × 902 px (arrondi) |
| 5 | une vue de 1920 × 1080 px | la fenêtre passe à 1280 × 720, rapport 1 | la vue fait 1280 × 720 px |

**Notes** — Concept C-IHM-07, pilier P4. `screen.width` et `screen.height` donnent la taille du **moniteur**, pas celle de la fenêtre : en mode fenêtré, la vue déborderait. On utilise donc la taille de la fenêtre et le rapport de pixels de l'appareil (`window.innerWidth`, `window.innerHeight`, `window.devicePixelRatio`). Un grand écran montre plus de monde qu'un petit.

**Historique** — v0.1 : création, « La vue est agrandie du plus grand facteur entier qui tient dans la fenêtre, sans lissage » ; vue de 640 × 360, puis de 1920 × 1080 (Q12). v0.2 : vue de taille fixe agrandie d'un facteur entier → vue à la taille de la fenêtre, en pixels physiques, pour s'adapter à chaque écran (demande du 2026-10-11). `VIEW_WIDTH` et `VIEW_HEIGHT` supprimés.

#### R-IHM-AFF-002 · Tri en profondeur

| Statut | Version | Paramètres |
|---|---|---|
| EN VIGUEUR | v0.1 | — |

**Règle** — Les éléments debout (personnages, arbres, rochers) sont dessinés du plus petit au plus grand y de leur position : un élément plus bas à l'écran passe devant. À y égal, le joueur passe devant le décor.

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | le joueur en y = 100, un arbre dont le pied est en y = 110 | l'écran est affiché | l'arbre est dessiné devant le joueur |
| 2 | le joueur en y = 120, le même arbre | l'écran est affiché | le joueur est dessiné devant l'arbre |
| 3 | le joueur en y = 110, le même arbre | l'écran est affiché | le joueur est dessiné devant l'arbre |

**Notes** — Pilier P4 (perspective trois-quarts). Le sol (herbe, chemins) est toujours dessiné sous les éléments debout.

**Historique** — v0.1 : création. Validée le 2026-10-11 (partie E.3) : passe à `NOUVEAU`.

### 3.4 ANI — Animation du joueur

#### R-IHM-ANI-001 · Animation de marche

| Statut | Version | Paramètres |
|---|---|---|
| EN VIGUEUR | v0.1 | `WALK_FRAME_TICKS`, `WALK_FRAME_SEQUENCE` |

**Règle** — Pendant que le joueur marche, les images de la ligne de son orientation défilent dans l'ordre `WALK_FRAME_SEQUENCE`, en boucle, en commençant par le début de la séquence ; chaque image reste affichée `WALK_FRAME_TICKS` ticks.

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | 8 ticks par image, séquence 3, 2, 1, 2 | le joueur marche depuis 0 tick | l'image 3 est affichée |
| 2 | idem | le joueur marche depuis 8 ticks | l'image 2 est affichée |
| 3 | idem | le joueur marche depuis 16 ticks | l'image 1 est affichée |
| 4 | idem | le joueur marche depuis 31 ticks | l'image 2 est affichée |
| 5 | idem | le joueur marche depuis 32 ticks | l'image 3 est affichée |
| 6 | idem, le joueur marche vers la gauche depuis 10 ticks (image 2 de la ligne « gauche ») | il tourne vers le haut et continue de marcher | l'image 2 de la ligne « haut » est affichée : le cycle ne repart pas à zéro |

**Notes** — Concept C-JOU-01, pilier P4. Le joueur « marche » dès qu'une direction est demandée, même bloqué par un obstacle (il piétine). Les images sont les colonnes de la feuille du personnage (1 à 3, de gauche à droite) ; la colonne 2 est la pose immobile, d'où le cycle « pas – pose – autre pas – pose » des RPG Maker.

**Historique** — v0.1 : création. v0.1 : séquence d'images `WALK_FRAME_SEQUENCE` (3, 2, 1, 2) au lieu de 4 images consécutives (`WALK_FRAME_COUNT`), pour s'adapter au héros fourni (3 images par direction). Validée le 2026-10-11 (partie E.3) : passe à `NOUVEAU`.

#### R-IHM-ANI-002 · Pose immobile

| Statut | Version | Paramètres |
|---|---|---|
| EN VIGUEUR | v0.1 | `IDLE_FRAME` |

**Règle** — Quand aucune direction n'est demandée, le joueur est affiché avec l'image `IDLE_FRAME` de la ligne de son orientation. Quand il se remet à marcher, l'animation de marche repart du début de la séquence.

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | image immobile 2, le joueur orienté vers la gauche | aucune direction n'est demandée | l'image 2 de la ligne « gauche » est affichée |
| 2 | séquence de marche 3, 2, 1, 2 ; le joueur s'est arrêté pendant qu'il affichait l'image 1 | il se remet à marcher | l'image 3 est affichée |

**Notes** — Concept C-JOU-01.

**Historique** — v0.1 : création. v0.1 : image immobile désignée par `IDLE_FRAME` (colonne du milieu du héros fourni). Validée le 2026-10-11 (partie E.3) : passe à `NOUVEAU`.

### 3.5 INS — Inspection et récolte

#### R-IHM-INS-001 · Désigner une tuile au clic

| Statut | Version | Paramètres |
|---|---|---|
| EN VIGUEUR | v0.2 | — |

**Règle** — Un clic sur l'écran désigne un point du monde : le coin supérieur gauche de la vue plus la position du clic en pixels physiques. Si ce point est sur le sprite d'un élément debout (arbre, rocher), c'est la tuile de cet élément qui est désignée, celle de l'élément dessiné devant s'ils se superposent ; sinon, c'est la tuile qui contient le point.

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | le coin de la vue en (100, 50) | clic au pixel (40, 30) de l'écran | le point désigné est (140, 80) |
| 2 | tuiles de 32 px, un arbre sur la tuile (7, 6) dont le sprite couvre x de 224 à 256 et y de 160 à 224 | clic au point (240, 170), sur le feuillage (au-dessus de la tuile (7, 5)) | la tuile (7, 6) est désignée |
| 3 | le même arbre | clic au point (300, 300) | la tuile (9, 9) est désignée |
| 4 | un arbre A sur la tuile (7, 6), sprite de y = 160 à 224 ; un arbre B sur la tuile (7, 7), sprite de y = 192 à 256 | clic au point (240, 200) | la tuile (7, 7) est désignée : B est dessiné devant A |

**Notes** — Concept C-IHM-05. Le feuillage d'un arbre dépasse au-dessus de sa tuile : on doit pouvoir cliquer dessus.

**Historique** — v0.2 : création.

#### R-IHM-INS-002 · Fenêtre d'information

| Statut | Version | Paramètres |
|---|---|---|
| EN VIGUEUR | v0.4 | `TREE_WOOD_YIELD`, `ROCK_STONE_YIELD`, `FLOWERS_YIELD` |

**Règle** — Désigner un élément récoltable ouvre une fenêtre d'information qui affiche son nom, l'action possible avec le rendement, et un bouton « Récolter ». Désigner une tuile non récoltable ferme la fenêtre. La fenêtre est centrée horizontalement, juste sous le milieu de l'écran : elle reste près du héros, toujours au centre, sans le cacher.

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | un arbre, rendement 3 | on le désigne | la fenêtre affiche « Arbre » et « Couper : 3 bois » |
| 2 | un rocher, rendement 2 | on le désigne | la fenêtre affiche « Rocher » et « Piocher : 2 pierres » |
| 3 | des fleurs, rendement 1 | on les désigne | la fenêtre affiche « Fleurs » et « Ramasser : 1 fleur » |
| 4 | la fenêtre ouverte sur un arbre | on désigne une tuile d'herbe | la fenêtre est fermée |

**Notes** — Concept C-IHM-05. Contenu volontairement simple ; viendront ensuite une description, l'outil requis, l'état de repousse. La position est une affaire de mise en page (CSS) : elle n'a pas d'exemple testé.

**Historique** — v0.2 : création. v0.4 : la fenêtre, d'abord en bas à droite, passe au milieu de l'écran, sous le héros (demande du porteur du projet : trop loin de l'action).

#### R-IHM-INS-003 · Bouton « Récolter »

| Statut | Version | Paramètres |
|---|---|---|
| EN VIGUEUR | v0.5 | `HARVEST_REACH` |

**Règle** — Le bouton « Récolter » est actif quand le joueur a l'outil requis (R-IHM-INS-007) et que l'élément désigné est à portée (R-RES-REC-001) ; hors de portée, il est inactif et la fenêtre affiche « Trop loin : approchez-vous ». L'état du bouton suit les déplacements du joueur. Un clic sur le bouton actif récolte l'élément et ferme la fenêtre.

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | la fenêtre ouverte sur un arbre à portée | l'écran est affiché | le bouton est actif |
| 2 | la fenêtre ouverte sur un arbre hors de portée | l'écran est affiché | le bouton est inactif et « Trop loin : approchez-vous » est affiché |
| 3 | la fenêtre ouverte sur un arbre hors de portée | le joueur s'approche à portée | le bouton devient actif |
| 4 | la fenêtre ouverte sur un arbre à portée (rendement 3), 0 bois | clic sur « Récolter » | l'inventaire contient 3 bois et la fenêtre est fermée |

**Notes** — Concept C-IHM-05. On peut inspecter un élément de loin, mais il faut s'en approcher pour le récolter. Exemples : convention de B.8 (le joueur a les outils).

**Historique** — v0.2 : création. v0.5 : « actif quand l'élément est à portée » → actif s'il est à portée **et** que le joueur a l'outil requis, car couper et piocher demandent désormais un outil.

#### R-IHM-INS-004 · Fermer la fenêtre d'information

| Statut | Version | Paramètres |
|---|---|---|
| EN VIGUEUR | v0.2 | — |

**Règle** — La touche Échap ou le bouton × ferment la fenêtre d'information.

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | la fenêtre ouverte | touche Échap | la fenêtre est fermée |
| 2 | la fenêtre ouverte | clic sur × | la fenêtre est fermée |

**Notes** — Concept C-IHM-05.

**Historique** — v0.2 : création.

#### R-IHM-INS-005 · Désigner un PNJ

| Statut | Version | Paramètres |
|---|---|---|
| MODIFIÉ | v0.6 | `TALK_REACH` |

**Règle** — Un clic sur le sprite d'un PNJ le désigne, en priorité sur le décor. La fenêtre d'information affiche alors son nom, l'action « Parler » et un bouton « Parler », actif si le PNJ est à portée de parole (R-PNJ-DIA-001), inactif sinon avec « Trop loin : approchez-vous ». Un clic sur le bouton actif commence le dialogue et ferme la fenêtre. Si le joueur peut donner à ce PNJ l'objet d'une quête (R-PNJ-QUE-002), la fenêtre affiche en plus « Donner : <objet> » et un bouton « Donner », actif dans les mêmes conditions ; un clic sur ce bouton donne l'objet et ferme la fenêtre.

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | Aldric sur la tuile (38, 90) : son sprite couvre x de 1216 à 1248 et y de 2864 à 2896 | clic au point (1230, 2880) | Aldric est désigné |
| 2 | Aldric désigné | l'écran est affiché | la fenêtre affiche « Aldric, l'ermite » et « Parler » |
| 3 | Aldric désigné, à 100 px du joueur | l'écran est affiché | le bouton est inactif et « Trop loin : approchez-vous » est affiché |
| 4 | Aldric désigné, à 40 px du joueur | clic sur « Parler » | le dialogue commence à la page 1 et la fenêtre est fermée |
| 5 | la quête de Maëlle en cours, la poupée possédée, Maëlle désignée à 40 px | l'écran est affiché | la fenêtre affiche « Donner : poupée de chiffon bleue » et un bouton « Donner » actif |
| 6 | idem | clic sur « Donner » | la poupée est donnée et la fenêtre est fermée |
| 7 | la poupée possédée, la quête jamais reçue, Maëlle désignée | l'écran est affiché | pas de bouton « Donner » |

**Notes** — Concepts C-IHM-05, C-VIL-07. Même geste que pour récolter : on clique pour savoir ce qu'on peut faire.

**Historique** — v0.3 : création. v0.6 : bouton « Donner » ajouté, pour rendre l'objet d'une quête (C-VIL-09).

#### R-IHM-INS-006 · Désigner un élément à fouiller

| Statut | Version | Paramètres |
|---|---|---|
| EN VIGUEUR | v0.4 | `HARVEST_REACH` |

**Règle** — Désigner un élément à fouiller ouvre la fenêtre d'information : son nom, l'action « Fouiller » et un bouton « Fouiller », actif à portée (R-RES-FOU-002), inactif sinon avec « Trop loin : approchez-vous ». Un clic sur le bouton actif fouille l'élément et ferme la fenêtre. Un élément déjà fouillé n'ouvre pas la fenêtre.

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | une bibliothèque en ruine | on la désigne | la fenêtre affiche « Bibliothèque en ruine » et « Fouiller » |
| 2 | un coffre ancien hors de portée | on le désigne | le bouton est inactif et « Trop loin : approchez-vous » est affiché |
| 3 | un coffre ancien à portée | clic sur « Fouiller » | le coffre est fouillé et la fenêtre est fermée |
| 4 | un coffre déjà fouillé | on le désigne | la fenêtre reste fermée |

**Notes** — Concepts C-IHM-05, C-MON-09.

**Historique** — v0.4 : création.

#### R-IHM-INS-007 · Outil manquant

| Statut | Version | Paramètres |
|---|---|---|
| EN VIGUEUR | v0.5 | — |

**Règle** — Quand le joueur n'a pas l'outil que demande un élément récoltable (R-RES-OUT-001), la fenêtre d'information affiche toujours l'action et le rendement, mais le bouton « Récolter » est inactif et la fenêtre affiche « Il faut une hache » ou « Il faut une pioche ». Ce message passe avant « Trop loin : approchez-vous ».

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | aucun outil, un arbre à portée | on le désigne | la fenêtre affiche « Couper : 3 bois », le bouton est inactif et « Il faut une hache » est affiché |
| 2 | aucun outil, un rocher hors de portée | on le désigne | le bouton est inactif et « Il faut une pioche » est affiché |
| 3 | la hache en silex, un arbre à portée | on le désigne | le bouton est actif |
| 4 | aucun outil, des fleurs à portée | on les désigne | le bouton est actif |

**Notes** — Concepts C-IHM-05, C-RES-04. La fenêtre dit ce qu'il manque : c'est l'amorce de la progression (C-RES-08).

**Historique** — v0.5 : création.

### 3.6 HUD — Bandeau d'informations

#### R-IHM-HUD-001 · Affichage de l'inventaire

| Statut | Version | Paramètres |
|---|---|---|
| EN VIGUEUR | v0.4 | — |

**Règle** — En haut à gauche de l'écran, le bandeau d'inventaire affiche en permanence chaque ressource avec son icône (planche d'icônes) et sa quantité, dans l'ordre : bois, pierre, fleurs, silex, branches, fibres.

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | un inventaire de 3 bois, 0 pierre, 1 fleur, 2 silex, 0 branche, 4 fibres | l'écran est affiché | le bandeau affiche « Bois 3 », « Pierre 0 », « Fleurs 1 », « Silex 2 », « Branches 0 », « Fibres 4 » |
| 2 | une nouvelle partie | l'écran est affiché | le bandeau affiche les six ressources à 0 |

**Notes** — Concepts C-IHM-06, C-IHM-11.

**Historique** — v0.2 : création, « bois, pierre, fleurs », icônes tirées de la planche de tuiles. v0.4 : silex, branches et fibres ajoutés ; icônes tirées de la planche d'icônes.

#### R-IHM-HUD-002 · Expérience au bandeau

| Statut | Version | Paramètres |
|---|---|---|
| NOUVEAU | v0.6 | — |

**Règle** — À la fin du bandeau d'inventaire, l'expérience est affichée en permanence avec son icône : « Expérience <points> ».

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | une nouvelle partie | l'écran est affiché | le bandeau affiche « Expérience 0 » |
| 2 | 70 points d'expérience | l'écran est affiché | le bandeau affiche « Expérience 70 » |

**Notes** — Concepts C-JOU-09, C-IHM-06.

**Historique** — v0.6 : création.

### 3.7 DIA — Dialogues

#### R-IHM-DIA-001 · Boîte de dialogue

| Statut | Version | Paramètres |
|---|---|---|
| EN VIGUEUR | v0.3 | — |

**Règle** — Pendant un dialogue, une boîte en bas de l'écran affiche le nom du PNJ et le texte de la page en cours, avec l'indicateur « ▼ » s'il reste des pages. Un clic sur la boîte, la touche Espace ou la touche Entrée passent à la page suivante (R-PNJ-DIA-002) ; la touche Échap termine le dialogue.

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | un dialogue avec Aldric, page 1 sur 3 | l'écran est affiché | la boîte affiche « Aldric, l'ermite », le texte de la page 1 et « ▼ » |
| 2 | un dialogue avec Aldric, page 3 sur 3 | l'écran est affiché | la boîte affiche le texte de la page 3, sans « ▼ » |
| 3 | un dialogue page 1 sur 3 | touche Espace | la page 2 est affichée |
| 4 | un dialogue en cours | touche Échap | le dialogue est terminé et la boîte disparaît |

**Notes** — Concept C-IHM-08.

**Historique** — v0.3 : création.

### 3.8 JRN — Journal

#### R-IHM-JRN-001 · Journal des lieux

| Statut | Version | Paramètres |
|---|---|---|
| MODIFIÉ | v0.6 | — |

**Règle** — La touche J ouvre et ferme le journal ; un bouton × le ferme aussi. Il liste, dans l'ordre où ils y sont entrés, les lieux découverts (nom et « Découvert ») et les indices (nom, « Indice d'<PNJ> » et le texte de la page qui l'a donné). Un journal vide affiche « Aucun lieu pour l'instant. »

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | un journal vide | touche J | le journal s'ouvre et affiche « Aucun lieu pour l'instant. » |
| 2 | le Vallon découvert, puis un indice d'Aldric sur les Ruines du Guet | touche J | le journal affiche « Le Vallon — Découvert », puis « Les Ruines du Guet — Indice d'Aldric » avec son texte |
| 3 | le journal ouvert | touche J | le journal est fermé |
| 4 | le journal ouvert | clic sur × | le journal est fermé |

**Notes** — Concept C-IHM-09. Les quêtes, livres et plans s'y ajouteront.

**Historique** — v0.3 : création. v0.6 : bouton × ajouté (retour de test : rien ne permettait de le fermer à la souris).

#### R-IHM-JRN-003 · Quêtes au journal

| Statut | Version | Paramètres |
|---|---|---|
| NOUVEAU | v0.6 | — |

**Règle** — Le journal a une partie « Quêtes » : pour chaque quête reçue, dans l'ordre, son titre, son état (« En cours » ou « Terminée ») et sa description. Sans quête, elle affiche « Aucune quête pour l'instant. »

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | aucune quête | le journal est ouvert | « Quêtes » affiche « Aucune quête pour l'instant. » |
| 2 | la quête de Maëlle en cours | le journal est ouvert | « La poupée de Maëlle — En cours » et sa description |
| 3 | la quête de Maëlle terminée | le journal est ouvert | « La poupée de Maëlle — Terminée » |

**Notes** — Concepts C-IHM-09, C-VIL-09.

**Historique** — v0.6 : création.

### 3.9 NOT — Notifications

#### R-IHM-NOT-001 · Notifications

| Statut | Version | Paramètres |
|---|---|---|
| MODIFIÉ | v0.6 | `NOTIFICATION_TICKS` |

**Règle** — Les notifications s'affichent au-dessus du héros, au milieu de l'écran, chacune avec un bouton × qui la ferme. Découvrir un lieu affiche « Lieu découvert : <nom> » ; revenir dans un lieu (R-MON-LIE-003) affiche son nom ; recevoir un indice affiche « Nouvel indice : <nom> ». Chaque notification reste affichée `NOTIFICATION_TICKS` ticks, sauf celles des quêtes (R-IHM-NOT-003), qui restent jusqu'à ce qu'on les ferme. Plusieurs notifications s'empilent, la plus récente en bas, près du héros.

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | durée 240 ticks | le Vallon est découvert au tick 100 | « Lieu découvert : Le Vallon » est affiché du tick 100 au tick 339 et a disparu au tick 340 |
| 2 | une notification affichée depuis le tick 100 | un indice sur les Ruines du Guet est reçu au tick 150 | les deux notifications sont affichées, « Nouvel indice : Les Ruines du Guet » en bas |
| 3 | « Lieu découvert : Le Vallon » affichée | clic sur son × | elle a disparu |
| 4 | durée 240 ticks, « Quête terminée : La poupée de Maëlle » affichée au tick 100 | tick 400 | elle est toujours affichée |
| 5 | les Ruines du Guet découvertes, le joueur en dehors | il y revient | « Les Ruines du Guet » est affiché |

**Notes** — Concept C-IHM-10.

**Historique** — v0.3 : création. v0.6 : « en haut de l'écran, pendant `NOTIFICATION_TICKS` » → au-dessus du héros, avec un ×, les quêtes jusqu'à fermeture ; nom du lieu à chaque retour (retours de test : les notifications du haut se superposaient au bandeau et passaient inaperçues).

#### R-IHM-NOT-002 · Trouvailles

| Statut | Version | Paramètres |
|---|---|---|
| MODIFIÉ | v0.6 | `NOTIFICATION_TICKS` |

**Règle** — Après une fouille, une seule notification liste tout ce qui a été trouvé : les livres (« livre « <titre> » »), puis les objets, puis les matériaux dans l'ordre de l'inventaire (« Trouvé : poupée de chiffon bleue, 2 silex, 1 branche »). Une fouille qui ne rapporte rien affiche « Rien d'intéressant. »

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | une cachette avec le livre « Le Tailleur de silex » et 2 silex | le joueur la fouille | « Trouvé : livre « Le Tailleur de silex », 2 silex » |
| 2 | une cachette avec 3 branches et 1 fibre | le joueur la fouille | « Trouvé : 3 branches, 1 fibre » |
| 3 | une cachette vide | le joueur la fouille | « Rien d'intéressant. » |
| 4 | une cachette avec la poupée de chiffon bleue et 2 silex | le joueur la fouille | « Trouvé : poupée de chiffon bleue, 2 silex » |

**Notes** — Concept C-IHM-10. Les matériaux sont listés dans l'ordre de l'inventaire.

**Historique** — v0.4 : création. v0.6 : objets trouvés ; « une notification par livre, puis une pour les matériaux » → une seule notification pour toute la fouille (retour de test : la seconde passait inaperçue).

#### R-IHM-NOT-003 · Quêtes et expérience

| Statut | Version | Paramètres |
|---|---|---|
| NOUVEAU | v0.6 | `NOTIFICATION_TICKS` |

**Règle** — Recevoir une quête affiche « Nouvelle quête : <titre> ». La terminer affiche « Quête terminée : <titre> » puis « +<points> expérience ». Ces notifications restent affichées jusqu'à ce qu'on les ferme (R-IHM-NOT-001).

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | la quête de Maëlle jamais reçue | la page qui la confie est affichée | « Nouvelle quête : La poupée de Maëlle » |
| 2 | la quête de Maëlle en cours, la poupée possédée | le joueur donne la poupée | « Quête terminée : La poupée de Maëlle » puis « +50 expérience » |

**Notes** — Concepts C-IHM-10, C-VIL-09, C-JOU-09.

**Historique** — v0.6 : création.

#### R-IHM-JRN-002 · ~~Livres au journal~~

| Statut | Version | Paramètres |
|---|---|---|
| SUPPRIMÉ | v0.6 | — |

**Règle** — ~~Le journal a une seconde partie, « Livres », qui liste les livres trouvés dans l'ordre : titre, texte et plans décrits (« Plans : hache en silex, pioche en silex »). Sans livre, elle affiche « Aucun livre pour l'instant. »~~

**Notes** — Concepts C-IHM-09, C-TEC-06.

**Historique** — v0.4 : création. v0.6 : supprimée — les livres se lisent dans l'inventaire (R-IHM-INV-001, R-IHM-LIV-001) ; au journal, ils faisaient double emploi sans pouvoir être lus (retour de test).

### 3.14 BAR — Barre d'actions

#### R-IHM-BAR-001 · Barre d'actions

| Statut | Version | Paramètres |
|---|---|---|
| NOUVEAU | v0.6 | — |

**Règle** — À gauche de l'écran, sous le bandeau d'inventaire, une barre verticale d'icônes ouvre et ferme les fenêtres : « Inventaire » (sac), « Artisanat » (marteau) et « Journal » (livre ouvert). Survoler une icône affiche son nom et sa touche : « Inventaire (I) », « Artisanat (C) », « Journal (J) ». Un clic fait comme la touche. L'icône d'une fenêtre ouverte est mise en valeur. Les touches restent actives.

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | — | on survole l'icône « Inventaire » | « Inventaire (I) » est affiché |
| 2 | aucune fenêtre ouverte | clic sur l'icône « Inventaire » | la fenêtre d'inventaire est ouverte et son icône est mise en valeur |
| 3 | la fenêtre d'inventaire ouverte | clic sur l'icône « Inventaire » | la fenêtre est fermée |
| 4 | le journal fermé | clic sur l'icône « Journal » | le journal est ouvert |

**Notes** — Concepts C-IHM-13, C-IHM-12. On n'a plus à connaître les touches. La section porte le numéro 3.14 pour garder les numéros existants.

**Historique** — v0.6 : création.

### 3.10 FEN — Fenêtres centrales

#### R-IHM-FEN-001 · Une fenêtre à la fois

| Statut | Version | Paramètres |
|---|---|---|
| MODIFIÉ | v0.6 | — |

**Règle** — Les fenêtres d'information, d'inventaire, de lecture, d'artisanat et le journal s'affichent au milieu de l'écran. Une seule de ces fenêtres est ouverte à la fois : en ouvrir une ferme celle qui l'était. La touche Échap ou le bouton × ferment la fenêtre ouverte.

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | la fenêtre d'inventaire ouverte | touche C | la fenêtre d'artisanat est ouverte, celle d'inventaire est fermée |
| 2 | la fenêtre d'information ouverte sur un arbre | touche I | la fenêtre d'inventaire est ouverte, celle d'information est fermée |
| 3 | la fenêtre d'artisanat ouverte | on désigne un arbre | la fenêtre d'information est ouverte, celle d'artisanat est fermée |
| 4 | la fenêtre d'artisanat ouverte | touche Échap | aucune fenêtre n'est ouverte |
| 5 | le journal ouvert | touche I | la fenêtre d'inventaire est ouverte, le journal est fermé |
| 6 | la fenêtre d'inventaire ouverte | clic sur l'icône « Journal » | le journal est ouvert, la fenêtre d'inventaire est fermée |

**Notes** — Concept C-IHM-12. Le joueur peut se déplacer fenêtre ouverte.

**Historique** — v0.5 : création. v0.6 : le journal en fait partie, au milieu de l'écran lui aussi (retours de test : ouvrir une fenêtre doit fermer les autres ; le journal était à gauche).

### 3.11 INV — Fenêtre d'inventaire

#### R-IHM-INV-001 · Fenêtre d'inventaire

| Statut | Version | Paramètres |
|---|---|---|
| MODIFIÉ | v0.6 | — |

**Règle** — La touche I ouvre et ferme la fenêtre d'inventaire. Elle a trois parties : « Ressources » (chaque ressource avec son icône et sa quantité, dans l'ordre du bandeau), « Outils » (les outils possédés, avec icône et nom, ou « Aucun outil. ») « Livres » (les livres de la bibliothèque, avec icône, titre et un bouton « Lire », ou « Aucun livre pour l'instant. ») et « Objets » (les objets possédés, avec icône et nom, ou « Aucun objet. »). Elle s'ouvre aussi par la barre d'actions (R-IHM-BAR-001).

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | une nouvelle partie, la fenêtre fermée | touche I | la fenêtre est ouverte ; « Ressources » liste les six ressources à 0, « Outils » affiche « Aucun outil. », « Livres » affiche « Aucun livre pour l'instant. », « Objets » affiche « Aucun objet. » |
| 2 | la hache en silex possédée | la fenêtre est ouverte | « Outils » affiche « Hache en silex » |
| 3 | le livre « Le Tailleur de silex » trouvé | la fenêtre est ouverte | « Livres » affiche « Le Tailleur de silex » avec un bouton « Lire » |
| 4 | la fenêtre ouverte | touche I | la fenêtre est fermée |
| 5 | la poupée de chiffon bleue possédée | la fenêtre est ouverte | « Objets » affiche « Poupée de chiffon bleue » |

**Notes** — Concepts C-INV-03, C-IHM-11, C-IHM-12. Pas de limite de place pour l'instant (C-INV-01).

**Historique** — v0.5 : création. v0.6 : partie « Objets » ajoutée (objets de quête).

### 3.12 LIV — Lecture

#### R-IHM-LIV-001 · Lire un livre

| Statut | Version | Paramètres |
|---|---|---|
| EN VIGUEUR | v0.5 | `NOTIFICATION_TICKS` |

**Règle** — Le bouton « Lire » d'un livre de la fenêtre d'inventaire le lit (R-INV-LIV-002) et ouvre la fenêtre de lecture : titre, texte et « Recettes : <plans> ». Chaque recette nouvellement apprise est annoncée par une notification « Recette apprise : <plan> ».

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | « Le Tailleur de silex » trouvé, jamais lu | clic sur « Lire » | la fenêtre de lecture affiche son titre, son texte et « Recettes : hache en silex, pioche en silex » ; notifications « Recette apprise : hache en silex » puis « Recette apprise : pioche en silex » |
| 2 | « Le Tailleur de silex » déjà lu | clic sur « Lire » | la fenêtre de lecture est ouverte ; aucune notification |
| 3 | la fenêtre de lecture ouverte | touche Échap | la fenêtre est fermée |

**Notes** — Concepts C-TEC-06, C-TEC-07, C-IHM-10.

**Historique** — v0.5 : création.

### 3.13 ART — Fenêtre d'artisanat

#### R-IHM-ART-001 · Fenêtre d'artisanat

| Statut | Version | Paramètres |
|---|---|---|
| MODIFIÉ | v0.6 | `NOTIFICATION_TICKS` |

**Règle** — La touche C ouvre et ferme la fenêtre d'artisanat. Elle liste les recettes connues, dans l'ordre où elles ont été apprises : icône et nom de l'objet ; pour celles qui ont une recette définie (B.8), ingrédients sous la forme « possédé/requis » (« Silex 2/1 · Branches 1/2 · Fibres 1/1 ») et un bouton « Fabriquer ». Une recette connue sans recette définie a son bouton inactif et affiche pourquoi : pour le feu de camp, « Pas encore fabricable : arrive avec le cycle jour / nuit ». Le bouton est inactif si l'outil est déjà possédé (« Déjà possédé ») ou s'il manque des ingrédients : la fenêtre dit alors lesquels, dans l'ordre de la recette (« Il manque : 1 branche, 1 fibre »). Un clic sur le bouton actif fabrique l'objet (R-ART-FAB-001) et affiche la notification « Fabriqué : <objet> ». Sans recette, la fenêtre affiche « Aucune recette connue : lisez des livres pour en apprendre. »

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | aucune recette connue | la fenêtre est ouverte | elle affiche « Aucune recette connue : lisez des livres pour en apprendre. » |
| 2 | la recette de la hache connue ; 2 silex, 1 branche, 1 fibre | la fenêtre est ouverte | « Hache en silex », « Silex 2/1 · Branches 1/2 · Fibres 1/1 », bouton inactif, « Il manque : 1 branche » |
| 3 | la recette de la hache connue ; 1 silex, 2 branches, 1 fibre | clic sur « Fabriquer » | le joueur possède la hache en silex ; notification « Fabriqué : hache en silex » |
| 4 | la recette de la hache connue, la hache possédée | la fenêtre est ouverte | bouton inactif, « Déjà possédé » |
| 5 | seul le plan « feu de camp » connu | la fenêtre est ouverte | « Feu de camp », bouton inactif, « Pas encore fabricable : arrive avec le cycle jour / nuit » |

**Notes** — Concepts C-ART-04, C-ART-06, C-IHM-12. Un bouton inactif dit toujours pourquoi ; les conditions à venir (établi, lieu, niveau d'expérience) s'afficheront de la même façon.

**Historique** — v0.5 : création. v0.6 : « Il manque des matériaux » → la liste de ce qui manque (retour de test : la raison n'était pas claire). Et : un plan connu sans recette (feu de camp) était masqué, ce qui faisait croire que la lecture n'avait rien appris → il est affiché, inactif, avec « Pas encore fabricable ».

## 4. RES — Ressources et récolte

### 4.1 ELE — Éléments récoltables

#### R-RES-ELE-001 · Éléments récoltables

| Statut | Version | Paramètres |
|---|---|---|
| EN VIGUEUR | v0.2 | `TREE_WOOD_YIELD`, `ROCK_STONE_YIELD`, `FLOWERS_YIELD` |

**Règle** — Trois types de tuiles sont récoltables : un **arbre** se coupe et donne `TREE_WOOD_YIELD` bois ; un **rocher** se pioche et donne `ROCK_STONE_YIELD` pierres ; des **fleurs** se ramassent et donnent `FLOWERS_YIELD` fleurs. Les autres tuiles (herbe, chemin, eau, souche) ne sont pas récoltables.

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | un arbre, rendement 3 | on cherche ce qu'il donne | il se coupe et donne 3 bois |
| 2 | un rocher, rendement 2 | on cherche ce qu'il donne | il se pioche et donne 2 pierres |
| 3 | des fleurs, rendement 1 | on cherche ce qu'elles donnent | elles se ramassent et donnent 1 fleur |
| 4 | de l'herbe | on cherche ce qu'elle donne | rien à récolter |
| 5 | de l'eau | on cherche ce qu'elle donne | rien à récolter |

**Notes** — Concepts C-RES-01, C-RES-04. Depuis la v0.5, couper et piocher demandent un outil (R-RES-OUT-001).

**Historique** — v0.2 : création. v0.5 : note mise à jour (outils), règle inchangée.

### 4.2 REC — Récolte

#### R-RES-REC-001 · Portée de récolte

| Statut | Version | Paramètres |
|---|---|---|
| EN VIGUEUR | v0.2 | `HARVEST_REACH` |

**Règle** — Le joueur ne peut récolter un élément que si la distance entre sa position et le centre de la tuile de l'élément est inférieure ou égale à `HARVEST_REACH`.

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | tuiles de 32 px, portée 48 px, un arbre sur la tuile (7, 6) (centre (240, 208)), le joueur en (240, 236), juste au sud | il récolte l'arbre | la récolte est acceptée |
| 2 | idem, le joueur en (240, 256) (distance 48) | il récolte l'arbre | la récolte est acceptée |
| 3 | idem, le joueur en (240, 257) (distance 49) | il récolte l'arbre | la récolte est refusée (`OUT_OF_REACH`) |
| 4 | idem, le joueur en (270, 240), en diagonale (distance ≈ 43,9) | il récolte l'arbre | la récolte est acceptée |

**Notes** — Concept C-RES-04. 48 px = 1,5 tuile : il faut se tenir contre l'élément, de n'importe quel côté.

**Historique** — v0.2 : création.

#### R-RES-REC-002 · Gain de ressources

| Statut | Version | Paramètres |
|---|---|---|
| EN VIGUEUR | v0.2 | — |

**Règle** — Une récolte acceptée ajoute le rendement de l'élément à l'inventaire.

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | 0 bois, un arbre à portée (rendement 3) | le joueur le récolte | l'inventaire contient 3 bois |
| 2 | 3 bois, un autre arbre à portée (rendement 3) | le joueur le récolte | l'inventaire contient 6 bois |
| 3 | 3 bois et 0 pierre, un rocher à portée (rendement 2) | le joueur le récolte | l'inventaire contient 3 bois et 2 pierres |

**Notes** — Concept C-RES-04. La récolte est instantanée en v0.2 ; une durée et une animation viendront avec les outils.

**Historique** — v0.2 : création.

#### R-RES-REC-003 · Après la récolte

| Statut | Version | Paramètres |
|---|---|---|
| EN VIGUEUR | v0.2 | — |

**Règle** — Après une récolte, un arbre devient une souche ; un rocher et des fleurs laissent place à de l'herbe. La souche est franchissable et n'est pas récoltable.

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | un arbre à portée sur la tuile (7, 6) | le joueur le récolte | la tuile (7, 6) est une souche, franchissable |
| 2 | un rocher à portée | le joueur le récolte | la tuile est de l'herbe, franchissable |
| 3 | des fleurs à portée | le joueur les récolte | la tuile est de l'herbe |
| 4 | une souche à portée | le joueur la récolte | la récolte est refusée (`NOTHING_TO_HARVEST`) |

**Notes** — Concept C-RES-04. La repousse des arbres depuis leur souche est une question ouverte (Q14).

**Historique** — v0.2 : création.

#### R-RES-REC-004 · Refus d'une récolte

| Statut | Version | Paramètres |
|---|---|---|
| EN VIGUEUR | v0.5 | `HARVEST_REACH` |

**Règle** — Une récolte refusée n'a aucun effet. Le motif est le premier qui s'applique, dans l'ordre : `NOTHING_TO_HARVEST` (la tuile est hors de la carte ou n'est pas récoltable), puis `MISSING_TOOL` (le joueur n'a pas l'outil requis, R-RES-OUT-001), puis `OUT_OF_REACH` (l'élément est hors de portée).

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | une tuile d'herbe à portée | le joueur la récolte | refus `NOTHING_TO_HARVEST` |
| 2 | la tuile (−1, 0), hors de la carte | le joueur la récolte | refus `NOTHING_TO_HARVEST` |
| 3 | un arbre hors de portée, 0 bois | le joueur le récolte | refus `OUT_OF_REACH` ; l'arbre est toujours là et l'inventaire contient 0 bois |
| 4 | une tuile d'eau hors de portée | le joueur la récolte | refus `NOTHING_TO_HARVEST` (premier motif) |
| 5 | aucun outil, un arbre hors de portée | le joueur le récolte | refus `MISSING_TOOL` (avant `OUT_OF_REACH`) |

**Notes** — Spécification B.5. Exemples 1 à 4 : convention de B.8 (le joueur a les outils).

**Historique** — v0.2 : création. v0.5 : « `NOTHING_TO_HARVEST`, puis `OUT_OF_REACH` » → motif `MISSING_TOOL` inséré entre les deux, car couper et piocher demandent un outil.

### 4.4 OUT — Outils requis

#### R-RES-OUT-001 · Outil requis pour récolter

| Statut | Version | Paramètres |
|---|---|---|
| EN VIGUEUR | v0.5 | — |

**Règle** — Couper un arbre demande une **hache** ; piocher un rocher demande une **pioche** ; ramasser des fleurs se fait à la main. Sans l'outil requis, la récolte est refusée (`MISSING_TOOL`).

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | aucun outil, 0 bois, un arbre à portée | le joueur le récolte | refus `MISSING_TOOL` ; l'arbre est toujours là et l'inventaire contient 0 bois |
| 2 | la hache en silex, 0 bois, un arbre à portée (rendement 3) | le joueur le récolte | l'inventaire contient 3 bois |
| 3 | la hache en silex seule, un rocher à portée | le joueur le récolte | refus `MISSING_TOOL` |
| 4 | la pioche en silex, 0 pierre, un rocher à portée (rendement 2) | le joueur le récolte | l'inventaire contient 2 pierres |
| 5 | aucun outil, des fleurs à portée (rendement 1) | le joueur les récolte | l'inventaire contient 1 fleur |

**Notes** — Concepts C-RES-04, C-RES-08. La section est placée après la fouille (4.3) pour garder les numéros existants. Les outils de la v0.5 sont en B.8.

**Historique** — v0.5 : création.

### 4.3 FOU — Fouille

#### R-RES-FOU-001 · Éléments à fouiller

| Statut | Version | Paramètres |
|---|---|---|
| EN VIGUEUR | v0.4 | — |

**Règle** — Trois types d'éléments des ruines se fouillent : la **bibliothèque en ruine**, le **coffre ancien** et la **caisse**. Les autres tuiles ne se fouillent pas.

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | une bibliothèque en ruine | on cherche ce qu'on peut en faire | elle se fouille |
| 2 | un coffre ancien | on cherche ce qu'on peut en faire | il se fouille |
| 3 | une caisse | on cherche ce qu'on peut en faire | elle se fouille |
| 4 | un arbre | on cherche ce qu'on peut en faire | il ne se fouille pas (il se coupe) |

**Notes** — Concept C-MON-09. Ces éléments sont debout et infranchissables.

**Historique** — v0.4 : création.

#### R-RES-FOU-002 · Portée de fouille

| Statut | Version | Paramètres |
|---|---|---|
| EN VIGUEUR | v0.4 | `HARVEST_REACH` |

**Règle** — Le joueur ne peut fouiller un élément que si la distance entre sa position et le centre de sa tuile est inférieure ou égale à `HARVEST_REACH`, comme pour récolter.

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | portée 48 px, un coffre sur la tuile (7, 6) (centre (240, 208)), le joueur en (240, 236) | il fouille le coffre | la fouille est acceptée |
| 2 | idem, le joueur en (240, 257) (distance 49) | il fouille le coffre | refus `OUT_OF_REACH` |

**Notes** — Concept C-MON-09.

**Historique** — v0.4 : création.

#### R-RES-FOU-003 · Contenu d'une cachette

| Statut | Version | Paramètres |
|---|---|---|
| MODIFIÉ | v0.6 | `SEARCH_MAX_BOOKS` |

**Règle** — Une fouille acceptée rapporte le contenu défini pour cet emplacement : au plus `SEARCH_MAX_BOOKS` livres, ajoutés à la bibliothèque du joueur, des objets (R-INV-OBJ-001), et des matériaux, ajoutés à l'inventaire. Un emplacement sans contenu défini ne rapporte rien. Un livre déjà possédé n'est pas ajouté une seconde fois.

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | une cachette sur la tuile (7, 6) qui contient le livre « le-tailleur » et 2 silex, 0 silex | le joueur la fouille | sa bibliothèque contient « le-tailleur » et son inventaire 2 silex |
| 2 | un coffre sans contenu défini | le joueur le fouille | la fouille est acceptée ; rien ne change dans la bibliothèque ni dans l'inventaire |
| 3 | le livre « le-tailleur » déjà possédé, une cachette qui le contient aussi | le joueur la fouille | la bibliothèque contient toujours un seul exemplaire |
| 4 | une cachette qui contient la poupée de chiffon bleue | le joueur la fouille | le joueur possède la poupée |

**Notes** — Concepts C-MON-09, C-TEC-06. Le contenu de la v0.4 est en B.7 ; un test vérifie qu'aucune cachette ne contient plus de `SEARCH_MAX_BOOKS` livres.

**Historique** — v0.4 : création. v0.6 : une cachette peut aussi contenir des objets (la poupée de la quête de Maëlle).

#### R-RES-FOU-004 · Une seule fouille

| Statut | Version | Paramètres |
|---|---|---|
| EN VIGUEUR | v0.4 | — |

**Règle** — Après une fouille, l'élément devient « fouillé » (bibliothèque fouillée, coffre ouvert, caisse vide) : il reste infranchissable mais ne se fouille plus. Une fouille refusée n'a aucun effet ; le motif est le premier qui s'applique : `NOTHING_TO_SEARCH` (hors de la carte, élément qui ne se fouille pas ou déjà fouillé), puis `OUT_OF_REACH`.

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | un coffre ancien à portée | le joueur le fouille | la tuile devient un coffre ouvert, infranchissable |
| 2 | un coffre ouvert à portée | le joueur le fouille | refus `NOTHING_TO_SEARCH` |
| 3 | une tuile d'herbe à portée | le joueur la fouille | refus `NOTHING_TO_SEARCH` |
| 4 | une caisse hors de portée | le joueur la fouille | refus `OUT_OF_REACH` ; la caisse est intacte |

**Notes** — Spécification B.5.

**Historique** — v0.4 : création.

## 5. INV — Inventaire

### 5.1 RES — Ressources

#### R-INV-RES-001 · Inventaire de départ

| Statut | Version | Paramètres |
|---|---|---|
| EN VIGUEUR | v0.4 | — |

**Règle** — Au début d'une nouvelle partie, l'inventaire contient 0 de chaque ressource : bois, pierre, fleur, silex, branche, fibre.

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | — | une nouvelle partie commence | l'inventaire contient 0 bois, 0 pierre, 0 fleur, 0 silex, 0 branche et 0 fibre |

**Notes** — Concepts C-IHM-06, C-RES-06.

**Historique** — v0.2 : création, « 0 bois, 0 pierre et 0 fleur ». v0.4 : trois ressources ajoutées (silex, branche, fibre), trouvées en fouillant.

### 5.2 LIV — Livres

#### R-INV-LIV-001 · Bibliothèque du joueur

| Statut | Version | Paramètres |
|---|---|---|
| EN VIGUEUR | v0.4 | — |

**Règle** — Les livres trouvés forment la bibliothèque du joueur, dans l'ordre où ils ont été trouvés, sans doublon. Une nouvelle partie commence sans livre.

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | — | une nouvelle partie commence | la bibliothèque est vide |
| 2 | la bibliothèque contient « carnet » | le joueur trouve « le-tailleur » | la bibliothèque contient « carnet » puis « le-tailleur » |

**Notes** — Concept C-TEC-06.

**Historique** — v0.4 : création.

#### R-INV-LIV-002 · Lire un livre

| Statut | Version | Paramètres |
|---|---|---|
| EN VIGUEUR | v0.5 | — |

**Règle** — Le joueur peut lire un livre de sa bibliothèque. Lire un livre de survie apprend ses plans : ils s'ajoutent aux recettes connues, dans l'ordre du livre, sans doublon. Relire un livre n'apprend rien de plus. Un livre absent de la bibliothèque ne se lit pas (`BOOK_NOT_OWNED`). Une nouvelle partie commence sans recette connue.

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | — | une nouvelle partie commence | aucune recette n'est connue |
| 2 | « Le Tailleur de silex » dans la bibliothèque, aucune recette connue | le joueur le lit | les recettes connues sont « hache en silex » puis « pioche en silex » |
| 3 | « Le Tailleur de silex » déjà lu | le joueur le relit | les recettes connues sont toujours « hache en silex » et « pioche en silex », une fois chacune |
| 4 | une bibliothèque vide | le joueur lit « Le Tailleur de silex » | refus `BOOK_NOT_OWNED` ; aucune recette connue |
| 5 | « Carnet du guetteur » dans la bibliothèque | le joueur le lit | « feu de camp » est une recette connue |

**Notes** — Concepts C-TEC-06, C-TEC-07. Tous les livres de la v0.5 sont des livres de survie. Le feu de camp est connu mais pas encore fabricable (B.8).

**Historique** — v0.5 : création.

### 5.3 OUT — Outils

#### R-INV-OUT-001 · Outils possédés

| Statut | Version | Paramètres |
|---|---|---|
| EN VIGUEUR | v0.5 | — |

**Règle** — Le joueur possède des outils, au plus un de chaque, dans l'ordre où il les a obtenus. Une nouvelle partie commence sans outil.

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | — | une nouvelle partie commence | le joueur ne possède aucun outil |
| 2 | la hache en silex possédée, de quoi fabriquer la pioche, sa recette connue | le joueur fabrique la pioche en silex | il possède la hache en silex puis la pioche en silex |

**Notes** — Concept C-INV-04. Pas d'usure pour l'instant.

**Historique** — v0.5 : création.

### 5.4 OBJ — Objets

#### R-INV-OBJ-001 · Objets

| Statut | Version | Paramètres |
|---|---|---|
| NOUVEAU | v0.6 | — |

**Règle** — Le joueur possède des objets, chacun au plus une fois, dans l'ordre où il les a trouvés. Une nouvelle partie commence sans objet. Donner un objet le retire (R-PNJ-QUE-002).

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | — | une nouvelle partie commence | le joueur ne possède aucun objet |
| 2 | la poupée possédée, la quête de Maëlle en cours, Maëlle à portée | le joueur lui donne la poupée | le joueur ne possède plus aucun objet |

**Notes** — Concepts C-INV-03, C-VIL-09.

**Historique** — v0.6 : création.

## 6. PNJ — Personnages non joueurs

### 6.1 POS — Position

#### R-PNJ-POS-001 · Position d'un PNJ

| Statut | Version | Paramètres |
|---|---|---|
| EN VIGUEUR | v0.3 | — |

**Règle** — Un PNJ se tient immobile au centre de sa tuile, orienté comme l'indiquent les données, tant qu'il ne parle pas.

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | tuiles de 32 px, Aldric sur la tuile (38, 90), orienté vers le bas | une nouvelle partie commence | Aldric est en (1232, 2896), orienté vers le bas |
| 2 | idem | 600 ticks s'écoulent | Aldric est toujours en (1232, 2896) |

**Notes** — Concept C-VIL-07. Les PNJ ne se déplacent pas encore. Leur liste est une donnée (`data/npcs.js`).

**Historique** — v0.3 : création.

#### R-PNJ-POS-002 · Un PNJ est un obstacle

| Statut | Version | Paramètres |
|---|---|---|
| EN VIGUEUR | v0.3 | `PLAYER_HITBOX_WIDTH`, `PLAYER_HITBOX_HEIGHT` |

**Règle** — Un PNJ a une boîte de collision de la même taille que celle du joueur. La boîte du joueur ne chevauche jamais celle d'un PNJ : le déplacement s'arrête au contact.

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | boîtes de 20 × 12 px, un PNJ en (300, 200) (boîte : x de 290 à 310, y de 188 à 200), le joueur en (270, 200), vitesse 1,5 px/tick | « droite » est demandée pendant 10 ticks | le joueur est en (280, 200) : sa boîte touche celle du PNJ |
| 2 | le même PNJ, le joueur en (270, 220) (boîte : y de 208 à 220) | « droite » est demandée pendant 10 ticks | le joueur est en (285, 220) : il passe sous le PNJ |

**Notes** — Concept C-VIL-07.

**Historique** — v0.3 : création.

### 6.2 DIA — Dialogues

#### R-PNJ-DIA-001 · Engager la conversation

| Statut | Version | Paramètres |
|---|---|---|
| EN VIGUEUR | v0.3 | `TALK_REACH` |

**Règle** — Le joueur peut parler à un PNJ si aucun dialogue n'est en cours et si la distance entre leurs positions est inférieure ou égale à `TALK_REACH`. Le dialogue commence alors à la page 1 et le PNJ se tourne vers le joueur (selon l'axe où l'écart est le plus grand ; à égalité, horizontalement). Sinon, la commande est refusée avec le premier motif applicable : `NOBODY_TO_TALK_TO` (PNJ inconnu), `ALREADY_TALKING`, `OUT_OF_REACH`.

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | portée 64 px, Aldric en (300, 300) orienté vers la gauche, le joueur en (300, 340), au sud | il parle à Aldric | le dialogue commence à la page 1 et Aldric est orienté vers le bas |
| 2 | idem, le joueur en (364, 300), à 64 px à l'est | il parle à Aldric | le dialogue commence ; Aldric est orienté vers la droite |
| 3 | idem, le joueur en (365, 300), à 65 px | il parle à Aldric | refus `OUT_OF_REACH` |
| 4 | — | il parle à « personne », un PNJ inconnu | refus `NOBODY_TO_TALK_TO` |
| 5 | un dialogue en cours avec Aldric | il parle à Aldric | refus `ALREADY_TALKING` |

**Notes** — Concept C-VIL-07. Spécification B.5.

**Historique** — v0.3 : création.

#### R-PNJ-DIA-002 · Pages du dialogue

| Statut | Version | Paramètres |
|---|---|---|
| EN VIGUEUR | v0.3 | — |

**Règle** — La commande « page suivante » passe à la page suivante ; après la dernière page, elle termine le dialogue. La commande « terminer » arrête le dialogue à tout moment. Sans dialogue en cours, ces commandes sont refusées (`NO_DIALOGUE`).

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | un dialogue de 3 pages, page 1 | page suivante | la page 2 est en cours |
| 2 | le même dialogue, page 3 | page suivante | le dialogue est terminé |
| 3 | le même dialogue, page 1 | terminer | le dialogue est terminé |
| 4 | aucun dialogue | page suivante | refus `NO_DIALOGUE` |

**Notes** — Concept C-IHM-08. On peut reparler à un PNJ : son dialogue recommence à la page 1.

**Historique** — v0.3 : création.

#### R-PNJ-DIA-003 · Immobile pendant un dialogue

| Statut | Version | Paramètres |
|---|---|---|
| EN VIGUEUR | v0.3 | — |

**Règle** — Tant qu'un dialogue est en cours, la direction demandée est ignorée : le joueur ne se déplace pas et ne marche pas.

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | un dialogue en cours, le joueur en (100, 100) | « droite » est demandée pendant 10 ticks | le joueur est toujours en (100, 100) et ne marche pas |
| 2 | le dialogue vient de se terminer | « droite » est demandée pendant 10 ticks, vitesse 1,5 px/tick | le joueur est en (115, 100) |

**Notes** — Concept C-IHM-08.

**Historique** — v0.3 : création.

#### R-PNJ-DIA-004 · Indices

| Statut | Version | Paramètres |
|---|---|---|
| EN VIGUEUR | v0.3 | — |

**Règle** — Quand une page qui porte un indice devient la page en cours, le lieu concerné entre au journal comme « indice », avec le PNJ et la page qui l'ont donné, sauf s'il figure déjà au journal (indice ou découvert).

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | un dialogue avec Aldric, dont la page 2 porte un indice sur les Ruines du Guet, page 1 | page suivante | les Ruines du Guet entrent au journal comme indice d'Aldric, page 2 |
| 2 | les Ruines du Guet déjà découvertes | la page 2 d'Aldric devient la page en cours | le journal ne change pas |
| 3 | l'indice déjà reçu d'Aldric | le joueur reparle à Aldric et relit la page 2 | le journal ne change pas : pas de doublon |
| 4 | un dialogue avec Aldric, page 1 (sans indice) | le dialogue commence | le journal ne change pas |

**Notes** — Concepts C-VIL-07, C-IHM-09.

**Historique** — v0.3 : création.

---

### 6.3 QUE — Quêtes

#### R-PNJ-QUE-001 · Recevoir une quête

| Statut | Version | Paramètres |
|---|---|---|
| NOUVEAU | v0.6 | — |

**Règle** — Quand une page qui confie une quête devient la page en cours, la quête entre au journal « en cours », sauf si elle y figure déjà.

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | la quête de Maëlle jamais reçue, un dialogue avec Maëlle à la page 2 | page suivante (page 3, qui confie la quête) | la quête « La poupée de Maëlle » est en cours |
| 2 | la quête déjà en cours | la page 3 est de nouveau affichée | la quête figure une seule fois, toujours en cours |
| 3 | la quête jamais reçue | le dialogue commence (page 1) | aucune quête n'est en cours |

**Notes** — Concepts C-VIL-09, C-VIL-07. Même mécanisme que les indices (R-PNJ-DIA-004).

**Historique** — v0.6 : création.

#### R-PNJ-QUE-002 · Donner l'objet d'une quête

| Statut | Version | Paramètres |
|---|---|---|
| NOUVEAU | v0.6 | `TALK_REACH` |

**Règle** — Donner à un PNJ l'objet d'une quête en cours qu'il a confiée retire l'objet, termine la quête, ajoute sa récompense à l'expérience et commence un dialogue de remerciement. Une demande refusée n'a aucun effet ; le motif est le premier qui s'applique : `NOBODY_TO_TALK_TO` (ce PNJ n'existe pas), `ALREADY_TALKING` (un dialogue est en cours), `OUT_OF_REACH` (le PNJ est à plus de `TALK_REACH`), `NOTHING_TO_GIVE` (aucune quête en cours de ce PNJ dont le joueur a l'objet).

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | la quête de Maëlle en cours, la poupée possédée, Maëlle à 40 px, 0 point d'expérience | le joueur donne à Maëlle | la poupée n'est plus possédée, la quête est terminée, l'expérience vaut 50, le dialogue de remerciement commence |
| 2 | la poupée possédée, la quête jamais reçue | le joueur donne à Maëlle | refus `NOTHING_TO_GIVE` |
| 3 | la quête en cours, sans la poupée | le joueur donne à Maëlle | refus `NOTHING_TO_GIVE` |
| 4 | la quête en cours, la poupée possédée, Maëlle à 100 px | le joueur donne à Maëlle | refus `OUT_OF_REACH` ; la poupée est toujours possédée |
| 5 | la quête terminée | le joueur donne à Maëlle | refus `NOTHING_TO_GIVE` |

**Notes** — Concepts C-VIL-09, C-JOU-09. Spécification B.5 et B.9.

**Historique** — v0.6 : création.

#### R-PNJ-QUE-003 · Dialogue après la quête

| Statut | Version | Paramètres |
|---|---|---|
| NOUVEAU | v0.6 | — |

**Règle** — Une fois une quête terminée, le PNJ qui l'a confiée ne dit plus la page qui la confiait ; il dit à sa place sa page « après la quête ». Tant que la quête n'est pas terminée, cette page n'est pas dite.

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | la quête de Maëlle non terminée | le joueur parle à Maëlle | les pages sont maelle-1, maelle-2, maelle-3 |
| 2 | la quête de Maëlle terminée | le joueur parle à Maëlle | les pages sont maelle-1, maelle-2, maelle-4 |

**Notes** — Concept C-VIL-09. Les pages de chaque PNJ sont en B.9 et dans `data/npcs.js`.

**Historique** — v0.6 : création.

## 7. ART — Artisanat

### 7.1 FAB — Fabrication

#### R-ART-FAB-001 · Fabriquer

| Statut | Version | Paramètres |
|---|---|---|
| EN VIGUEUR | v0.5 | — |

**Règle** — Fabriquer une recette connue retire ses ingrédients de l'inventaire et donne l'objet au joueur (B.8). La fabrication est immédiate, à la main, n'importe où.

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | la recette de la hache connue ; 2 silex, 3 branches, 1 fibre | le joueur fabrique la hache en silex | l'inventaire contient 1 silex, 1 branche, 0 fibre ; le joueur possède la hache en silex |
| 2 | la recette de la pioche connue ; 1 silex, 2 branches, 1 fibre | le joueur fabrique la pioche en silex | l'inventaire contient 0 silex, 0 branche, 0 fibre ; le joueur possède la pioche en silex |

**Notes** — Concept C-ART-04. Sans établi ni durée pour ce premier artisanat (C-ART-01 viendra avec la construction).

**Historique** — v0.5 : création.

#### R-ART-FAB-002 · Refus d'une fabrication

| Statut | Version | Paramètres |
|---|---|---|
| EN VIGUEUR | v0.5 | — |

**Règle** — Une fabrication refusée n'a aucun effet. Le motif est le premier qui s'applique, dans l'ordre : `UNKNOWN_RECIPE` (la recette n'existe pas ou n'a pas été apprise), puis `ALREADY_OWNED` (l'outil est déjà possédé), puis `MISSING_INGREDIENTS` (il manque au moins un ingrédient).

**Exemples**

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | aucune recette connue ; 1 silex, 2 branches, 1 fibre | le joueur fabrique la hache en silex | refus `UNKNOWN_RECIPE` ; l'inventaire est inchangé |
| 2 | la recette de la hache connue, la hache possédée ; 1 silex, 2 branches, 1 fibre | le joueur fabrique la hache en silex | refus `ALREADY_OWNED` ; l'inventaire est inchangé |
| 3 | la recette de la hache connue ; 1 silex, 1 branche, 1 fibre | le joueur fabrique la hache en silex | refus `MISSING_INGREDIENTS` ; l'inventaire est inchangé |
| 4 | le plan « feu de camp » connu | le joueur fabrique le feu de camp | refus `UNKNOWN_RECIPE` (pas encore de recette, B.8) |

**Notes** — Spécification B.5. `ALREADY_OWNED` évite de gaspiller des matériaux rares.

**Historique** — v0.5 : création.

---

# Partie E — Questions

Chaque question ouverte bloque les règles `À CONFIRMER` citées. Une fois tranchée, la réponse est reportée dans la règle, ses paramètres sont recopiés dans la partie C, et la question est déplacée dans « Questions tranchées ». Les règles d'une version passent à `NOUVEAU` ensemble, quand toutes les questions de la version sont tranchées : c'est le signal de l'implémentation. Les questions de game design (G1, G2…) sont dans la [spécification globale](GAME_DESIGN.md#10-questions-ouvertes).

## E.1 Paramètres proposés (non validés)

*Aucun.*

## E.2 Questions ouvertes

*Aucune.*

## E.3 Questions tranchées

| # | Question | Réponse | Règles impactées |
|---|---|---|---|
| Q1 | Déplacement en 8 directions ou en 4 ? | **8 directions.** | R-JOU-DEP-001, R-JOU-DEP-003, R-MON-COL-002 |
| Q9 | Quel pack de tuiles et de personnages ? | **Une planche de tuiles 32 px et un héros fournis** par le porteur du projet (`assets/images/`), plutôt que *Ninja Adventure*. Licence à éclaircir (Q11). | Règles IHM |
| G1 | Taille des tuiles ? | **32 px** (spécification globale). `TILE_SIZE` passe en partie C. | B.3, R-MON-CAR-001, exemples en pixels de toutes les règles |
| Q2 | Vitesse de marche ? | **3 px/tick.** | R-JOU-DEP-002, R-JOU-DEP-003 |
| Q3 | Orientation en diagonale ? | **On garde l'orientation si elle fait partie de la diagonale, sinon on prend l'horizontale.** | R-JOU-ORI-001 |
| Q4 | Taille de la clairière et position de départ ? | **40 × 30 tuiles, départ en (20, 15).** | R-MON-CAR-001, R-MON-CAR-002 |
| Q5 | Boîte de collision ? | **Aux pieds, 20 × 12 px.** | B.3, R-MON-CAR-003, R-MON-COL-001 |
| Q6 | Taille de la vue ? | **640 × 360 px de monde.** | R-IHM-CAM-001, R-IHM-CAM-002, R-IHM-AFF-001 |
| Q7 | Animation de marche ? | **Séquence 3, 2, 1, 2, 8 ticks par image ; colonne 2 = pose immobile.** | R-IHM-ANI-001, R-IHM-ANI-002 |
| Q8 | Touches ? | **Flèches + ZQSD, par emplacement physique.** | R-IHM-CMD-001 |
| Q10 | Taille d'affichage du héros ? | **32 × 32 px de monde** (taille d'origine du dessin, pixels doublés retirés). Donnée de `data/sprites.js`, pas un paramètre de règle. | Règles IHM |
| Q12 | Résolution de l'écran ? | **1920 × 1080, sans agrandissement** : la vue fait 1920 × 1080 px de monde (60 × 34 tuiles), une tuile fait 32 px à l'écran. Remplace la réponse à Q6 (640 × 360). | R-IHM-CAM-001, R-IHM-CAM-002, R-IHM-AFF-001 |
| Q16 | Détails de la récolte en v0.2 (non précisés dans la demande) ? | **Choix par défaut, à revoir si besoin** : portée de 48 px, rendements de 3 bois, 2 pierres, 1 fleur, récolte instantanée sans outil, l'arbre laisse une souche franchissable. | R-RES-ELE-001, R-RES-REC-001 à 003 |
| Q13 | Agrandir la clairière ? | **Oui** ; dépassé par la demande d'une grande carte d'exploration : la vallée fait 160 × 120 tuiles. | R-MON-CAR-001, R-MON-CAR-002 |
| Q14 | Les arbres repoussent-ils ? | **Oui**, quand le temps existera (concept C-RES-07). | R-RES-REC-003 (plus tard) |
| Q15 | Que montre la vue hors de la carte ? | **Une forêt dense.** | R-IHM-CAM-001 |
| Q19 | Contenu de la v0.3 (non précisé) ? | **Choix par défaut, à revoir** : 7 lieux dont 3 ruines, 3 PNJ (Aldric, Elwyn, Maëlle) avec un indice chacun (B.6) ; portée de parole de 64 px ; notifications de 4 s ; J pour le journal. | B.6, R-PNJ-DIA-001, R-IHM-NOT-001, R-IHM-JRN-001 |
| Q17 | Un éditeur de cartes (Tiled) ? | **Oui, plus tard** (concept C-MON-10). | — |
| Q18 | Les PNJ doivent-ils se déplacer ? | **Oui, avec le temps** (concept C-VIL-08). | R-PNJ-POS-001 (plus tard) |
| Q21 | Fouille : « au plus 2 livres » ? | **Au plus 2 livres par cachette** (`SEARCH_MAX_BOOKS`), confirmé ; la v0.4 en cache 2 en tout. Contenu de B.7 choisi par défaut, à revoir. | R-RES-FOU-003, B.7 |
| Q20 | Tilesets RPG Maker MV (tuiles de 48 px) ? | **Réduits à 32 px** par `tools/assets/downscaleTileset.js` (moyenne pondérée) : rendu jugé acceptable. Les originaux restent dans `assets/images/tilesets/mv-48px/`. | Aucune (assets) |
| Q22 | Détails de la v0.5 (non précisés dans la demande) ? | **Choix par défaut, à revoir** : touches I (inventaire) et C (artisanat) ; une seule fenêtre centrale à la fois ; fabrication immédiate ; un seul outil de chaque sorte, sans usure ; `MISSING_TOOL` vérifié avant `OUT_OF_REACH` ; 4 branches dans le coffre des Ruines du Guet. | B.5, B.7, B.8, R-IHM-FEN-001, R-INV-OUT-001, R-ART-FAB-002 |
| Q23 | Détails de la v0.6 (non précisés dans la demande) ? | **Choix par défaut, à revoir** : la quête est confiée par la page 3 de Maëlle ; la poupée se trouve dans le coffre du Hameau (127, 96), même avant d'avoir reçu la quête ; on ne peut la donner qu'une fois la quête reçue ; récompense de 50 expérience ; après la quête, Maëlle a une nouvelle réplique ; icônes de la barre : sac, marteau, livre ouvert. | B.9, R-PNJ-QUE-001 à 003, R-IHM-BAR-001 |
| Q11 | Origine et licence des assets ? | **Ressources de RPG Maker, pour un jeu personnel non publié** : utilisables tant que le jeu n'est pas diffusé. | — (assets/ASSETS.md) |

---

# Partie F — Journal des versions

| Version | Date | Résumé | Règles |
|---|---|---|---|
| v0.1 | 2026-10-11 | **Livrée.** Se déplacer dans la clairière : carte à tuiles, déplacement en 8 directions, orientation, collisions, caméra, affichage pixel art, animation de marche. | 16 règles `NOUVEAU`, toutes les questions tranchées (Q1 à Q11, G1). 13 paramètres. Animation adaptée au héros fourni (3 images par direction). Implémentée : 51 exemples testés dans `tests/spec/`. Résolution portée à 1920 × 1080 sans agrandissement (Q12). Terrain dessiné avec la planche RPG Maker d'origine (catalogue `data/tileset.js`, bordures en autotiles). |
| v0.2 | 2026-10-11 | **Livrée.** Récolter : désigner un élément au clic, fenêtre d'information, bouton « Récolter », bois / pierre / fleurs, souche, inventaire affiché. Caméra toujours centrée sur le joueur ; vue à la taille de la fenêtre. | Clôture de la v0.1 : 13 règles passées `EN VIGUEUR`. v0.2 : 11 NOUVEAU (R-IHM-INS-001 à 004, R-IHM-HUD-001, R-RES-ELE-001, R-RES-REC-001 à 004, R-INV-RES-001), 2 MODIFIÉ (R-IHM-CAM-001, R-IHM-AFF-001), 1 SUPPRIMÉ (R-IHM-CAM-002). Paramètres : 4 ajoutés, `VIEW_WIDTH` et `VIEW_HEIGHT` supprimés. |
| v0.3 | 2026-10-12 | **Livrée.** Explorer : une vallée de 160 × 120 tuiles générée par un outil, le Vallon préservé au départ, des lieux et des ruines à découvrir, trois PNJ immobiles à qui parler, des indices, un journal, des notifications, une forêt dense hors de la carte. | Clôture de la v0.2 : 13 règles passées `EN VIGUEUR`. v0.3 : 12 NOUVEAU (R-MON-LIE-001, 002, R-PNJ-POS-001, 002, R-PNJ-DIA-001 à 004, R-IHM-INS-005, R-IHM-DIA-001, R-IHM-JRN-001, R-IHM-NOT-001), 2 MODIFIÉ (R-MON-CAR-001, R-IHM-CAM-001). Paramètres : `MAP_WIDTH`, `MAP_HEIGHT`, `PLAYER_START_TILE` modifiés ; `TALK_REACH`, `NOTIFICATION_TICKS` ajoutés. |
| v0.4 | 2026-10-12 | **Livrée.** Fouiller : bibliothèques, coffres et caisses des ruines, deux livres (plans de la hache et de la pioche en silex, du feu de camp), silex, branches, fibres ; livres au journal ; atlas d'icônes ; tilesets MV réduits à 32 px. | Clôture de la v0.3 : 14 règles passées `EN VIGUEUR`. v0.4 : 8 NOUVEAU (R-RES-FOU-001 à 004, R-INV-LIV-001, R-IHM-INS-006, R-IHM-NOT-002, R-IHM-JRN-002), 3 MODIFIÉ (R-INV-RES-001, R-IHM-HUD-001, R-IHM-INS-002 : fenêtre au milieu de l'écran). Paramètre ajouté : `SEARCH_MAX_BOOKS`. Q20 et Q21 tranchées. |
| v0.5 | 2026-10-12 | **Livrée.** Premier artisanat : fenêtre d'inventaire, lecture des livres, recettes apprises, fenêtre d'artisanat, hache et pioche en silex ; couper et piocher demandent un outil. | Clôture de la v0.4 : 12 règles passées `EN VIGUEUR`, `SEARCH_MAX_BOOKS` aussi. v0.5 : 10 NOUVEAU (R-IHM-INS-007, R-IHM-FEN-001, R-IHM-INV-001, R-IHM-LIV-001, R-IHM-ART-001, R-RES-OUT-001, R-INV-LIV-002, R-INV-OUT-001, R-ART-FAB-001, R-ART-FAB-002), 2 MODIFIÉ (R-IHM-INS-003, R-RES-REC-004). Aucun paramètre : outils et recettes sont des données (B.8). Q22 tranchée par défaut. |
| v0.6 | 2026-10-12 | *En cours.* Barre d'actions à icônes ; première quête (la poupée de Maëlle, bouton « Donner ») ; expérience. Corrections : sprites de la bibliothèque en ruine et du coffre ancien (illisibles), caisse du hameau masquée. Retours de test : notifications au-dessus du héros avec ×, une notification par fouille, nom du lieu à chaque retour, livres retirés du journal, journal dans les fenêtres exclusives. | Clôture de la v0.5 : 12 règles passées `EN VIGUEUR`. v0.6 : 10 NOUVEAU (R-MON-LIE-003, R-JOU-EXP-001, R-IHM-HUD-002, R-IHM-JRN-003, R-IHM-NOT-003, R-IHM-BAR-001, R-INV-OBJ-001, R-PNJ-QUE-001 à 003), 8 MODIFIÉ (R-IHM-NOT-001, R-IHM-FEN-001, R-IHM-JRN-001, R-IHM-INS-005, R-IHM-INV-001, R-IHM-ART-001, R-IHM-NOT-002, R-RES-FOU-003), 1 SUPPRIMÉ (R-IHM-JRN-002). Q23 tranchée par défaut. |
