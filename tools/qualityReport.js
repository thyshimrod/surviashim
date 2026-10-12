// @ts-check
// Usage : npm run quality:report
// Produit reports/quality.html : analyse ESLint (règles SonarJS, JSDoc…), duplication (jscpd)
// et couverture des tests, dans un rapport lisible façon tableau de bord SonarQube.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ESLint } from 'eslint';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const reportsDirectory = join(projectRoot, 'reports');
const NODE = process.execPath;

/**
 * @typedef {object} Issue
 * @property {string} file
 * @property {number} line
 * @property {string} rule
 * @property {'erreur' | 'avertissement'} severity
 * @property {string} message
 */

/**
 * Analyse ESLint de tout le projet.
 * @returns {Promise<Issue[]>}
 */
async function collectLintIssues() {
  const eslint = new ESLint({ cwd: projectRoot });
  const results = await eslint.lintFiles(['.']);
  return results.flatMap((result) =>
    result.messages.map((message) => ({
      file: relative(projectRoot, result.filePath),
      line: message.line,
      rule: message.ruleId ?? 'analyse',
      severity: message.severity === 2 ? 'erreur' : 'avertissement',
      message: message.message,
    })),
  );
}

/**
 * Lance jscpd et lit son rapport JSON.
 * @returns {{ percentage: number, clones: { first: string, second: string, lines: number }[] }}
 */
function collectDuplication() {
  const jscpdCli = join(projectRoot, 'node_modules', 'jscpd', 'run-jscpd.js');
  execFileSync(NODE, [jscpdCli, '--reporters', 'json', '--silent'], { cwd: projectRoot });
  const report = JSON.parse(
    readFileSync(join(reportsDirectory, 'duplication', 'jscpd-report.json'), 'utf8'),
  );
  return {
    percentage: report.statistics.total.percentage,
    clones: report.duplicates.map((clone) => ({
      first: `${clone.firstFile.name}:${clone.firstFile.start}`,
      second: `${clone.secondFile.name}:${clone.secondFile.start}`,
      lines: clone.lines,
    })),
  };
}

/**
 * Lance les tests avec mesure de couverture et lit le fichier lcov produit.
 * @returns {{ file: string, linesFound: number, linesHit: number }[]}
 */
function collectCoverage() {
  const lcovPath = join(reportsDirectory, 'lcov.info');
  execFileSync(
    NODE,
    [
      '--test',
      '--experimental-test-coverage',
      '--test-coverage-include=src/**',
      '--test-coverage-include=data/**',
      '--test-reporter=lcov',
      `--test-reporter-destination=${lcovPath}`,
      'tests/**/*.test.js',
    ],
    { cwd: projectRoot, stdio: 'ignore' },
  );
  return readFileSync(lcovPath, 'utf8')
    .split('end_of_record')
    .map((record) => ({
      file: /SF:(.+)/.exec(record)?.[1]?.trim() ?? '',
      linesFound: Number(/LF:(\d+)/.exec(record)?.[1] ?? 0),
      linesHit: Number(/LH:(\d+)/.exec(record)?.[1] ?? 0),
    }))
    .filter((entry) => entry.file !== '')
    .map((entry) => ({ ...entry, file: relative(projectRoot, entry.file) }));
}

/**
 * @param {string} text
 * @returns {string}
 */
function escapeHtml(text) {
  return text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

/**
 * @param {number} hit
 * @param {number} found
 * @returns {number} Pourcentage arrondi à une décimale (100 si rien à couvrir).
 */
function percent(hit, found) {
  return found === 0 ? 100 : Math.round((hit / found) * 1000) / 10;
}

/**
 * @param {string} title
 * @param {string} value
 * @param {boolean} isOk
 * @returns {string}
 */
function card(title, value, isOk) {
  return `<div class="card ${isOk ? 'ok' : 'ko'}"><div class="value">${value}</div><div>${title}</div></div>`;
}

/**
 * @param {{ issues: Issue[], duplication: ReturnType<typeof collectDuplication>, coverage: ReturnType<typeof collectCoverage> }} data
 * @returns {string}
 */
function renderHtml({ issues, duplication, coverage }) {
  const errors = issues.filter((issue) => issue.severity === 'erreur').length;
  const covered = coverage.reduce((total, entry) => total + entry.linesHit, 0);
  const coverable = coverage.reduce((total, entry) => total + entry.linesFound, 0);
  const coreCoverage = coverage.filter((entry) => entry.file.startsWith(join('src', 'core')));
  const corePercent = percent(
    coreCoverage.reduce((total, entry) => total + entry.linesHit, 0),
    coreCoverage.reduce((total, entry) => total + entry.linesFound, 0),
  );

  const issueRows = issues
    .map(
      (issue) =>
        `<tr><td>${escapeHtml(issue.file)}:${issue.line}</td><td>${issue.severity}</td><td>${escapeHtml(issue.rule)}</td><td>${escapeHtml(issue.message)}</td></tr>`,
    )
    .join('');
  const cloneRows = duplication.clones
    .map(
      (clone) =>
        `<tr><td>${escapeHtml(clone.first)}</td><td>${escapeHtml(clone.second)}</td><td>${clone.lines}</td></tr>`,
    )
    .join('');
  const coverageRows = coverage
    .map((entry) => {
      const value = percent(entry.linesHit, entry.linesFound);
      return `<tr class="${value < 100 ? 'partial' : ''}"><td>${escapeHtml(entry.file)}</td><td>${value} %</td><td>${entry.linesHit} / ${entry.linesFound}</td></tr>`;
    })
    .join('');

  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><title>Surshim — qualité du code</title>
<style>
body{font-family:system-ui,sans-serif;margin:24px;color:#1b2631;background:#f4f6f7}
h1{margin-top:0}.cards{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:24px}
.card{background:#fff;border-radius:8px;padding:16px 24px;min-width:180px;border-top:6px solid}
.card.ok{border-color:#27ae60}.card.ko{border-color:#c0392b}.value{font-size:32px;font-weight:bold}
table{border-collapse:collapse;width:100%;background:#fff;margin-bottom:24px}
td,th{border:1px solid #d5d8dc;padding:6px 10px;text-align:left;font-size:14px}
th{background:#eaecee}tr.partial td{background:#fdebd0}
</style></head><body>
<h1>Surshim — qualité du code</h1>
<p>Généré le ${new Date().toLocaleString('fr-FR')} par <code>npm run quality:report</code>.</p>
<div class="cards">
${card('Erreurs ESLint (SonarJS, JSDoc…)', String(errors), errors === 0)}
${card('Avertissements ESLint', String(issues.length - errors), issues.length === errors)}
${card('Duplication (seuil 3 %)', `${duplication.percentage.toFixed(2)} %`, duplication.percentage <= 3)}
${card('Couverture src/core (seuil 90 %)', `${corePercent} %`, corePercent >= 90)}
${card('Couverture totale (src, data)', `${percent(covered, coverable)} %`, true)}
</div>
<h2>Problèmes signalés</h2>
${issues.length === 0 ? '<p>Aucun problème.</p>' : `<table><tr><th>Fichier</th><th>Gravité</th><th>Règle</th><th>Message</th></tr>${issueRows}</table>`}
<h2>Code dupliqué</h2>
${duplication.clones.length === 0 ? '<p>Aucune duplication.</p>' : `<table><tr><th>Premier bloc</th><th>Second bloc</th><th>Lignes</th></tr>${cloneRows}</table>`}
<h2>Couverture des tests par fichier</h2>
<table><tr><th>Fichier</th><th>Lignes couvertes</th><th>Détail</th></tr>${coverageRows}</table>
</body></html>`;
}

if (!existsSync(reportsDirectory)) {
  mkdirSync(reportsDirectory, { recursive: true });
}
const report = renderHtml({
  issues: await collectLintIssues(),
  duplication: collectDuplication(),
  coverage: collectCoverage(),
});
const outputPath = join(reportsDirectory, 'quality.html');
writeFileSync(outputPath, report, 'utf8');
console.log(`Rapport de qualité : ${relative(projectRoot, outputPath)}`);
