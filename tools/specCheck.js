// @ts-check
// Usage : npm run spec:check
// Vérifie que chaque règle testable de docs/SPECIFICATION.md est couverte par tests/spec/.
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkSpecCoverage } from './specCoverage.js';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const { rules, problems, countByStatus } = checkSpecCoverage(projectRoot);

console.log(`Spécification : ${rules.length} règles`);
for (const [status, count] of Object.entries(countByStatus)) {
  if (count > 0) {
    console.log(`  ${status.padEnd(12)} ${count}`);
  }
}

if (problems.length === 0) {
  console.log('\n✔ Toutes les règles testables sont couvertes, exemple par exemple.');
} else {
  console.error(`\n✘ ${problems.length} problème(s) :`);
  for (const problem of problems) {
    console.error(`  - ${problem}`);
  }
  process.exitCode = 1;
}
