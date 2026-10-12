// Vérifie les règles de dépendance entre couches (GUIDELINES §5.1 et §10.4).
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

/** Identifiants interdits dans la couche métier et les données. */
const FORBIDDEN_IN_CORE = [
  /\bwindow\b/,
  /\bdocument\b/,
  /\blocalStorage\b/,
  /\bsessionStorage\b/,
  /\brequestAnimationFrame\b/,
  /\bsetTimeout\b/,
  /\bsetInterval\b/,
  /\bperformance\./,
  /\bnew Date\b/,
  /\bDate\.now\b/,
  /\bMath\.random\b/,
  /\bnew Image\b/,
  /\bHTMLCanvasElement\b/,
  /\bCanvasRenderingContext2D\b/,
];

function listJsFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      return listJsFiles(path);
    }
    return entry.name.endsWith('.js') ? [path] : [];
  });
}

/**
 * Retire les commentaires pour ne pas déclencher d'alerte sur un mot cité en documentation.
 * Parcours caractère par caractère (pas d'expression régulière à retour arrière coûteux).
 */
function stripComments(source) {
  let code = '';
  let index = 0;
  while (index < source.length) {
    if (source.startsWith('/*', index)) {
      const end = source.indexOf('*/', index + 2);
      index = end === -1 ? source.length : end + 2;
    } else if (source.startsWith('//', index) && source[index - 1] !== ':') {
      const end = source.indexOf('\n', index);
      index = end === -1 ? source.length : end;
    } else {
      code += source[index];
      index += 1;
    }
  }
  return code;
}

/** Chemins absolus des modules importés par un fichier (imports statiques et `import()` JSDoc). */
function importedPaths(file) {
  const source = readFileSync(file, 'utf8');
  const specifiers = [
    ...source.matchAll(/\bfrom\s+['"]([^'"]+)['"]/g),
    ...source.matchAll(/\bimport\(\s*['"]([^'"]+)['"]\s*\)/g),
  ].map((match) => match[1]);
  return specifiers.map((specifier) => resolve(dirname(file), specifier));
}

function layerOf(absolutePath) {
  const parts = relative(projectRoot, absolutePath).split(sep);
  if (parts[0] === 'data') {
    return 'data';
  }
  if (parts[0] === 'src' && parts.length > 2) {
    return parts[1];
  }
  return parts.join('/');
}

function dependencyViolations(directory, allowedLayers) {
  const violations = [];
  for (const file of listJsFiles(join(projectRoot, directory))) {
    for (const imported of importedPaths(file)) {
      const layer = layerOf(imported);
      if (!allowedLayers.includes(layer)) {
        violations.push(
          `${relative(projectRoot, file)} importe ${relative(projectRoot, imported)}`,
        );
      }
    }
  }
  return violations;
}

describe('Architecture en couches', () => {
  it("src/core n'importe que src/core et data", () => {
    assert.deepEqual(dependencyViolations('src/core', ['core', 'data']), []);
  });

  it("data n'importe que data", () => {
    assert.deepEqual(dependencyViolations('data', ['data']), []);
  });

  it("src/presentation n'importe ni src/app ni src/debug", () => {
    assert.deepEqual(
      dependencyViolations('src/presentation', ['presentation', 'core', 'data']),
      [],
    );
  });

  it("src/core et data n'utilisent ni le navigateur, ni l'horloge, ni l'aléatoire", () => {
    const violations = [];
    const files = [
      ...listJsFiles(join(projectRoot, 'src/core')),
      ...listJsFiles(join(projectRoot, 'data')),
    ];
    for (const file of files) {
      const code = stripComments(readFileSync(file, 'utf8'));
      for (const pattern of FORBIDDEN_IN_CORE) {
        if (pattern.test(code)) {
          violations.push(`${relative(projectRoot, file)} utilise ${pattern.source}`);
        }
      }
    }
    assert.deepEqual(violations, []);
  });
});
