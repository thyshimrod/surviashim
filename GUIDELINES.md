# Surshim — Guideline d'architecture et de développement

> Document de référence du projet **Surshim**.
> Toute contribution (humaine ou assistée par IA) doit le respecter.
> Il reprend l'architecture, les standards et l'outillage du projet **Tower** (eux-mêmes tirés de l'analyse d'*Age of Shimrod*), et les complète pour un RPG 2D à tuiles : carte, sprites animés, caméra, sauvegarde, contenu volumineux.

---

## Sommaire

1. [Principes directeurs](#1-principes-directeurs)
2. [Héritage de Tower et ce qui change](#2-héritage-de-tower-et-ce-qui-change)
3. [Stack technique](#3-stack-technique)
4. [Arborescence du projet](#4-arborescence-du-projet)
5. [Architecture en couches](#5-architecture-en-couches)
6. [Boucle de jeu](#6-boucle-de-jeu)
7. [Données de jeu](#7-données-de-jeu)
8. [Assets, tuiles et animations](#8-assets-tuiles-et-animations)
9. [Rendu 2D rétro](#9-rendu-2d-rétro)
10. [Sauvegarde](#10-sauvegarde)
11. [Standards de code](#11-standards-de-code)
12. [Tests unitaires et conformité à la spécification](#12-tests-unitaires-et-conformité-à-la-spécification)
13. [Débogage](#13-débogage)
14. [Workflow de développement](#14-workflow-de-développement)
15. [Checklist avant commit](#15-checklist-avant-commit)

---

## 1. Principes directeurs

| # | Principe | Conséquence concrète |
|---|----------|----------------------|
| P1 | **Séparation stricte métier / présentation** | `src/core/` ne connaît ni le DOM, ni le canvas, ni `window`, ni les images. |
| P2 | **Lisible par un humain** | Noms explicites, fonctions courtes, pas de nombres magiques, un fichier = une responsabilité. |
| P3 | **Testable** | Toute règle métier est une fonction ou méthode testable en Node, sans navigateur. |
| P4 | **Déterministe** | Le temps et l'aléatoire sont *injectés* : une partie est reproductible à l'identique. |
| P5 | **Débuggable sans outillage lourd** | Pas de bundler : le code exécuté dans le navigateur est exactement le code source. |
| P6 | **Piloté par les données** | Objets, recettes, cultures, bâtiments, ennemis, cartes, feuilles de sprites… sont des données, pas du code. |
| P7 | **Traçable vers la spécification** | Chaque concept de `docs/GAME_DESIGN.md` et chaque règle de `docs/SPECIFICATION.md` a un identifiant ; les règles sont reprises dans les tests. |
| P8 | **Sérialisable** | L'état du jeu est fait de données simples (pas de références circulaires, pas de fonctions) : il se sauvegarde et se recharge tel quel. |

---

## 2. Héritage de Tower et ce qui change

### 2.1 Repris tel quel

| Élément | Où |
|---|---|
| Modules ES natifs, sans framework ni bundler | [décision 0001](docs/decisions/0001-modules-es-sans-bundler.md) |
| Temps métier en ticks fixes de 1/60 s, boucle à pas fixe | [décision 0002](docs/decisions/0002-temps-en-ticks.md) |
| Couches `core` / `presentation` / `app` / `debug`, vérifiées par un test d'architecture | § 5, `tests/architecture/layers.test.js` |
| Commandes (présentation → métier), lecture d'état, `EventBus` (métier → présentation) | § 5.2 |
| Format de la spécification (identifiants, statuts, exemples, historique) et contrôle de couverture | `docs/SPECIFICATION.md` partie A, `tools/spec*.js` |
| Paramètres de `data/gameParameters.js` identiques à la partie C de la spécification | `tests/data/gameParameters.test.js` |
| Qualité : ESLint + SonarJS + JSDoc, Prettier, jscpd, `tsc` en vérification seule, couverture ≥ 90 % | § 11.6 |

### 2.2 Ajouté pour un RPG 2D

| Besoin | Réponse | Section |
|---|---|---|
| Deux niveaux de spécification | Spécification **globale** (`GAME_DESIGN.md`, concepts `C-…`) et **détaillée** (`SPECIFICATION.md`, règles `R-…`) | § 12.3 |
| Monde à tuiles | Carte en grille, collisions par tuile, cartes décrites dans `data/maps/` | § 7, § 8 |
| Personnages animés | Feuilles de sprites décrites dans `data/sprites.js` ; l'animation est **calculée par la présentation** à partir de l'état métier | § 8.3 |
| Caméra et pixel art | Vue de taille fixe en pixels de monde, agrandie d'un facteur entier, sans lissage | § 9 |
| Profondeur en vue trois-quarts | Tri des éléments debout par y des pieds | § 9 |
| Entrées continues (touche maintenue) | La présentation envoie une **intention** (direction demandée) ; le métier l'applique à chaque tick | § 5.2 |
| Sauvegarde | État sérialisable (P8) ; lecture / écriture du stockage dans `src/app/`, jamais dans `core/` | § 10 |
| Beaucoup de contenu | Un fichier de données par catégorie, références croisées vérifiées par des tests | § 7 |
| Comportements de PNJ et de monstres | Pattern *Strategy* dans `core/behaviors/`, recherche de chemin dans `core/utils/` | § 5.4 |

---

## 3. Stack technique

| Besoin | Choix | Justification |
|---|---|---|
| Langage | **JavaScript ES2022**, modules ES natifs | Pas de compilation, code source = code exécuté. |
| Typage | **JSDoc** + `// @ts-check` (vérifié par `tsc`, sans compilation) | Autocomplétion et détection d'erreurs, sans étape de build. |
| Rendu | **Canvas 2D** natif, plusieurs couches | Suffisant pour du pixel art 16 bits ; aucun moteur à apprendre. |
| Tests | **`node:test` + `node:assert/strict`** (Node ≥ 22) | Zéro dépendance, rapide, couverture native. |
| Qualité | **ESLint** (flat config, SonarJS, JSDoc) + **Prettier** + **jscpd** | Standards partagés, formatage automatique. |
| Serveur local | `http-server` (`npm run serve`) | Les modules ES ne se chargent pas en `file://`. |
| Éditeur de cartes | **À décider** — *Tiled* (export JSON) est le candidat naturel | Cf. question G10 et future décision `0003`. |

Aucun framework (React, Phaser…) ni bundler (Webpack, Vite…) sans décision explicite consignée dans `docs/decisions/`.

---

## 4. Arborescence du projet

```
surshim/
├── index.html                  # Page unique : canvas + <script type="module" src="src/main.js">  (v0.1)
├── GUIDELINES.md               # Ce document
├── CLAUDE.md                   # Consignes pour l'assistant
├── README.md                   # Lancer, tester, jouer
├── package.json                # Scripts npm — dépendances de dev uniquement
├── eslint.config.js, .prettierrc, jsconfig.json, .jscpd.json
│
├── docs/
│   ├── GAME_DESIGN.md          # Spécification globale : vision, piliers, concepts C-THÈME-NN
│   ├── SPECIFICATION.md        # Spécification détaillée : règles R-THÈME-SOUS-NNN
│   └── decisions/              # Décisions d'architecture (ADR) numérotées : 0001-xxx.md
│
├── assets/                     # Fichiers binaires uniquement — aucun code
│   ├── images/
│   │   ├── tilesets/           # Tuiles du terrain (herbe, eau, falaises…), une image par tileset
│   │   ├── sprites/
│   │   │   ├── characters/     # Joueur (feuilles d'animation 4 directions)
│   │   │   ├── villagers/      # Villageois
│   │   │   └── monsters/       # Créatures de la Horde
│   │   ├── buildings/          # Bâtiments, murs, défenses
│   │   ├── items/              # Icônes d'objets
│   │   ├── effects/            # Impacts, fumée, lumière
│   │   └── ui/                 # Cadres, boîtes de dialogue, portraits, police bitmap
│   ├── sounds/{music,sfx}/
│   ├── fonts/
│   └── ASSETS.md               # Inventaire : fichier, source, licence, découpage
│
├── data/                       # Données pures : modules JS exportant des objets gelés
│   ├── gameParameters.js       # Copie exacte de la partie C de la spécification
│   ├── sprites.js              # Découpage des feuilles : taille d'image, lignes par direction, nb d'images
│   ├── tilesets.js             # Propriétés des tuiles : franchissable, récoltable, saison…
│   ├── items.js                # Objets (à venir : recipes.js, crops.js, buildings.js, enemies.js, villagers.js…)
│   ├── places.js, npcs.js      # Lieux nommés, PNJ et leurs dialogues (textes dans i18n/)
│   └── maps/valley.js          # La vallée, générée par tools/maps/generateValley.js
│
├── src/
│   ├── main.js                 # Point d'entrée navigateur : assemble les couches, lance la boucle
│   │
│   ├── core/                   # ===== COUCHE MÉTIER — aucun accès DOM / canvas / window / image =====
│   │   ├── config/             # Constantes métier nommées (directions, catégories…)
│   │   ├── model/              # Entités : Player, TileMap, Item, Inventory, Villager, Monster, Building, Crop…
│   │   ├── systems/            # Règles appliquées à chaque tick : movement, collision, dayCycle, growth, combat, raids…
│   │   ├── behaviors/          # Stratégies de comportement : métiers des villageois, IA des monstres
│   │   ├── commands/           # Actions du joueur validées par le métier : setMoveIntent, useTool, craft, build…
│   │   ├── events/             # EventBus + catalogue des événements émis
│   │   ├── state/              # GameState (racine de l'état, sérialisable), création, (dé)sérialisation
│   │   ├── utils/              # Fonctions pures : géométrie, grille, rng seedé, recherche de chemin
│   │   └── Game.js             # Façade : update() (un tick), advanceTicks(n), execute(cmd), getState(), events
│   │
│   ├── presentation/           # ===== COUCHE PRÉSENTATION — lit l'état, n'en modifie jamais les règles =====
│   │   ├── canvas/             # Couches canvas, agrandissement entier, absence de lissage
│   │   ├── camera/             # Suivi du joueur, bornage, conversion écran ↔ monde
│   │   ├── renderers/          # TileMapRenderer, CharacterRenderer, LightingRenderer…
│   │   ├── animation/          # Choix de l'image d'animation à partir de l'état (fonctions pures)
│   │   ├── ui/                 # HUD, inventaire, boîtes de dialogue, menus
│   │   ├── input/              # Clavier / manette → intentions et commandes métier
│   │   ├── assets/             # AssetLoader (préchargement + cache d'images et de sons)
│   │   ├── i18n/fr.js          # Tous les textes affichés
│   │   ├── styles/main.css
│   │   ├── GameRenderer.js     # Orchestration du dessin de toutes les couches
│   │   └── theme.js            # Couleurs d'interface, polices, tailles
│   │
│   ├── app/                    # ===== ORCHESTRATION =====
│   │   ├── GameLoop.js         # Pas de temps fixe ; requestAnimationFrame injecté (testable)
│   │   └── SaveStorage.js      # Lecture / écriture des sauvegardes (localStorage) — cf. § 10
│   │
│   └── debug/                  # Outils de debug, chargés uniquement si ?debug=1
│
├── tools/
│   ├── specParser.js, specCoverage.js, specCheck.js   # Contrôle spécification ↔ tests
│   ├── qualityReport.js        # Rapport HTML de qualité
│   ├── maps/                   # Génération seedée de la vallée, contrôle d'accessibilité
│   ├── assets/                 # Lecture/écriture PNG, réduction des planches 48 px → 32 px
│   └── catalog/                # Page de consultation des sprites, icônes et personnages
│
└── tests/
    ├── unit/                   # Miroir de src/ (core, presentation pure, app, tools)
    ├── data/                   # Validation des fichiers de data/ (schémas, références croisées, images existantes)
    ├── architecture/           # Règles de dépendance entre couches + couverture de la spécification
    ├── spec/                   # Scénarios de conformité, un describe par règle, un it par exemple
    └── helpers/                # Fabriques d'entités, partie sur mesure (testGame.js), cartes de test
```

### Règles de placement

- Un fichier contient **une** classe ou **un** groupe cohérent de fonctions ; il porte le nom de ce qu'il exporte.
- Classes en `PascalCase.js`, modules de fonctions en `camelCase.js`, tests en `<NomDuModule>.test.js`, scénarios en `<thème>.spec.test.js`.
- Aucun code dans `assets/`. Aucune image dans `src/` ou `data/`.
- Les dossiers vides contiennent un `.gitkeep` tant qu'ils n'ont pas de fichier.

---

## 5. Architecture en couches

### 5.1 Sens des dépendances

```
        ┌───────────────────────────────┐
        │  app/  (main.js, GameLoop,    │   assemble tout, accède au stockage
        │         SaveStorage)          │
        └──────────────┬────────────────┘
                       │
        ┌──────────────▼────────────────┐
        │  presentation/                │   dessine, anime, écoute clavier/manette
        └──────────────┬────────────────┘
                       │  lit l'état, envoie des commandes, écoute des événements
        ┌──────────────▼────────────────┐
        │  core/                        │   règles du jeu, état, pur JavaScript
        └──────────────┬────────────────┘
                       │
        ┌──────────────▼────────────────┐
        │  data/                        │   paramètres, contenu, cartes (objets figés)
        └───────────────────────────────┘
```

**Règles strictes** (vérifiées automatiquement par `tests/architecture/` et ESLint) :

1. `core/` n'importe **que** depuis `core/` et `data/`.
2. `core/` et `data/` ne référencent jamais `window`, `document`, `Image`, `HTMLCanvasElement`, `CanvasRenderingContext2D`, `localStorage`, `Date`, `performance`, `Math.random`, `requestAnimationFrame`, `setTimeout`, `setInterval`.
3. `presentation/` peut importer `core/` mais **ne modifie jamais l'état directement** : elle passe par `game.execute(command)`.
4. `data/` n'importe que `data/`.

### 5.2 Communication entre les couches

| Direction | Mécanisme | Exemple |
|---|---|---|
| Présentation → Métier | **Commande** : `game.execute(craft({ recipe: 'wooden-axe' }))` → `{ ok: true }` ou `{ ok: false, reason: 'MISSING_INGREDIENTS' }` | Clic sur une recette. |
| Présentation → Métier (continu) | **Intention** : `game.execute(setMoveIntent({ dx: 1, dy: -1 }))` à chaque changement des touches enfoncées ; le métier l'applique à **chaque tick** jusqu'à la prochaine intention | Touche maintenue. |
| Métier → Présentation (lecture) | **Lecture de l'état** : `game.getState()` (objets lus, jamais modifiés) | Le renderer dessine le joueur à `state.player.position`. |
| Métier → Présentation (notification) | **Événements** via `EventBus` : `events.emit(EVENTS.ITEM_HARVESTED, { item, x, y })` | La présentation joue un son, affiche « +1 bois ». |

Le métier ne sait pas qu'il est affiché. On doit pouvoir jouer une journée complète en Node, uniquement avec des commandes et des appels à `update()`.

### 5.3 Entité métier, renderer et animation séparés

```js
// src/core/model/Player.js — état métier pur, sérialisable
export class Player {
  constructor({ position, facing }) {
    this.position = { ...position };   // milieu des pieds, px monde
    this.facing = facing;              // 'up' | 'down' | 'left' | 'right'
    this.walkingTicks = 0;             // ticks de marche continue (0 = immobile)
  }
}
```

```js
// src/presentation/animation/selectFrame.js — fonction pure, testée
// R-IHM-ANI-001, R-IHM-ANI-002
export function selectWalkFrame(walkingTicks, { frameTicks, frameCount }) {
  return Math.floor(walkingTicks / frameTicks) % frameCount;
}
```

```js
// src/presentation/renderers/CharacterRenderer.js — dessine, ne modifie rien
render(player) {
  const sheet = SPRITES.player;
  const frame = player.walkingTicks === 0 ? sheet.idle : selectWalkFrame(player.walkingTicks, sheet.walk);
  this.drawFrame(sheet, player.facing, frame, this.camera.worldToScreen(player.position));
}
```

Le métier expose **ce qui se passe** (orientation, action en cours, depuis combien de ticks) ; la présentation en déduit **quelle image** afficher. Aucune coordonnée de découpe ni durée d'image dans `core/`.

### 5.4 Systèmes métier

Les règles appliquées à chaque tick sont des **systèmes** sans état propre, `(state, context) => void`, appelés dans un ordre fixe documenté par une règle `R-PAR-TCK-…` de la spécification :

```js
// src/core/Game.js (principe)
update() {
  this.state.tick += 1;
  applyMovement(this.state);            // intention → déplacement, collisions
  advanceWorldClock(this.state, this.events);
  runVillagerBehaviors(this.state, this.events);
  runMonsterBehaviors(this.state, this.events, this.rng);
  resolveCombat(this.state, this.events);
  // …
}
```

Les comportements des villageois et des monstres sont des **stratégies** (`core/behaviors/`) : un villageois bûcheron et un villageois fermier partagent le même modèle, seule la stratégie change.

### 5.5 Temps et aléatoire

- Le métier compte le temps en **ticks** (`TICK_RATE` = 60). L'heure du monde (jour, nuit) est **dérivée** du nombre de ticks, jamais lue sur l'horloge système.
- L'aléatoire passe par `createRng(seed)` (`core/utils/random.js`), injecté dans `Game`. La graine est **sauvegardée** avec la partie et affichée en mode debug.

---

## 6. Boucle de jeu

Boucle à **pas de temps fixe** pour la logique, rendu à chaque image ([décision 0002](docs/decisions/0002-temps-en-ticks.md)) :

```js
// src/app/GameLoop.js (principe)
const STEP_MS = 1000 / TICK_RATE;

function frame(now) {
  accumulator += Math.min(now - lastTime, 250) * speed; // 250 ms max : pas de rattrapage massif
  lastTime = now;
  while (accumulator >= STEP_MS) {
    game.update();                                       // un tick de logique : déterministe
    accumulator -= STEP_MS;
  }
  renderer.render(game.getState());                      // affichage : à chaque image
  requestAnimationFrame(frame);
}
```

- `requestAnimationFrame` est injecté : les tests le remplacent par une fonction pilotée à la main.
- La boucle peut être **mise en pause** (menu, inventaire ouvert si la spécification le prévoit), **accélérée** et **avancée d'un pas** (mode debug).
- Le rendu ne déclenche jamais de logique métier.

---

## 7. Données de jeu

- Les données sont des **modules JS** exportant des objets **gelés** à tous les niveaux — chargeables par le navigateur et par Node sans `fetch`.
- Chaque type de donnée est documenté par un `@typedef` JSDoc dans son fichier.
- Les identifiants sont des **chaînes lisibles** en `kebab-case` (`'wooden-axe'`, `'goblin-scout'`), jamais des entiers.
- `data/gameParameters.js` reproduit **exactement** la partie C de la spécification (test `tests/data/gameParameters.test.js`). Le **contenu** (liste des objets, recettes, cartes) n'est pas recopié dans la spécification : les règles décrivent les mécanismes, les données décrivent le contenu.
- Tests obligatoires dans `tests/data/` : champs requis, valeurs dans les bornes, identifiants uniques, **références croisées** valides (une recette ne cite que des objets existants, une carte ne cite que des tuiles définies), fichiers d'images existants, découpages de sprites compris dans les dimensions de l'image.

```js
// data/items.js (exemple pour une version future)
// @ts-check

/**
 * @typedef {object} ItemDefinition
 * @property {string} id          Identifiant unique, kebab-case
 * @property {'resource' | 'tool' | 'weapon' | 'food' | 'seed' | 'furniture'} category
 * @property {number} maxStack    Taille maximale d'une pile (1 = non empilable)
 * @property {string} icon        Clé dans data/sprites.js
 */

/** @type {Readonly<Record<string, Readonly<ItemDefinition>>>} */
export const ITEMS = Object.freeze({
  wood: Object.freeze({ id: 'wood', category: 'resource', maxStack: 99, icon: 'item-wood' }),
  'wooden-axe': Object.freeze({ id: 'wooden-axe', category: 'tool', maxStack: 1, icon: 'item-wooden-axe' }),
});
```

---

## 8. Assets, tuiles et animations

### 8.1 Fichiers

- `assets/` ne contient **que** des fichiers statiques (images, sons, polices).
- Noms en `kebab-case`, sans espaces : `player-walk.png`, `tileset-meadow.png`.
- `assets/ASSETS.md` liste chaque fichier, son origine, sa **licence** et son découpage. Aucune image sans licence connue et compatible.
- Les images sont **préchargées** par `AssetLoader` avant le menu ; une image manquante produit une erreur explicite (nom du fichier).

### 8.2 Tuiles

- Taille de tuile : `TILE_SIZE` (32 px, validé). Toutes les images de tuiles respectent cette grille.
- La planche principale est **cataloguée** dans `data/tileset.js` : chaque sprite a un nom, une position et une taille en tuiles, une catégorie. Les terrains à bordures sont des **autotiles** au format RPG Maker VX (blocs de 2 × 3 tuiles), recomposés par quarts de tuile (`src/presentation/renderers/autotile.js`). Le catalogue se parcourt dans `tools/catalog/` (`npm run serve`, puis <http://localhost:8081/tools/catalog/>).
- Il y a **plusieurs planches** (`TILESETS` dans `data/tileset.js`) : `main` et les intérieurs. Un sprite d'une autre planche que `main` porte `sheet` ; les sprites des ruines et des intérieurs sont dans `data/interiorSprites.js`, et un test vérifie qu'aucun nom n'en masque un autre. Une planche RPG Maker MV (tuiles de 48 px) est réduite en 32 px par `tools/assets/downscaleTileset.js` ; l'original reste dans `assets/images/tilesets/mv-48px/`.
- Les **icônes** (inventaire, livres, interface) viennent de l'atlas `assets/images/ui/iconset.png` (24 px, 16 colonnes). Seules les icônes nommées dans `data/icons.js` sont utilisées ; une donnée (ressource, livre) cite une icône par son nom, jamais par sa position.
- L'apparence de chaque type de tuile (autotile, décor au sol, sprites debout possibles) est dans `data/terrainAppearance.js` ; les variantes sont tirées de façon **stable** par tuile, sans aléatoire.
- Les **propriétés métier** d'une tuile (franchissable, récoltable, labourable…) sont dans `data/tilesets.js`, indexées par identifiant de tuile. Le métier ne connaît que ces identifiants et propriétés, jamais l'image.
- Une carte est faite de **couches** : sol, décor au sol, éléments debout (triés en profondeur), toits / au-dessus du joueur.

### 8.3 Feuilles d'animation

- Format de référence (héros fourni) : 3 images × 4 lignes, lignes dans l'ordre bas, gauche, droite, haut, colonne du milieu = pose immobile.
- Chaque feuille est décrite dans `data/sprites.js` : image, taille d'une image, ligne par orientation, liste des animations (`idle`, `walk`, `tool`, `attack`, `dodge`, `hurt`) avec nombre d'images et durée en ticks, **point d'ancrage** (les pieds).
- Aucune coordonnée de découpe en dur dans le code.
- Le choix de l'image est une **fonction pure** de `src/presentation/animation/` (testée), alimentée par l'état métier (orientation, action, ticks écoulés).

---

## 9. Rendu 2D rétro

| Règle | Mise en œuvre |
|---|---|
| Résolution logique fixe | Le monde est dessiné dans une vue de `VIEW_WIDTH` × `VIEW_HEIGHT` px de monde (1920 × 1080, question Q12 : affichée sans agrandissement en 1080p). |
| Agrandissement entier, sans flou | Facteur entier maximal (R-IHM-AFF-001) ; `context.imageSmoothingEnabled = false` ; CSS `image-rendering: pixelated`. |
| Positions arrondies au dessin | Le métier travaille en décimal ; la présentation arrondit au pixel de monde **au moment du dessin** (évite le scintillement). |
| Profondeur | Éléments debout triés par y des pieds (R-IHM-AFF-002). |
| Performance | Seules les tuiles visibles sont dessinées ; les couches statiques (sol) sont pré-rendues dans un canvas hors écran et redessinées seulement si la carte change. |
| Lumière (à venir) | Couche d'assombrissement + halos, calculée par la présentation à partir de l'heure et des sources de lumière de l'état. |

---

## 10. Sauvegarde

- L'état (`GameState`) est **sérialisable** (P8) : `serializeState(state)` → objet JSON, `deserializeState(json)` → état. Ces deux fonctions sont dans `core/state/` et **testées** (aller-retour identique).
- Chaque sauvegarde porte un **numéro de format** ; une sauvegarde d'un format plus ancien passe par une fonction de migration testée, ou est refusée avec un message clair.
- La lecture et l'écriture du stockage (`localStorage`, fichier exporté) sont dans `src/app/SaveStorage.js`, **jamais** dans `core/`.
- Quand sauvegarder est une règle de jeu (concept C-SAU-01) : le métier émet un événement (`DAY_ENDED`), `app/` réagit en écrivant la sauvegarde.

---

## 11. Standards de code

### 11.1 Langage

- Modules ES (`import`/`export`), **exports nommés** uniquement.
- `class` pour les entités et services, fonctions pures pour les calculs.
- `const` par défaut, `let` si réaffectation, jamais `var`. Égalité stricte uniquement.
- `undefined` testé par `=== undefined` ou `??` / `?.`.
- Pas de modification des paramètres reçus, sauf si c'est le rôle documenté de la fonction (un système modifie l'état qu'il reçoit).
- Erreurs de programmation → `throw` avec un message explicite. Refus métier attendus (pas assez de matériaux, emplacement occupé) → `{ ok: false, reason }`.

### 11.2 Nommage

| Élément | Convention | Exemple |
|---|---|---|
| Classe | `PascalCase` | `TileMap` |
| Fonction, méthode, variable | `camelCase`, verbe pour les actions | `findTileAt()`, `isWalkable()` |
| Booléen | préfixe `is` / `has` / `can` | `isBlocking`, `canHarvest` |
| Constante | `UPPER_SNAKE_CASE` | `TILE_SIZE` |
| Identifiant de donnée | `kebab-case` | `'goblin-scout'` |
| Unité dans le nom si ambiguë | suffixe | `speedPxPerTick`, `durationTicks` |
| Langue | **anglais** pour le code ; **français** pour les textes affichés (`i18n/fr.js`), les tests et la documentation | — |

### 11.3 Taille et lisibilité

- Fonction : **≤ 40 lignes**, **≤ 4 paramètres** (au-delà : un objet d'options), imbrication **≤ 3 niveaux**.
- Fichier : **≤ 300 lignes** ; au-delà, découper.
- Aucun nombre magique : toute valeur a un nom.
- Pas de code mort ni de code commenté.
- `TODO` uniquement sous la forme `// TODO(nom): description`.

### 11.4 Commentaires et documentation

- Chaque classe et fonction exportée a un bloc **JSDoc**.
- `// @ts-check` en tête de chaque fichier de `src/` et `data/`.
- Les commentaires expliquent le **pourquoi**.
- Une règle métier implémentée cite son identifiant : `// R-MON-COL-002 : glissement le long de l'obstacle`.

### 11.5 Scripts

| Commande | Rôle |
|---|---|
| `npm run check` | **Tout** : lint, typage, formatage, duplication, tests, couverture de la spécification. À lancer avant chaque commit. |
| `npm test` / `npm run test:watch` | Tests (unitaires, données, architecture, spécification) |
| `npm run test:coverage` | Échoue si la couverture de `src/core/` passe sous 90 % |
| `npm run spec:check` | Bilan des règles de la spécification et de leurs tests |
| `npm run lint` / `npm run typecheck` / `npm run format` / `npm run duplication` | Contrôles unitaires |
| `npm run quality:report` | Rapport HTML dans `reports/quality.html` |

### 11.6 Qualité du code (équivalent SonarQube, en local)

| Outil | Vérifie | Seuil bloquant |
|---|---|---|
| `eslint-plugin-sonarjs` | Bugs probables, code mort, complexité cognitive | 0 erreur, 0 avertissement ; complexité cognitive ≤ 15 |
| `eslint-plugin-jsdoc` | Documentation des fonctions, classes et méthodes exportées | 0 erreur, 0 avertissement |
| `jscpd` | Code copié-collé (blocs de 6 lignes ou plus) | ≤ 3 % |
| `node --test` + couverture | Lignes de `src/core/` exécutées par les tests | ≥ 90 % |

Une règle ESLint qui ne convient pas ne se désactive pas en silence : la désactivation est justifiée en commentaire dans `eslint.config.js` et consignée si besoin dans `docs/decisions/`. Prettier : 2 espaces, guillemets simples, point-virgule, largeur 100.

---

## 12. Tests unitaires et conformité à la spécification

### 12.1 Objectifs

| Périmètre | Exigence |
|---|---|
| `src/core/**` | **Couverture ≥ 90 %** ; toute règle métier testée. |
| `data/**` | Validation complète (cf. § 7). |
| `src/presentation/**` | Logique pure testée : caméra, agrandissement, choix d'image d'animation, tri en profondeur, correspondance des touches, mise en page. Le dessin canvas lui-même n'est pas testé. |
| Sauvegarde | Aller-retour `serialize` / `deserialize` identique ; migrations de format. |
| Architecture | Règles de dépendance du § 5.1 vérifiées par un test. |

### 12.2 Écriture des tests

- `node:test` (`describe`, `it`) + `node:assert/strict`.
- Un fichier de test par module, à l'emplacement miroir.
- Structure **Arrange / Act / Assert**, un comportement par test, nom en français.
- Pas d'horloge réelle, pas de `Math.random` : le temps s'avance avec `game.advanceTicks(n)`, l'aléatoire est seedé.
- Les cartes de test sont construites à la main, petites, dans `tests/helpers/` (ex. une carte 10 × 10 avec un rocher en (7, 6)).
- Valeurs décimales : comparer à une tolérance explicite (`Math.abs(actual - expected) < 0.01`) quand la spécification dit « à 0,01 près ».

### 12.3 Traçabilité

```
docs/GAME_DESIGN.md          docs/SPECIFICATION.md            tests/spec/           src/
C-JOU-01 (concept)  ──────▶  R-JOU-DEP-002 (règle)  ──────▶  describe('R-JOU-DEP-002 · …')
   VALIDÉ                       ex.1, ex.2, ex.3      ──────▶    it('ex.1 — …') …    // R-JOU-DEP-002
```

1. Un concept `VALIDÉ` de la spécification globale est décliné en règles dans la spécification détaillée ; chaque règle cite son concept dans ses notes.
2. Chaque règle testable (`NOUVEAU`, `MODIFIÉ`, `EN VIGUEUR`) a un `describe` dans `tests/spec/` dont le nom commence par son identifiant, et un `it('ex.N — …')` par exemple.
3. `npm run spec:check` et `tests/architecture/specCoverage.test.js` échouent si une règle ou un exemple n'est pas testé, ou si un test cite une règle inconnue, supprimée ou à confirmer.
4. Toute modification de la spécification implique la mise à jour des tests dans le même commit.

---

## 13. Débogage

| Outil | Description |
|---|---|
| **Code source = code exécuté** | Les points d'arrêt des DevTools tombent sur les fichiers de `src/` tels qu'écrits. |
| **Mode debug** `index.html?debug=1` | FPS, tick, heure du monde, boîtes de collision, grille des tuiles, identifiants des entités, chemins des PNJ, graine aléatoire. |
| **Accès console** | En mode debug : `window.surshim = { game, loop, parameters }`. |
| **Contrôle du temps** | `P` pause, `N` un tick, `+`/`-` vitesse ; plus tard : avancer l'heure, passer au lendemain. |
| **Journal** | `logger.debug/info/warn/error(module, message, data)` ; niveau réglé par `?log=debug`. Aucun `console.log` dans le code livré. |
| **Reproductibilité** | `?seed=1234` force la graine ; une sauvegarde exportée en JSON permet de rejouer un bug dans un test. |
| **Débogage des tests** | Configurations « Tests » de `.vscode/launch.json`, ou `node --inspect-brk --test …`. |

Méthode pour un bug : reproduire (graine ou sauvegarde) → écrire un test qui échoue → corriger → le test reste dans la suite.

---

## 14. Workflow de développement

1. **Concevoir** : discuter le concept dans `docs/GAME_DESIGN.md` jusqu'à `VALIDÉ`.
2. **Spécifier** : écrire les règles dans `docs/SPECIFICATION.md` ; les questions vont en partie E ; une règle `À CONFIRMER` n'est **jamais** implémentée.
3. **Tester** : écrire les tests de `tests/spec/` et les tests unitaires — ils échouent.
4. **Implémenter** dans `src/core/` jusqu'à ce que les tests passent.
5. **Afficher** : rendu, animation et interface dans `src/presentation/`.
6. **Vérifier** dans le navigateur (`npm run serve`), en mode debug si nécessaire.
7. **Contrôler** : `npm run check`.
8. **Commiter** : petits commits, message à l'impératif en français (`Ajoute le glissement le long des obstacles (R-MON-COL-002)`).

Toute décision structurante (bibliothèque, format de carte, format de sauvegarde, entorse à ce document) est consignée dans `docs/decisions/NNNN-titre.md`.

---

## 15. Checklist avant commit

- [ ] `npm run check` passe.
- [ ] Aucun accès DOM / canvas / image / temps réel / aléatoire non injecté / stockage dans `src/core/`.
- [ ] Aucune règle métier dans `src/presentation/` (la présentation passe par des commandes et des intentions).
- [ ] Nouvelle règle → identifiant dans la spécification, concept cité, test associé.
- [ ] Nouveaux paramètres → partie C de la spécification et `data/gameParameters.js`.
- [ ] Nouveau contenu → dans `data/`, validé par un test (références croisées comprises).
- [ ] Nouvelle image ou son → dans `assets/`, kebab-case, référencé dans `assets/ASSETS.md` avec sa licence.
- [ ] État toujours sérialisable (pas de fonction ni de référence circulaire dans `GameState`).
- [ ] Aucun nombre magique, aucun `console.log`, aucun code commenté. JSDoc à jour.
