// Garantit que chaque règle testable de la spécification est couverte (GUIDELINES §10.3).
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkSpecCoverage } from '../../tools/specCoverage.js';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

describe('Couverture de la spécification', () => {
  it('chaque exemple de chaque règle testable a un test, et aucun test ne cite une règle inconnue', () => {
    const { problems } = checkSpecCoverage(projectRoot);

    assert.deepEqual(problems, []);
  });
});
