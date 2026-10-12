# Surshim — consignes pour Claude

- Lire et respecter [GUIDELINES.md](GUIDELINES.md) : séparation `src/core` (métier pur) / `src/presentation`, état sérialisable, standards de code, tests.
- Deux niveaux de spécification :
  - [docs/GAME_DESIGN.md](docs/GAME_DESIGN.md) — spécification globale : vision, piliers, concepts `C-THÈME-NN` ;
  - [docs/SPECIFICATION.md](docs/SPECIFICATION.md) — spécification détaillée : règles `R-THÈME-SOUS-NNN`.
- Toute évolution de comportement passe d'abord par la spécification (concept `VALIDÉ`, puis règle avec identifiant, statut, exemples, historique — partie A), puis par les tests `tests/spec/`, puis par le code.
- Ne jamais implémenter une règle `À CONFIRMER` ni un concept `PROPOSÉ` : poser la question.
- Les paramètres de `data/gameParameters.js` doivent rester identiques à la partie C de la spécification.
- Code et identifiants en anglais ; textes affichés (`src/presentation/i18n/fr.js`), tests et documentation en français.
- Avant de rendre la main : `npm run check` doit passer.
