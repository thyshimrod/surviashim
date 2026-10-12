# 0002 — Le métier compte le temps en ticks fixes de 1/60 s

- **Date** : 2026-10-09
- **Statut** : Acceptée (reprise de Tower)

## Contexte

La spécification exprime les vitesses « par frame » (3 px par frame pour les ennemis, 10 px par frame pour les projectiles). Si l'on comptait les images réellement affichées, le jeu irait 2,4 fois plus vite sur un écran à 144 Hz qu'à 60 Hz. Age of Shimrod appelait `new Date()` dans chaque entité, ce qui rendait le comportement impossible à tester de manière reproductible.

## Décision

- Une unité de temps métier, le **tick**, vaut 1/60 s (`TICK_RATE`, spécification B.2).
- `Game.update()` exécute exactement un tick ; toutes les vitesses et durées métier sont exprimées en ticks.
- `GameLoop` convertit le temps réel en ticks avec un accumulateur à pas fixe ; `requestAnimationFrame` lui est injecté.
- L'ordre des étapes d'un tick est une règle de la spécification (spécification, partie B.4).

## Conséquences

- ✅ Le jeu a la même vitesse sur tous les écrans.
- ✅ Les tests sont exacts et reproductibles : `game.advanceTicks(60)` = une seconde de jeu.
- ✅ Pause, pas-à-pas et accélération se font dans `GameLoop`, sans toucher au métier.
- ⚠️ Une machine trop lente pour exécuter 60 ticks par seconde verra le jeu ralentir (le rattrapage est plafonné à 250 ms par image).
