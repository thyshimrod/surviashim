# Inventaire des assets

Chaque fichier ajouté dans `assets/` doit être listé ici (GUIDELINES § 8).

| Fichier | Contenu | Dimensions / découpage | Source | Licence |
|---|---|---|---|---|
| `images/tilesets/tileset-main.png` | Planche de tuiles : sols, autotiles (herbe, terre, eau…), végétation, rochers et minerais, cultures, objets, mobilier | 1024 × 2016 px, PNG transparent, tuiles de 32 px (32 × 63). Catalogue : `data/tileset.js` ; aperçu : `tools/catalog/` | RPG Maker (ressources RTP), copie de `ageofshimrod/assets/tileset/tileset1.png` | Licence RPG Maker — usage personnel, non publié |
| `images/sprites/characters/hero.png` | Héros : 4 directions × 3 images | 192 × 256 px, PNG transparent ; images de 64 × 64 px ; lignes dans l'ordre bas, gauche, droite, haut ; colonne du milieu = pose immobile. Les pixels sont doublés : le dessin d'origine fait 32 × 32 px par image (question Q10) | RPG Maker, fourni par le porteur du projet le 2026-10-11 | Licence RPG Maker — usage personnel, non publié |
| `images/sprites/villagers/villager-blond.png`, `villager-red.png`, `villager-orange.png`, `villager-green.png` | Habitants (PNJ) : 4 directions × 3 images | 96 × 128 px, PNG transparent ; images de 32 × 32 px, lignes bas, gauche, droite, haut | RPG Maker, copies de `ageofshimrod/assets/sprite/` (`adam`, `rose`, `soldat`, `vert`) | Licence RPG Maker — usage personnel, non publié |
| `images/tilesets/interior-abandoned.png`, `interior-haunted.png`, `interior-steampunk.png` | Planches de ruines et d'intérieurs : murs, sols dallés, bibliothèques, coffres, caisses, mobilier, tombes, vitraux | 512 × 512 px, PNG transparent, tuiles de 32 px (16 × 16). Réduites depuis les originaux de `mv-48px/` par `tools/assets/downscaleTileset.js` (moyenne pondérée, question Q20). Catalogue : `data/interiorSprites.js` | RPG Maker MV, fournies par le porteur du projet le 2026-10-12 | Licence RPG Maker — usage personnel, non publié |
| `images/tilesets/mv-48px/interior-*.png` | Originaux des trois planches précédentes (`interior-haunted` = `Inside_C.png`) | 768 × 768 px, tuiles de 48 px (16 × 16). Non chargés par le jeu : conservés pour refaire la réduction | idem | idem |
| `images/sprites/villagers/villagers-vx-01a.png`, `-01b`, `-03a`, `-03e` | Personnages variés (villageois, voyageurs, moines…) : 8 personnages par planche | 384 × 384 px, PNG transparent ; 2 rangées de 4 blocs de 96 × 192 px ; dans chaque bloc, 3 images × 4 lignes (bas, gauche, droite, haut) de 32 × 48 px. Découpage : `data/sprites.js` (`vx-<planche>-<0..7>`) | RPG Maker VX, `vx_chara01_a.png`, `vx_chara01_b.png`, `vx_chara03_a.png`, `vx_chara03_e.png`, fournies le 2026-10-12 | Licence RPG Maker — usage personnel, non publié |
| `images/ui/iconset.png` | Atlas d'icônes : ressources, outils, armes, livres, nourriture, interface… | 384 × 15 096 px, PNG transparent ; icônes de 24 px, 16 colonnes × 629 lignes. Icônes nommées : `data/icons.js` | RPG Maker, fourni le 2026-10-12 (`bigset.png`) | Licence RPG Maker — usage personnel, non publié |

## Licence des ressources RPG Maker

Ces fichiers proviennent de RPG Maker. Leur licence ne vise que les jeux réalisés avec RPG Maker : Surshim est un projet **personnel, non publié**, ce qui a été accepté (question Q11 de la spécification détaillée). **Avant toute diffusion**, il faudra les remplacer par des ressources au même format (tuiles de 32 px, personnages en 3 × 4 images, icônes de 24 px) sous une licence compatible.

## Règles

- Noms en `kebab-case`, sans espace : `player-walk.png`, `tileset-meadow.png`.
- Le découpage des feuilles de sprites est décrit dans `data/sprites.js`, jamais en dur dans le code.
- Aucune image sans licence connue et compatible ; l'attribution demandée par la licence est reportée ici.
