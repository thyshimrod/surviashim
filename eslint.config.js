import js from '@eslint/js';
import jsdoc from 'eslint-plugin-jsdoc';
import sonarjs from 'eslint-plugin-sonarjs';
import globals from 'globals';

/** Identifiants interdits dans la couche métier (GUIDELINES §5.1, règle 2). */
const BROWSER_AND_CLOCK_GLOBALS = [
  'window',
  'document',
  'localStorage',
  'sessionStorage',
  'requestAnimationFrame',
  'setTimeout',
  'setInterval',
  'performance',
  'Image',
];

/** Code applicatif : soumis à toutes les règles de documentation (GUIDELINES §9.4). */
const APPLICATION_CODE = ['src/**/*.js', 'data/**/*.js', 'tools/**/*.js'];

export default [
  { ignores: ['node_modules/', 'coverage/', 'reports/'] },

  js.configs.recommended,

  // Règles de qualité de SonarQube pour JavaScript (bugs, code smells, complexité cognitive).
  sonarjs.configs.recommended,

  {
    files: ['**/*.js'],
    languageOptions: { ecmaVersion: 2022, sourceType: 'module' },
    rules: {
      eqeqeq: 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'no-console': 'error',
      'no-magic-numbers': [
        'warn',
        { ignore: [-1, 0, 1, 2], ignoreDefaultValues: true, ignoreArrayIndexes: true },
      ],
      'max-lines': ['warn', { max: 300, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['warn', { max: 40, skipBlankLines: true, skipComments: true }],
      'max-depth': ['error', 3],
      'max-params': ['error', 4],
      complexity: ['warn', 10],
      // Complexité cognitive (lisibilité perçue), seuil SonarQube par défaut.
      'sonarjs/cognitive-complexity': ['error', 15],
    },
  },

  // Documentation JSDoc : chaque fonction, classe et méthode exportée est documentée.
  {
    files: APPLICATION_CODE,
    plugins: { jsdoc },
    settings: { jsdoc: { mode: 'typescript' } },
    rules: {
      ...jsdoc.configs['flat/recommended'].rules,
      'jsdoc/require-jsdoc': [
        'error',
        {
          publicOnly: true,
          require: {
            FunctionDeclaration: true,
            ClassDeclaration: true,
            MethodDefinition: true,
          },
        },
      ],
      // Le typage est vérifié par TypeScript (npm run typecheck) ; les descriptions restent libres.
      'jsdoc/require-param-description': 'off',
      'jsdoc/require-returns-description': 'off',
      'jsdoc/require-property-description': 'off',
      'jsdoc/no-undefined-types': 'off',
      // Les accesseurs (get) documentent leur rôle sans @returns.
      'jsdoc/require-returns': ['warn', { checkGetters: false }],
    },
  },

  // Couches exécutées dans le navigateur.
  {
    files: [
      'src/presentation/**/*.js',
      'src/app/**/*.js',
      'src/debug/**/*.js',
      'src/main.js',
      'tools/catalog/**/*.js',
    ],
    languageOptions: { globals: globals.browser },
  },

  // Couche métier et données : aucun accès au navigateur, à l'horloge ou à l'aléatoire.
  {
    files: ['src/core/**/*.js', 'data/**/*.js'],
    rules: {
      'no-restricted-globals': ['error', ...BROWSER_AND_CLOCK_GLOBALS],
      'no-restricted-properties': [
        'error',
        { object: 'Math', property: 'random', message: 'Injecter un générateur seedé.' },
        { object: 'Date', property: 'now', message: 'Le métier compte en ticks.' },
      ],
      'no-restricted-syntax': [
        'error',
        { selector: "NewExpression[callee.name='Date']", message: 'Le métier compte en ticks.' },
      ],
      'no-restricted-imports': [
        'error',
        { patterns: ['**/presentation/**', '**/app/**', '**/debug/**'] },
      ],
    },
  },

  // Données : les valeurs numériques sont la raison d'être de ces fichiers.
  {
    files: ['data/**/*.js'],
    rules: { 'no-magic-numbers': 'off' },
  },

  // Tests, outils et configuration : exécutés par Node.
  {
    files: ['tests/**/*.js', 'tools/**/*.js', 'eslint.config.js'],
    languageOptions: { globals: globals.node },
    rules: {
      'no-magic-numbers': 'off',
      'max-lines-per-function': 'off',
      // Les fabriques de test ont beaucoup de valeurs par défaut, comptées comme des branches.
      complexity: 'off',
      'no-console': 'off',
    },
  },

  // Tests : les libellés et données répétés font partie de leur lisibilité.
  {
    files: ['tests/**/*.js'],
    rules: {
      'sonarjs/no-duplicate-string': 'off',
      'sonarjs/no-nested-functions': 'off',
    },
  },
];
