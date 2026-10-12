# Surshim — Spécification globale (game design)

| Version courante | Date | Statut du document |
|---|---|---|
| **v0.12** | 2026-10-12 | Brouillon — la recherche : expérience, niveaux, livres de recherche, premiers plans |

> *Surshim* est un nom de travail.

Ce document décrit **la vision et les concepts** du jeu : ce qu'on veut faire ressentir au joueur, les grandes boucles de jeu et les systèmes. Il ne contient pas de règle chiffrée : les règles précises et testables sont dans [SPECIFICATION.md](SPECIFICATION.md) (spécification détaillée).

---

## Sommaire

0. [Mode d'emploi](#0-mode-demploi)
1. [Pitch](#1-pitch)
2. [Inspirations](#2-inspirations)
3. [Piliers](#3-piliers)
4. [Univers et récit](#4-univers-et-récit)
5. [Boucles de jeu](#5-boucles-de-jeu)
6. [Concepts par thème](#6-concepts-par-thème)
7. [Direction artistique](#7-direction-artistique)
8. [Difficulté](#8-difficulté)
9. [Feuille de route](#9-feuille-de-route)
10. [Questions ouvertes](#10-questions-ouvertes)
11. [Journal](#11-journal)

---

## 0. Mode d'emploi

### 0.1 Deux niveaux de spécification

| Document | Contenu | Granularité | Exemple |
|---|---|---|---|
| **Spécification globale** (ce document) | Vision, piliers, boucles, concepts | Un concept = une idée de game design | `C-MEN-02` · Les raids sont annoncés |
| **Spécification détaillée** ([SPECIFICATION.md](SPECIFICATION.md)) | Règles du jeu chiffrées, avec exemples | Une règle = un comportement testable | `R-MEN-RAI-001` · Délai d'annonce d'un raid |

Un concept est **décliné** en une ou plusieurs règles détaillées. Une règle cite, dans ses notes, le concept dont elle découle. Les **codes de thème** (3 lettres : `JOU`, `MON`, `CBT`…) sont les mêmes dans les deux documents.

### 0.2 Identifiant et statut d'un concept

Format : **`C-<THÈME>-<NN>`** — par exemple `C-VIL-03`. Comme pour les règles, un identifiant est définitif et n'est jamais réutilisé.

| Statut | Signification |
|---|---|
| `PROPOSÉ` | Idée en discussion. Rien n'est spécifié en détail. |
| `VALIDÉ` | Retenu. Peut être décliné en règles dans la spécification détaillée. |
| `DÉCLINÉ` | Validé et entièrement décrit par des règles (lesquelles sont citées). |
| `REPORTÉ` | Bonne idée, mais pas avant une version ultérieure. |
| `ÉCARTÉ` | Abandonné. Reste dans le document, barré, avec la raison. |

Toute évolution d'un concept est notée dans le journal (§ 11).

---

## 1. Pitch

> **Un RPG 2D en pixel art, vu de dessus, où l'on rebâtit un village dans une vallée envahie par une horde de monstres. Le jour, on cultive, on récolte, on construit et on accueille des survivants ; la nuit et les jours de raid, on défend ce qu'on a bâti. Pas à pas, on repousse la Flétrissure et la vallée reprend vie.**

- **Genre** : simulation de vie cosy (*Stardew Valley*) × survie et défense de base (*Dragon Quest Builders*, *Necesse*, *Kingdom*).
- **Vue** : de dessus, perspective « trois-quarts » des RPG 16 bits (*Zelda: A Link to the Past*, *Secret of Mana*), tuiles de 32 px.
- **Joueurs** : solo.
- **Plateforme** : navigateur (canvas 2D), clavier d'abord, manette ensuite.
- **Sensation recherchée** : « J'ai un foyer chaleureux à protéger, et chaque jour il devient un peu plus beau. »

---

## 2. Inspirations

### 2.1 Jeux de référence

| Jeu | Ce qu'il fait bien | Ce qu'on retient | Ce qu'on évite |
|---|---|---|---|
| **Stardew Valley** | Rythme d'une journée, énergie, saisons, relations avec les habitants, plaisir de l'optimisation douce | Structure jour → nuit → sommeil → sauvegarde ; cultures liées aux saisons ; affinité avec les villageois | Absence de menace sur la ferme : chez nous, le monde extérieur pèse sur le village |
| **Rune Factory** | Farming + combat RPG dans le même jeu ; les monstres domptés travaillent à la ferme | Le combat et la vie paysanne partagent les mêmes ressources ; (plus tard) apprivoiser des monstres | Les longues phases de donjon déconnectées du village |
| **Dragon Quest Builders** | Reconstruire une civilisation détruite ; le village monte de niveau ; les monstres attaquent la base | **Niveau du village** calculé à partir de ce qui est construit ; raids de monstres pour gêner la reconstruction ; survivants qui rejoignent la ville | Construction en blocs 3D ; monstres « injustes » demandant une exécution parfaite |
| **Necesse** | Colons recrutés, nourris et logés, qui prennent des métiers ; raids sur la colonie | Villageois avec **métiers** et **besoins** (nourriture, logement) ; zones de défense ; coffres dédiés | Villageois si efficaces qu'ils rendent l'exploration inutile |
| **Kingdom Two Crowns** | Pression nocturne lisible : le jour on bâtit, la nuit la menace arrive ; défenses en couches | **Nuit dangereuse**, menace qui croît avec le temps, murs et archers comme défense | Le contrôle indirect et la perte totale de la partie |
| **Don't Starve** | Tension de survie, la nuit comme danger réel | Le feu / la lumière comme zone de sécurité ; la **faim** comme pression de fond | La difficulté punitive ; une faim qui descend si vite qu'on ne fait plus que manger |
| **Valheim** | Mécanique de **confort** : une maison agréable donne un bonus de repos | Le **confort** du foyer récompense l'aménagement « cosy » par un effet en jeu | — |
| **Graveyard Keeper / Moonlighter** | Boucle « aller chercher dehors → transformer chez soi » | Les ressources rares viennent des zones dangereuses | Les arbres de technologie opaques |
| **Cult of the Lamb** | Alternance base / expéditions, ton mignon sur fond sombre | Le **contraste** cosy / inquiétant dans la direction artistique | — |
| **Forager** | Débloquer la carte zone par zone, sensation de progression constante | Carte en **zones** qu'on reconquiert une par une | Le rythme frénétique |
| **Zelda: A Link to the Past** | Combat d'action lisible en vue de dessus, carte découpée en zones | Combat simple : attaque, esquive, objets ; ennemis qui annoncent leurs attaques | — |

D'autres jeux du même créneau sont des sources d'idées : *Astra Village* (restaurer un village en ruine, monstres hors du village), *Phoenix Hope* et *Craft Hero* (bâtir le jour, défendre la nuit), *Sun Haven*, *Core Keeper*, *Len's Island*, *Bellwright*.

### 2.2 Ce que montre ce panorama

1. Le créneau « cosy + menace » est occupé surtout par des jeux **3D** ou **en vue de côté**. En **vue de dessus 16 bits**, le mélange *Stardew* + défense de village est plus rare : c'est notre angle.
2. Les jeux qui réussissent ce mélange gardent la menace **prévisible** (la nuit, des raids annoncés) : le joueur planifie au lieu de subir.
3. La menace doit **grandir avec le village** (prospérité, *Kingdom*) pour que la défense reste un sujet sans écraser le joueur au début.
4. La reconstruction motive quand elle est **visible** : la carte change, le village s'agrandit, des visages connus reviennent (*Dragon Quest Builders*).
5. Les villageois trop autonomes **vident** le jeu du joueur (critique récurrente de *Necesse*) : ils doivent assister, pas remplacer.

---

## 3. Piliers

Tout concept doit servir au moins un pilier et n'en contredire aucun.

| # | Pilier | Ce que ça veut dire | Ce que ça exclut |
|---|---|---|---|
| **P1** | **Un foyer chaleureux** | Le village est un refuge. L'aménager, le décorer, y accueillir des gens est un plaisir en soi et apporte un bénéfice en jeu (confort). | Une base purement utilitaire ; une mort qui détruit tout. |
| **P2** | **Une menace juste** | Le danger est réel mais **lisible et annoncé** : nuit, raids prévus quelques jours avant, zones repérables, jauges de faim et d'énergie qu'on voit venir. Le joueur perd des ressources ou du temps, rarement tout. | Les attaques surprises imparables ; une faim si rapide qu'elle oblige à manger toutes les deux minutes. |
| **P3** | **Une reconquête visible** | Chaque zone reprise change la carte (couleurs, faune, musique), ramène des survivants et débloque des recettes. | Une progression purement chiffrée, invisible à l'écran. |
| **P4** | **Le charme des consoles 16 bits** | Pixel art à tuiles, personnages animés, commandes simples et réactives, interface sobre. | Le réalisme ; les menus surchargés. |

---

## 4. Univers et récit

| ID | Concept | Statut |
|---|---|---|
| `C-UNI-01` | La vallée de **Shimrod**, jadis prospère, a été submergée par **la Horde** : orques, gobelins, bêtes corrompues et pire encore. | PROPOSÉ |
| `C-UNI-02` | La Horde répand **la Flétrissure** : une corruption qui assombrit la terre, tue les cultures et rend les animaux hostiles. | PROPOSÉ |
| `C-UNI-03` | Le héros (ou l'héroïne, au choix) arrive seul dans une clairière où brûle encore un **Foyer** ancien : un feu que la Flétrissure ne peut éteindre. C'est le point de départ du village. | PROPOSÉ |
| `C-UNI-04` | Les survivants dispersés (fermière, forgeron, cuisinière, garde, érudit…) apportent chacun une compétence, un fragment d'histoire et une quête. | PROPOSÉ |
| `C-UNI-05` | Un **mystère** se dévoile au fil de la reconquête : d'où vient la Horde, et que garde-t-elle au cœur de la vallée ? | PROPOSÉ |
| `C-UNI-06` | **Un début cosy** : le joueur s'éveille dans **le Vallon**, un coin de la vallée resté préservé, loin des monstres. Les premières heures sont calmes : marcher, récolter, rencontrer quelques habitants, explorer. La menace se découvre peu à peu, en s'éloignant. | VALIDÉ |

Ton : chaleureux et un peu mélancolique, avec de l'humour dans les dialogues. Les monstres sont menaçants mais pas gore.

---

## 5. Boucles de jeu

### 5.1 Trois échelles de temps

```
 ┌─ Seconde à minute ─────────────────────────────────────────────────────────┐
 │  se déplacer → utiliser un outil / frapper → ramasser → ranger              │
 └─────────────────────────────────────────────────────────────────────────────┘
 ┌─ Journée de jeu (~12 min réelles) ─────────────────────────────────────────┐
 │  Matin : arroser, récolter, donner les consignes aux villageois             │
 │  Journée : explorer une zone, récolter, combattre, rapporter                │
 │  Soir : fabriquer, construire, cuisiner, parler aux villageois              │
 │  Nuit : les monstres sortent — rester au village et défendre, ou dormir     │
 │  Sommeil : bilan de la journée, croissance des cultures, sauvegarde         │
 └─────────────────────────────────────────────────────────────────────────────┘
 ┌─ Semaine / saison ─────────────────────────────────────────────────────────┐
 │  préparer le prochain raid annoncé → le repousser → reprendre une zone      │
 │  → accueillir de nouveaux survivants → débloquer bâtiments et recettes      │
 │  → le niveau du village monte → la Horde envoie des raids plus forts        │
 └─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 La tension cosy / survie

Le jeu alterne **respiration** et **pression** :

| Respiration (cosy) | Pression (survie) |
|---|---|
| Matin et journée au village | Nuit hors de la lumière du Foyer |
| Zones reconquises | Zones flétries |
| Jours ordinaires | Nuits de raid annoncées |
| Cultiver, décorer, discuter | Combattre, réparer, rationner |

La pression est **choisie** la plupart du temps (partir explorer une zone flétrie) et **annoncée** le reste du temps (raids). Le joueur peut toujours passer une journée entièrement cosy ; il prendra simplement du retard sur la Horde.

---

## 6. Concepts par thème

Les codes de thème servent aussi dans la spécification détaillée.

### 6.1 JOU — Joueur

| ID | Concept | Statut |
|---|---|---|
| `C-JOU-01` | Le joueur dirige un seul personnage, vu de dessus, qui se déplace librement (pas case par case) en 8 directions et fait face à l'une des 4 directions. | VALIDÉ (Q1 de la spécification détaillée) |
| `C-JOU-02` | Trois jauges : **PV** (santé), **Faim** et **Énergie**. | VALIDÉ (G2) |
| `C-JOU-03` | Le personnage interagit avec ce qui est **devant lui** (la case qu'il regarde) : outil, porte, villageois, coffre. | PROPOSÉ |
| `C-JOU-04` | Compétences qui progressent par la pratique (agriculture, récolte, combat, artisanat), à la *Stardew*. | REPORTÉ |
| `C-JOU-05` | **Faim** : la jauge de faim baisse avec le temps, plus vite quand on travaille ou combat ; manger la remonte. Rassasié, le joueur récupère ses PV et son énergie ; affamé, il ne les récupère plus, puis **perd lentement des PV**. Rythme visé : deux à trois repas par journée de jeu. | VALIDÉ (G12) |
| `C-JOU-06` | **Énergie, rempart contre la Flétrissure** : dans une zone flétrie (et la nuit hors de la lumière), la Flétrissure ronge l'énergie du joueur. Tant qu'il lui reste de l'énergie, il est protégé ; à zéro, la Flétrissure l'atteint : PV qui baissent, coups plus faibles. L'énergie se recharge en dormant, en mangeant et près du Foyer. L'énergie fixe ainsi la **durée d'une expédition** en zone flétrie. Elle ne sert **que** contre la Flétrissure. | VALIDÉ (G13, G14) |
| `C-JOU-10` | **Faim et santé en v0.8** : la faim baisse d'environ 40 par journée (deux à trois repas) ; rassasié, on récupère des PV ; affamé, on en perd lentement. L'énergie (C-JOU-06) attendra la Flétrissure. | VALIDÉ — v0.8 (précise C-JOU-02, C-JOU-05) |
| `C-JOU-09` | **Expérience** : le joueur gagne des points d'expérience en jouant (récolter, fouiller, fabriquer, découvrir un lieu) et en accomplissant des quêtes, affichés en permanence. Des **niveaux**, de plus en plus espacés, donnent chacun un point de recherche (C-TEC-03). Plus tard : niveaux requis pour certaines compétences. | VALIDÉ — compteur en v0.6, niveaux en v0.9 |
| `C-JOU-07` | *Hypothèse à tester* : l'énergie sert aussi d'endurance (esquive, travail). Risque : rendre le jeu trop dur ; à n'essayer qu'une fois la Flétrissure jouable. | PROPOSÉ — hypothèse (G13) |
| `C-JOU-08` | **La lumière protège** : à la lumière du Foyer, des braseros et des torches, la Flétrissure ne ronge plus l'énergie. Poser des braseros permet d'avancer en zone flétrie par points d'appui. | VALIDÉ (G14) |

### 6.2 MON — Monde

| ID | Concept | Statut |
|---|---|---|
| `C-MON-01` | Le monde est une carte à **tuiles** organisée en **zones** (clairière du Foyer, bois, marais, collines, mines, ruines de la cité, forteresse de la Horde). | PROPOSÉ |
| `C-MON-02` | **Cycle jour / nuit** : de 6 h à 2 h du matin, une journée de jeu dure 12 minutes réelles ; l'heure s'affiche par tranches de 10 minutes de jeu ; la lumière baisse le soir. Tant qu'on ne dort pas (v0.8), l'horloge tourne en continu sur 24 h. | VALIDÉ (G3) — v0.7 |
| `C-MON-11` | **La nuit, sans danger pour l'instant** : on y voit moins loin, un halo de lumière entoure le héros et les feux. Les dangers de la nuit (Flétrissure, monstres) viendront plus tard. | VALIDÉ — v0.7 |
| `C-MON-03` | **Saisons** qui changent les cultures possibles, l'apparence de la carte et les monstres. | PROPOSÉ — cf. G4 |
| `C-MON-04` | Le **Foyer** éclaire un rayon autour de lui. Dans la lumière, les monstres ordinaires n'entrent pas ; les raids, eux, viennent l'attaquer. Le rayon grandit avec le niveau du village. | PROPOSÉ |
| `C-MON-05` | Météo (pluie qui arrose les cultures, orage, brouillard qui réduit la vue). | REPORTÉ |
| `C-MON-06` | **Exploration** : la vallée est une grande carte d'un seul tenant, avec des **lieux nommés** à découvrir (vallon, lac, collines, ruines…). Entrer dans un lieu le **découvre** : son nom s'affiche et il entre au journal. | VALIDÉ |
| `C-MON-07` | **Ruines** : vestiges de l'ancienne civilisation (tour de guet, chapelle, hameau). On y trouvera des **livres** (plans de recherche, C-TEC-03), des fragments d'histoire et des ressources rares. | VALIDÉ — les ruines existent en v0.3, leur contenu vient ensuite |
| `C-MON-08` | Au-delà des bords de la vallée, une **forêt dense** infranchissable. | VALIDÉ (Q15 de la spécification détaillée) |
| `C-MON-09` | **Fouiller** : dans les ruines, certains éléments (bibliothèques, coffres, caisses, sacs) se fouillent, une seule fois. Une fouille rapporte ce que l'élément contient : au plus **deux livres**, et parfois des **matériaux** (silex, branches, fibres…). | VALIDÉ |
| `C-MON-10` | Les cartes seront dessinées à la main dans un **éditeur de cartes (Tiled)**, quand la vallée sera stabilisée. | VALIDÉ (Q17) — plus tard |

### 6.3 RES — Ressources et récolte

| ID | Concept | Statut |
|---|---|---|
| `C-RES-01` | Ressources de base récoltées avec des outils : bois (hache), pierre et minerai (pioche), fibres et baies (à la main). | PROPOSÉ |
| `C-RES-02` | Les ressources se renouvellent : arbres qui repoussent, filons qui réapparaissent dans les mines. | PROPOSÉ |
| `C-RES-03` | Les ressources rares sont dans les zones flétries et sur les monstres. | PROPOSÉ |
| `C-RES-04` | **Trois façons de récolter** : **ramasser** à la main (fleurs, branches, cailloux, silex, baies, champignons), **couper** à la hache (arbres → bois), **piocher** à la pioche (rochers → pierre, filons → minerais). | VALIDÉ — outils exigés en v0.5 |
| `C-RES-09` | **Cueillette** : des buissons à baies et des champignons se ramassent à la main, puis repoussent ; c'est la première nourriture. La cuisine viendra plus tard (C-ART-03). | VALIDÉ — v0.8 |
| `C-RES-08` | **Progression par les outils** : au départ, on ne peut que ramasser. Les premiers matériaux (silex, branches, fibres) se trouvent dans les ruines ; ils permettent de fabriquer la hache et la pioche, qui ouvrent le bois et la pierre, puis la suite. | VALIDÉ |
| `C-RES-05` | **Matériaux des outils** : silex < cuivre < fer < acier < métal ancien. Certaines ressources exigent un outil d'un matériau minimal (piocher un filon de fer demande une pioche en cuivre). Un meilleur outil récolte plus vite ou davantage. | PROPOSÉ — en v0.9, seul « un meilleur outil récolte davantage » est validé (outils en pierre, sac du cueilleur) |
| `C-RES-06` | **Ressources de départ** : bois, pierre, branche, silex, fibre végétale, fleurs. Puis : minerais, herbes médicinales, plantes rares des zones flétries. | VALIDÉ — silex, branches et fibres arrivent en v0.4 par la fouille |
| `C-RES-07` | Les arbres repoussent depuis leur souche au bout de quelques jours ; les rochers et les filons réapparaissent ailleurs. | VALIDÉ (Q14) — les arbres en v0.7 (3 jours), les rochers plus tard |

### 6.4 INV — Inventaire et objets

| ID | Concept | Statut |
|---|---|---|
| `C-INV-01` | Sac à emplacements limités, objets empilables, barre d'accès rapide pour les outils. | PROPOSÉ |
| `C-INV-02` | Coffres au village ; un coffre peut être réservé à une catégorie pour que les villageois y rangent leur production. | PROPOSÉ |
| `C-INV-03` | **Fenêtre d'inventaire** (touche I) : les ressources, les **outils** possédés et les **livres** trouvés, que l'on peut **lire**. Sans limite de place pour l'instant (C-INV-01 viendra plus tard). | VALIDÉ |
| `C-INV-04` | **Outils** : un outil possédé sert tant qu'on l'a ; on n'en garde qu'un de chaque sorte. Pas d'usure pour l'instant. | VALIDÉ |

### 6.5 ART — Artisanat

| ID | Concept | Statut |
|---|---|---|
| `C-ART-01` | Recettes fabriquées sur des **établis** (établi, forge, fourneau, métier à tisser). Une recette = ingrédients + établi + durée. | PROPOSÉ |
| `C-ART-02` | Les recettes se débloquent en reprenant des zones et en accueillant des survivants (le forgeron apporte la forge). | PROPOSÉ |
| `C-ART-03` | Cuisine : les plats rendent de l'énergie et donnent des bonus temporaires (vitesse, défense, rendement). | PROPOSÉ |
| `C-ART-08` | **Cuisiner au feu de camp** : certaines recettes ne se fabriquent qu'à côté d'un feu allumé ; d'abord les champignons grillés, plus nourrissants que crus. | VALIDÉ — v0.9 |
| `C-ART-04` | **Premier artisanat, à la main**, sans établi : une **hache en silex** (silex, branches, fibres), une **pioche en silex**, un **feu de camp** (pierres + bois). C'est le premier pas avant la recherche. On ne fabrique que les recettes **apprises** (C-TEC-07). | VALIDÉ — hache et pioche en v0.5 ; le feu de camp attend C-ART-05 |
| `C-ART-06` | **Fenêtre d'artisanat** (touche C) : les recettes apprises, ce qu'elles demandent (possédé / requis) et un bouton **Fabriquer**. | VALIDÉ |
| `C-ART-05` | Le **feu de camp** est la première source de lumière que le joueur fabrique (pierres et bois) : posé au sol, il éclaire la nuit ; il brûle une dizaine d'heures puis s'éteint, et se ravive avec du bois. Plus tard : il protège de la Flétrissure (C-JOU-08) et permet de cuire. | VALIDÉ — v0.7 (lumière et combustible) |
| `C-ART-07` | **Objets à poser** : certaines recettes (le feu de camp) donnent un objet qu'on garde dans l'inventaire, puis qu'on **pose** sur la tuile devant le héros. | VALIDÉ — v0.7 |

### 6.6 CON — Construction

| ID | Concept | Statut |
|---|---|---|
| `C-CON-01` | Construction sur la grille de tuiles, à partir de **plans** : maison, champ, enclos, établis, murs, palissades, portes, tours de guet. | PROPOSÉ |
| `C-CON-02` | Une construction se pose en chantier, puis se termine en apportant les matériaux (le joueur ou les villageois). | PROPOSÉ |
| `C-CON-03` | Les bâtiments ont des PV : les raids les abîment, on les **répare** (rien n'est détruit définitivement). | PROPOSÉ — pilier P1 |
| `C-CON-04` | **Décoration** : objets décoratifs qui augmentent le **confort** d'une maison. | PROPOSÉ |

### 6.7 AGR — Agriculture et élevage

| ID | Concept | Statut |
|---|---|---|
| `C-AGR-01` | Labourer → semer → arroser chaque jour → récolter. Une culture pousse d'un stade à chaque nuit où elle a été arrosée. | PROPOSÉ |
| `C-AGR-02` | Chaque culture a sa ou ses saisons ; hors saison, elle fane. | PROPOSÉ — cf. G4 |
| `C-AGR-03` | La Flétrissure empêche toute culture tant qu'une zone n'est pas purifiée. | PROPOSÉ |
| `C-AGR-04` | Élevage (poules, chèvres…) et, plus tard, monstres apprivoisés au travail (*Rune Factory*). | REPORTÉ |

### 6.8 VIL — Villageois

| ID | Concept | Statut |
|---|---|---|
| `C-VIL-01` | Des **survivants** sont trouvés dans les zones (souvent prisonniers d'un camp de la Horde) ; ils rejoignent le village s'il y a un **lit libre** pour eux. | PROPOSÉ |
| `C-VIL-02` | Chaque villageois a un **métier** choisi par le joueur (fermier, bûcheron, garde, cuisinier, forgeron…) et le pratique pendant la journée. | PROPOSÉ |
| `C-VIL-03` | Les villageois ont des **besoins** simples : manger chaque jour et dormir dans une maison. Un villageois mal nourri ou mal logé travaille moins bien, mais ne meurt pas et ne part pas. | PROPOSÉ — pilier P1 |
| `C-VIL-04` | **Affinité** : parler, offrir des cadeaux et accomplir leurs quêtes fait grandir la relation et débloque bonus, recettes et dialogues. | PROPOSÉ |
| `C-VIL-05` | Les villageois **assistent** le joueur sans le remplacer : leur rendement reste inférieur au sien, et les tâches rares (explorer, purifier) restent au joueur. | PROPOSÉ — leçon de *Necesse* |
| `C-VIL-06` | Pendant un raid, les gardes défendent ; les autres villageois se mettent à l'abri. | PROPOSÉ |
| `C-VIL-07` | **Personnages non joueurs (PNJ)** rencontrés en explorant : un ermite, une pêcheuse, un vieux soldat… On leur **parle** ; ils racontent la vallée et donnent des **indices** sur des ruines à visiter. Plus tard, certains rejoignent le village (C-VIL-01). | VALIDÉ |
| `C-VIL-08` | Les PNJ **se déplacent** : petites promenades, puis une routine selon l'heure (travail, repas, sommeil). | VALIDÉ (Q18) — promenades en v0.8, routine plus tard |
| `C-VIL-09` | **Quêtes** : un PNJ confie une quête au fil d'un dialogue (rapporter la poupée de chiffon bleue de la fille de Maëlle) ; le journal la suit ; l'objet se trouve en explorant (la poupée est dans un coffre des ruines) ; on le rend au PNJ avec un bouton **Donner**, il remercie et récompense — d'abord en **expérience** (C-JOU-09), plus tard en objets, recettes ou indices. | VALIDÉ — v0.6 |

### 6.9 CBT — Combat

| ID | Concept | Statut |
|---|---|---|
| `C-CBT-01` | Combat d'action en temps réel, à la *Zelda* : attaque dans la direction regardée, **esquive** (roulade). | VALIDÉ (G5) |
| `C-CBT-02` | Armes de mêlée (épée, lance) et à distance (fronde, arc) ; les outils peuvent servir d'armes faibles. | PROPOSÉ |
| `C-CBT-03` | Les ennemis **annoncent** leurs attaques (posture, clignotement) : un joueur attentif peut toujours esquiver. | PROPOSÉ — pilier P2 |
| `C-CBT-04` | Recul (*knockback*) et courte invulnérabilité après un coup reçu. | PROPOSÉ |

### 6.10 ENN — Ennemis

| ID | Concept | Statut |
|---|---|---|
| `C-ENN-01` | Familles de la Horde : **gobelins** (rapides, fragiles, en groupe), **orques** (lents, robustes), **bêtes flétries** (loups, sangliers corrompus), **chamans** (à distance, soignent les autres). | PROPOSÉ |
| `C-ENN-02` | Les monstres errent dans les zones flétries de jour ; la nuit, ils sont plus nombreux et s'aventurent jusqu'à la limite de la lumière du Foyer. | PROPOSÉ |
| `C-ENN-03` | Chaque zone a un **chef** à vaincre pour la reprendre. | PROPOSÉ |
| `C-ENN-04` | Une bête flétrie dans une zone purifiée redevient un animal neutre. | PROPOSÉ — pilier P3 |

### 6.11 MEN — Menace : Flétrissure et raids

C'est le cœur du « survival » : la pression qui donne du sens au village et à la défense.

| ID | Concept | Statut |
|---|---|---|
| `C-MEN-01` | Chaque zone flétrie a un **totem de la Horde** gardé par un camp. Détruire le totem **purifie** la zone : la carte reprend ses couleurs, les cultures y deviennent possibles, des survivants sont libérés. | PROPOSÉ |
| `C-MEN-02` | **Raids annoncés** : la Horde attaque le village lors de certaines nuits. Le raid est annoncé **plusieurs jours avant** (tambours lointains, lune rouge, message d'un éclaireur), avec sa direction d'arrivée. | PROPOSÉ — pilier P2 |
| `C-MEN-03` | La force des raids suit la **prospérité** du village (niveau du village, richesses stockées) et le nombre de jours écoulés : un village florissant attire la convoitise. | PROPOSÉ |
| `C-MEN-04` | **Défenses** : murs, palissades et portes ralentissent ; tours de guet tenues par des gardes ; pièges ; braseros qui éclairent. La défense d'un raid emprunte au *tower defense* (on prépare le terrain, puis on combat avec ses défenses). | PROPOSÉ |
| `C-MEN-05` | Un raid perdu **abîme** le village (bâtiments endommagés, cultures piétinées, une partie des stocks volés) mais ne le détruit pas ; le Foyer ne s'éteint jamais. | PROPOSÉ — pilier P1 |
| `C-MEN-06` | Les totems non détruits **se renforcent** avec le temps (camps plus gardés, monstres plus forts) : on peut prendre son temps, mais pas indéfiniment. | VALIDÉ (G6) |
| `C-MEN-07` | En mode Survie uniquement, la Flétrissure **reprend** une zone purifiée si un raid réussit. | VALIDÉ (G6) |
| `C-MEN-08` | **La sauge de l'aube** (nom provisoire) : une plante rare, qui pousse en lisière des zones flétries. Jetée dans un feu, elle dégage une fumée claire qui **purifie définitivement** les tuiles flétries autour du feu. On en cultive plus tard au village. | VALIDÉ (G17) |

### 6.12 PRO — Progression

| ID | Concept | Statut |
|---|---|---|
| `C-PRO-01` | **Niveau du village** calculé à partir des bâtiments, de la décoration, du nombre de villageois et de leur bien-être (*Dragon Quest Builders*). Il débloque des plans et agrandit le rayon du Foyer. | PROPOSÉ |
| `C-PRO-02` | **Confort** : une maison bien aménagée donne, au réveil, un bonus d'énergie maximale pour la journée (*Valheim*). | PROPOSÉ — pilier P1 |
| `C-PRO-03` | Outils et armes améliorables à la forge (cuivre → fer → acier → métal ancien). | PROPOSÉ |
| `C-PRO-04` | La partie a une **fin** (purifier le cœur de la vallée), puis on peut continuer à jouer librement. | PROPOSÉ |

### 6.13 ECO — Économie et commerce

| ID | Concept | Statut |
|---|---|---|
| `C-ECO-01` | Au début, pas de monnaie : on troque et on fabrique. | PROPOSÉ — cf. G7 |
| `C-ECO-02` | Une **caravane de marchands** passe chaque semaine dès que la route du village est sûre ; on y vend sa production et on y achète graines et objets rares. | PROPOSÉ |

### 6.14 SAU — Sauvegarde, mort et fin de journée

| ID | Concept | Statut |
|---|---|---|
| `C-SAU-01` | Sauvegarde automatique à chaque coucher, comme dans *Stardew Valley* ; au lancement, la partie sauvegardée reprend ; « Nouvelle partie » recommence, après confirmation. | VALIDÉ — v0.8 |
| `C-SAU-03` | **Dormir près d'un feu allumé**, à partir du soir : on se réveille le lendemain à 6:00, reposé (PV au maximum) et un peu affamé. Pas de coucher obligatoire pour l'instant. | VALIDÉ — v0.8 |
| `C-SAU-04` | **S'évanouir** à 0 PV : le héros se réveille au matin suivant dans le Vallon, sans rien perdre (version douce de C-SAU-02). | VALIDÉ — v0.8 |
| `C-SAU-02` | Si le joueur tombe à 0 PV ou ne dort pas avant 2 h du matin, il se réveille le lendemain au Foyer, en ayant perdu une partie des objets portés. | PROPOSÉ — cf. G8 |

### 6.15 IHM — Interface

| ID | Concept | Statut |
|---|---|---|
| `C-IHM-01` | HUD minimal : PV, énergie, heure et jour, barre d'outils, annonce du prochain raid. | PROPOSÉ |
| `C-IHM-02` | Caméra qui suit le joueur. | VALIDÉ — précisé par C-IHM-07 (toujours centrée) |
| `C-IHM-03` | Boîtes de dialogue à l'ancienne (portrait + texte qui défile). | PROPOSÉ |
| `C-IHM-04` | Commandes : déplacement (flèches / ZQSD), action, utiliser l'objet, esquive, inventaire. Remappables. | PROPOSÉ |
| `C-IHM-05` | **Inspection** : un clic sur un élément du décor (arbre, rocher, fleurs…) ouvre une fenêtre d'information : son nom, ce qu'on peut en faire, ce qu'il rapporte, et un bouton **Récolter**. D'abord simple ; plus tard : description, outil requis, état (repousse). | VALIDÉ — décliné en v0.2 |
| `C-IHM-06` | **Inventaire** affiché en permanence (ressources et quantités, avec leur icône). | VALIDÉ — décliné en v0.2 |
| `C-IHM-07` | La caméra garde **toujours le joueur au centre de l'écran** : le décor défile autour de lui. L'affichage s'adapte à la taille de chaque écran. | VALIDÉ — décliné en v0.2 |
| `C-IHM-08` | **Dialogues** à l'ancienne : une boîte en bas de l'écran avec le nom de celui qui parle et son texte, page par page. | VALIDÉ |
| `C-IHM-09` | **Journal** : les **quêtes**, la liste des lieux découverts et des **indices** reçus (qui l'a dit, ce qu'il a dit), pour savoir où aller. Les livres se lisent dans l'inventaire, pas au journal. | VALIDÉ |
| `C-IHM-10` | **Notifications** au-dessus du héros, là où le regard se porte, chacune avec une croix : « Lieu découvert », le nom du lieu à chaque retour, « Nouvel indice », « Trouvé : … » (une seule par fouille). Celles des quêtes restent jusqu'à ce qu'on les ferme. | VALIDÉ |
| `C-IHM-11` | **Atlas d'icônes** : chaque objet, ressource et livre a une icône tirée de la planche d'icônes (24 px). | VALIDÉ |
| `C-IHM-12` | Les **fenêtres** (information, inventaire, lecture, artisanat) s'ouvrent **au milieu de l'écran**, près du héros, et se ferment par × ou Échap. Une seule fenêtre, journal compris, est ouverte à la fois. | VALIDÉ |
| `C-IHM-15` | **Jauges** de santé (PV) et de faim au bandeau ; un bouton « Manger » sur la nourriture de l'inventaire ; une fenêtre « Partie » (sauvegarde, nouvelle partie). | VALIDÉ — v0.8 |
| `C-IHM-14` | **Horloge** au bandeau : le jour et l'heure (« Jour 1 · 6:00 »). | VALIDÉ — v0.7 |
| `C-IHM-13` | **Barre d'actions** verticale, à gauche sous le bandeau : une icône par fenêtre (inventaire, artisanat, journal). Survoler une icône affiche son nom et sa touche ; un clic ouvre ou ferme la fenêtre. On n'a pas à connaître les touches. | VALIDÉ |

### 6.16 TEC — Recherche et technologies

Inspiré des *engrammes* d'*ARK: Survival Evolved* : on ne sait pas tout faire d'emblée, on **découvre** des plans. La recherche est le fil de la progression et l'occasion de **choix** : on ne peut pas tout apprendre en même temps.

| ID | Concept | Statut |
|---|---|---|
| `C-TEC-01` | **Arbre de recherche** : des **plans** (blueprints) se débloquent avec des **points de recherche** ; chaque plan apprend une ou plusieurs recettes d'artisanat ou de construction. Une fenêtre « Recherche » présente l'arbre. | VALIDÉ |
| `C-TEC-02` | **Branches** de l'arbre, dans un monde médiéval fantastique : **Survie** (outils, feu, abris, cuisine), **Armes et armures** (hache, épée, arc, bouclier), **Habitat** (maisons, mobilier, confort), **Agriculture et élevage**, **Défense** (palissades, tours, pièges), **Magie** (runes, alchimie, purification de la Flétrissure), **Commandement** (gestion du village, métiers, leadership, ordres aux villageois). | PROPOSÉ |
| `C-TEC-03` | Les **points de recherche** se gagnent par l'**expérience** (niveaux du personnage). Les **plans** eux-mêmes se **découvrent dans des livres** trouvés en explorant (ruines, bibliothèques, PNJ) : un plan n'est recherchable que si on a trouvé le livre qui le décrit. | VALIDÉ (G15) |
| `C-TEC-04` | Un plan exige des **prérequis** : plans précédents de sa branche, matériau déjà découvert (on ne recherche pas la hache en fer avant d'avoir trouvé du fer), parfois un bâtiment ou un villageois. | VALIDÉ — en v0.9, seulement « plan précédent » (la hache en pierre demande la hache en silex) ; le reste plus tard |
| `C-TEC-08` | **Livres de recherche** : lire un livre de recherche **découvre** ses plans ; on les apprend ensuite dans la fenêtre « Recherche » avec des points de recherche (1 point par plan pour commencer). | VALIDÉ — v0.9 |
| `C-TEC-09` | **Premiers plans de recherche** (branche Survie) : outils en pierre (meilleur rendement), sac du cueilleur (cueillette plus riche), champignons grillés (cuits au feu de camp, plus nourrissants). | VALIDÉ — v0.9 |
| `C-TEC-06` | **Livres** : chaque livre a un titre et un texte (souvent un fragment de l'histoire de la vallée) et décrit un ou plusieurs **plans**. On les relit au journal. | VALIDÉ |
| `C-TEC-05` | **Choix technologiques** : les points sont rares, on se spécialise d'abord (magie ou armes ? habitat ou défense ?) ; ce n'est qu'un **ordre de priorité**, tout reste accessible à terme. | VALIDÉ (G16) |
| `C-TEC-07` | **Livres de survie** : **lire** un livre de survie (tailler le silex, faire du feu…) **apprend** directement ses recettes, sans point de recherche. C'est le premier artisanat (C-ART-04). Les plans plus avancés passeront par la recherche (C-TEC-03). | VALIDÉ |

---

## 7. Direction artistique

| Aspect | Proposition | Statut |
|---|---|---|
| Perspective | Vue de dessus « trois-quarts » : on voit le dessus et la façade des objets ; les éléments sont dessinés du plus haut au plus bas de l'écran (tri en profondeur). | PROPOSÉ |
| Taille des tuiles | **32 × 32 px**, affichées sans agrandissement : l'écran de 1920 × 1080 montre 60 × 34 tuiles. | VALIDÉ (G1, Q12 de la spécification détaillée) |
| Personnages | Feuilles d'animation au format des RPG Maker : 4 directions (lignes bas, gauche, droite, haut) × 3 images, l'image du milieu étant la pose immobile. Plus tard : outil, attaque, esquive, coup reçu. | PROPOSÉ — modèle : `hero.png` fourni |
| Palette | Couleurs chaudes et saturées au village et dans les zones purifiées ; désaturées, violacées dans les zones flétries. La purification est un « retour de la couleur ». | PROPOSÉ |
| Lumière | Assombrissement progressif le soir, halos de lumière autour du Foyer, des braseros et des fenêtres. | PROPOSÉ |
| Musique | Thème doux de jour, ambiance nocturne, thème de raid. | PROPOSÉ |

Ressources graphiques : une planche de tuiles 32 px et un héros tirés de RPG Maker (`assets/images/`). La planche est cataloguée dans `data/tileset.js` (environ 260 sprites : sols, autotiles, plantes, arbres, rochers, minerais, cultures, objets, mobilier) ; on la parcourt dans `tools/catalog/`. Le jeu est personnel et non publié ; il faudra les remplacer avant toute diffusion (cf. `assets/ASSETS.md`).

---

## 8. Difficulté

| Mode | Raids | Mort | Pour qui |
|---|---|---|---|
| **Paisible** | Rares et faibles | Aucune perte d'objet | Joueurs venus pour le côté cosy |
| **Équilibré** (par défaut) | Selon C-MEN-03 | Perte partielle (C-SAU-02) | L'expérience prévue |
| **Survie** | Plus forts, plus fréquents | Perte de tout le sac ; Flétrissure qui avance (C-MEN-07) | Joueurs en quête de défi |

Statut : PROPOSÉ.

---

## 9. Feuille de route

Chaque version est **jouable** de bout en bout et ajoute une brique. Les versions sont spécifiées une par une dans la spécification détaillée.

| Version | Contenu | Concepts |
|---|---|---|
| v0.1 | **Livrée.** Se déplacer dans la clairière : carte à tuiles, personnage animé, collisions, caméra | C-JOU-01, C-MON-01, C-IHM-02 |
| v0.2 | **Livrée.** Récolter : inspecter un élément au clic, récolter bois, pierre, fleurs ; inventaire ; caméra toujours centrée ; affichage à la taille de l'écran | C-RES-04, C-IHM-05, C-IHM-06, C-IHM-07 |
| v0.3 | **Livrée.** Explorer : une grande vallée, le Vallon préservé au départ, des lieux et des ruines à découvrir, trois PNJ à qui parler et qui donnent des indices, un journal, une forêt dense autour | C-UNI-06, C-MON-06, C-MON-07, C-MON-08, C-VIL-07, C-IHM-08 à 10 |
| v0.4 | **Livrée.** Fouiller : bibliothèques, coffres et caisses des ruines ; deux livres à trouver (plans de la hache en silex et du feu de camp) ; silex, branches et fibres ; atlas d'icônes | C-MON-09, C-TEC-06, C-RES-06, C-IHM-11 |
| v0.5 | **Livrée.** Premier artisanat : fenêtre d'inventaire, lecture des livres de survie, recettes apprises, fenêtre d'artisanat, hache et pioche en silex, outils requis pour couper et piocher | C-INV-03, C-INV-04, C-TEC-07, C-ART-04, C-ART-06, C-RES-04, C-RES-08, C-IHM-12 |
| v0.6 | **Livrée.** Barre d'actions ; la première quête (la poupée de Maëlle) ; l'expérience | C-IHM-13, C-VIL-09, C-JOU-09 |
| v0.7 | **Livrée.** Le temps passe : jour / nuit et horloge, nuit sombre avec halos de lumière, feu de camp à poser et à raviver, repousse des arbres | C-MON-02, C-MON-11, C-IHM-14, C-ART-05, C-ART-07, C-RES-07 |
| v0.8 | **Livrée.** Vivre au rythme des jours : baies et champignons, faim et santé, s'évanouir, dormir près d'un feu, sauvegarde au coucher, PNJ qui se promènent | C-RES-09, C-JOU-02, C-JOU-05, C-JOU-10, C-SAU-01, C-SAU-03, C-SAU-04, C-VIL-08, C-IHM-15 |
| **v0.9** | **En cours.** La recherche : expérience gagnée en jouant, niveaux et points de recherche, livres de recherche, fenêtre « Recherche », outils en pierre, sac du cueilleur, champignons grillés au feu | C-JOU-09, C-TEC-01, C-TEC-03, C-TEC-04, C-TEC-05, C-TEC-08, C-TEC-09, C-ART-08 |
| v0.10 | Le Foyer, la Flétrissure et le premier monstre : lumière, énergie, sauge de l'aube, combat, mort | C-MON-04, C-JOU-06, C-MEN-08, C-CBT-01, C-SAU-02 |
| v0.11 | Construire : établi, palissade, maison | C-CON-01, C-CON-02, C-ART-01 |
| v0.12 | Cultiver ; le premier raid annoncé ; un PNJ rejoint le village ; la première zone reprise | C-AGR-01, C-MEN-02, C-MEN-04, C-VIL-01, C-MEN-01 |
| v1.0 | Une saison complète, 3 zones, 5 villageois, 1 chef, les branches Survie, Armes, Habitat et Magie de la recherche | — |

---

## 10. Questions ouvertes

Les réponses seront reportées dans les concepts concernés, qui passeront à `VALIDÉ`.

### 10.1 Questions ouvertes

| # | Question | Concepts | Proposition |
|---|---|---|---|
| G4 | Saisons : combien, et de combien de jours ? | C-MON-03, C-AGR-02 | 4 saisons de 14 jours |
| G7 | Une monnaie dès le début, ou seulement avec la caravane ? | C-ECO-01, C-ECO-02 | Avec la caravane |
| G8 | Que perd le joueur quand il tombe au combat ? | C-SAU-02 | Quelques objets du sac, au hasard ; jamais les outils |
| G9 | Héros imposé ou personnage créé par le joueur (apparence, prénom) ? | C-UNI-03 | Le héros fourni (`hero.png`), prénom choisi par le joueur |
| G10 | Carte d'un seul tenant qui défile, ou zones séparées avec transition ? | C-MON-01 | Zones séparées, chacune défilant, reliées par des passages |
| G11 | Le nom du jeu ? | — | *Surshim*, nom de travail |

### 10.2 Questions tranchées

| # | Question | Réponse | Concepts |
|---|---|---|---|
| G1 | Taille des tuiles ? | **32 × 32 px.** | § 7 |
| G2 | Faim ou seulement énergie ? | **Les deux** : la faim est importante (survie), et l'énergie sert à résister à la Flétrissure. | C-JOU-02, C-JOU-05, C-JOU-06 |
| G5 | Combat d'action en temps réel ? | **Oui.** | C-CBT-01 |
| G6 | La Flétrissure peut-elle reprendre des zones purifiées ? | **Oui, en mode Survie uniquement** ; en mode Équilibré, les totems se renforcent seulement. | C-MEN-06, C-MEN-07 |
| G12 | Que se passe-t-il quand la faim est à zéro ? | **Le joueur perd lentement des PV.** | C-JOU-05 |
| G13 | L'énergie sert-elle aussi d'endurance ? | **Non pour l'instant** : elle sert contre la Flétrissure. L'endurance reste une hypothèse (C-JOU-07), par crainte d'un jeu trop dur. | C-JOU-06, C-JOU-07 |
| G14 | La lumière protège-t-elle de la Flétrissure ? | **Oui.** | C-JOU-08 |
| G15 | Comment gagne-t-on des points de recherche ? | **Par l'expérience** ; et les **plans se découvrent dans des livres** trouvés en explorant. | C-TEC-03 |
| G16 | Les choix de recherche sont-ils définitifs ? | **Non, un ordre de priorité.** | C-TEC-05 |
| G17 | La sauge de l'aube protège-t-elle temporairement ou purifie-t-elle ? | **Elle purifie définitivement**, pour commencer. | C-MEN-08 |
| G3 | Durée d'une journée de jeu en temps réel ? | **12 minutes** de 6 h à 2 h. | C-MON-02 |

---

## 11. Journal

| Version | Date | Changement |
|---|---|---|
| v0.1 | 2026-10-11 | Création : pitch, benchmark, piliers, 63 concepts proposés, feuille de route, 11 questions. |
| v0.2 | 2026-10-11 | Réponses G1, G2, G5, G6 : tuiles 32 px ; trois jauges PV / Faim / Énergie (C-JOU-02 réécrit, C-JOU-05 et C-JOU-06 ajoutés ; l'énergie devient la protection contre la Flétrissure) ; combat d'action validé ; reprise des zones par la Flétrissure en mode Survie seulement. C-JOU-01, C-JOU-02, C-CBT-01, C-MEN-06, C-MEN-07 passent à VALIDÉ. Planche de tuiles et héros fournis. Questions G12 à G14 ajoutées. |
| v0.3 | 2026-10-11 | Réponses G12 à G14 : perte lente de PV quand on est affamé ; énergie réservée à la Flétrissure (endurance gardée en hypothèse, C-JOU-07) ; la lumière protège de la Flétrissure (C-JOU-08). C-JOU-05, C-JOU-06, C-JOU-08 passent à VALIDÉ. v0.1 de la spécification détaillée validée. |
| v0.4 | 2026-10-11 | Récolte (C-RES-04 à C-RES-07), inspection et inventaire (C-IHM-05, C-IHM-06), caméra toujours centrée et affichage à la taille de l'écran (C-IHM-07), nouveau thème **TEC — Recherche** inspiré d'*ARK* (C-TEC-01 à C-TEC-05), premier artisanat et feu de camp (C-ART-04, C-ART-05), sauge de l'aube contre la Flétrissure (C-MEN-08). Feuille de route revue : v0.2 récolte, v0.3 artisanat, v0.5 recherche. Questions G15 à G17. |
| v0.5 | 2026-10-12 | Réponses G15 à G17 (expérience + livres de plans trouvés en explorant ; ordre de priorité ; purification définitive). Exploration (C-MON-06 à 08), début cosy dans le Vallon (C-UNI-06), PNJ et indices (C-VIL-07), dialogues, journal, notifications (C-IHM-08 à 10). Feuille de route : v0.3 exploration, l'artisanat passe en v0.4. |
| v0.6 | 2026-10-12 | Réponses Q17 (Tiled, plus tard) et Q18 (PNJ qui se déplacent, avec le temps). Fouille des ruines (C-MON-09), livres (C-TEC-06), atlas d'icônes (C-IHM-11). |
| v0.7 | 2026-10-12 | Demande du porteur du projet : inventaire consultable et livres lisibles (C-INV-03, C-INV-04), lire un livre de survie apprend ses recettes (C-TEC-07, précise C-TEC-03), fenêtre d'artisanat (C-ART-06), hache requise pour couper et pioche pour piocher (C-RES-04), progression par les outils (C-RES-08), fenêtres au milieu de l'écran (C-IHM-12). Quêtes (C-VIL-09) validées dans leur principe pour la v0.6. Feuille de route décalée : v0.5 artisanat, v0.6 quêtes, v0.7 le temps. |
| v0.8 | 2026-10-12 | Retours de test : barre d'actions à icônes plutôt que des touches à connaître (C-IHM-13). Quêtes détaillées (C-VIL-09) : la poupée est dans un coffre des ruines, on la rend avec un bouton « Donner », la récompense est de l'expérience. Expérience (C-JOU-09), niveaux plus tard. Le feu de camp passe en v0.7. |
| v0.9 | 2026-10-12 | Retours de test : notifications au-dessus du héros avec une croix, quêtes jusqu'à fermeture, une seule notification par fouille, nom du lieu à chaque retour (C-IHM-10, C-MON-06) ; livres retirés du journal (C-IHM-09) ; journal parmi les fenêtres exclusives (C-IHM-12). |
| v0.10 | 2026-10-12 | Réponse G3 (12 minutes de 6 h à 2 h). Périmètre de la v0.7 choisi : jour / nuit (C-MON-02, C-MON-11), horloge (C-IHM-14), feu de camp qui s'éteint et se ravive (C-ART-05, C-ART-07), repousse des arbres (C-RES-07). Faim, sommeil, sauvegarde et PNJ qui se déplacent passent en v0.8. |
| v0.11 | 2026-10-12 | Périmètre de la v0.8 choisi : baies et champignons (C-RES-09), faim et PV sans énergie (C-JOU-10), dormir près d'un feu allumé dès 18:00 (C-SAU-03), s'évanouir sans perte (C-SAU-04), sauvegarde au coucher et reprise automatique (C-SAU-01 validé), PNJ qui se promènent (C-VIL-08), jauges et fenêtre « Partie » (C-IHM-15). |
| v0.12 | 2026-10-12 | Périmètre de la v0.9 choisi : expérience gagnée en jouant (C-JOU-09), niveaux croissants à 1 point de recherche, livres de recherche dans les cachettes (C-TEC-08), plans à 1 point, prérequis « plan précédent » (C-TEC-04), outils en pierre, sac du cueilleur, champignons grillés au feu (C-TEC-09, C-ART-08). |
