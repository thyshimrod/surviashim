# 0001 — Modules ES natifs, sans framework ni bundler

- **Date** : 2026-10-09
- **Statut** : Acceptée (reprise de Tower)

## Contexte

Age of Shimrod chargeait une trentaine de scripts via des balises `<script>` dont l'ordre devait être maintenu à la main, avec un espace de noms global partagé. On veut un code lisible, débuggable directement dans le navigateur, et testable en Node.

## Décision

- Le code est écrit en modules ES (`import` / `export`), chargés nativement par le navigateur depuis un unique `<script type="module" src="src/main.js">`.
- Aucun framework, aucun bundler, aucune étape de compilation. Le typage est fait en JSDoc et vérifié par `tsc` en mode vérification seule (`npm run typecheck`).
- Les tests utilisent le lanceur intégré de Node (`node:test`), sans dépendance.

## Conséquences

- ✅ Le code exécuté est exactement le code source : points d'arrêt et piles d'appels lisibles sans source maps.
- ✅ Les dépendances entre fichiers sont explicites ; l'ordre de chargement n'est plus un sujet.
- ✅ Les mêmes modules tournent dans le navigateur et dans Node (tests).
- ⚠️ Le jeu ne s'ouvre pas en `file://` : un serveur local est nécessaire (`npm run serve`).
- ⚠️ Un grand nombre de petits fichiers est chargé au démarrage ; acceptable à cette échelle. À réévaluer si le temps de chargement devient gênant.
