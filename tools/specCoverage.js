// @ts-check
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseRules, RULE_STATUS, TESTED_STATUSES } from './specParser.js';

/** @typedef {import('./specParser.js').SpecRule} SpecRule */

const DESCRIBE_PATTERN = /describe\(\s*(['"`])(R-[A-Z]{3}-[A-Z]{3}-\d{3})\b/g;
const EXAMPLE_TEST_PATTERN = /\bit\(\s*(['"`])ex\.(\d+)\b/g;

/**
 * Relève, dans le code des tests de spécification, les exemples couverts par règle.
 * Un `it('ex.N …')` est rattaché au dernier `describe('R-… · …')` qui le précède.
 * @param {string[]} testSources Contenu des fichiers de test.
 * @returns {Map<string, Set<number>>} Identifiant de règle → numéros d'exemples testés.
 */
export function collectTestedExamples(testSources) {
  /** @type {Map<string, Set<number>>} */
  const tested = new Map();
  for (const source of testSources) {
    let currentRule;
    for (const marker of findMarkers(source)) {
      if (marker.ruleId !== undefined) {
        currentRule = marker.ruleId;
        tested.set(currentRule, tested.get(currentRule) ?? new Set());
      } else if (currentRule !== undefined) {
        tested.get(currentRule).add(marker.example);
      }
    }
  }
  return tested;
}

/**
 * Repère les `describe` de règle et les `it` d'exemple, dans leur ordre d'apparition.
 * @param {string} source
 * @returns {{ at: number, ruleId?: string, example?: number }[]}
 */
function findMarkers(source) {
  const describes = [...source.matchAll(DESCRIBE_PATTERN)].map((match) => ({
    at: match.index,
    ruleId: match[2],
  }));
  const examples = [...source.matchAll(EXAMPLE_TEST_PATTERN)].map((match) => ({
    at: match.index,
    example: Number(match[2]),
  }));
  return [...describes, ...examples].sort((a, b) => a.at - b.at);
}

/**
 * Compare la spécification et les tests (partie A.6 de la spécification).
 * @param {SpecRule[]} rules
 * @param {Map<string, Set<number>>} tested
 * @returns {string[]} Liste des problèmes, vide si tout est conforme.
 */
export function findCoverageProblems(rules, tested) {
  const problems = [];
  const rulesById = new Map(rules.map((rule) => [rule.id, rule]));

  for (const rule of rules) {
    if (rule.status === undefined) {
      problems.push(`${rule.id} : statut introuvable dans la spécification`);
    } else if (TESTED_STATUSES.includes(rule.status)) {
      problems.push(...missingExamples(rule, tested.get(rule.id)));
    }
  }

  for (const [ruleId, examples] of tested) {
    problems.push(...unexpectedTests(ruleId, examples, rulesById.get(ruleId)));
  }
  return problems;
}

/**
 * Problèmes des tests qui citent une règle inconnue, non testable, ou un exemple inexistant.
 * @param {string} ruleId
 * @param {Set<number>} examples Exemples testés.
 * @param {SpecRule | undefined} rule
 * @returns {string[]}
 */
function unexpectedTests(ruleId, examples, rule) {
  if (rule === undefined) {
    return [`${ruleId} : testée mais absente de la spécification`];
  }
  if (!TESTED_STATUSES.includes(rule.status)) {
    return [`${ruleId} : testée alors que son statut est « ${rule.status} »`];
  }
  return [...examples]
    .filter((example) => !rule.examples.includes(example))
    .map((example) => `${ruleId} : l'exemple ${example} est testé mais n'existe pas`);
}

/**
 * @param {SpecRule} rule
 * @param {Set<number> | undefined} testedExamples
 * @returns {string[]}
 */
function missingExamples(rule, testedExamples) {
  if (testedExamples === undefined) {
    return [`${rule.id} (${rule.status}) : aucun test`];
  }
  if (rule.examples.length === 0) {
    return [`${rule.id} : aucun exemple dans la spécification`];
  }
  return rule.examples
    .filter((example) => !testedExamples.has(example))
    .map((example) => `${rule.id} : l'exemple ${example} n'est pas testé`);
}

/**
 * Lit la spécification et les tests depuis le disque, puis renvoie le bilan.
 * @param {string} rootDirectory Racine du projet.
 * @returns {{ rules: SpecRule[], problems: string[], countByStatus: Record<string, number> }}
 */
export function checkSpecCoverage(rootDirectory) {
  const specification = readFileSync(join(rootDirectory, 'docs', 'SPECIFICATION.md'), 'utf8');
  const specTestsDirectory = join(rootDirectory, 'tests', 'spec');
  const testSources = readdirSync(specTestsDirectory)
    .filter((file) => file.endsWith('.test.js'))
    .map((file) => readFileSync(join(specTestsDirectory, file), 'utf8'));

  const rules = parseRules(specification);
  const problems = findCoverageProblems(rules, collectTestedExamples(testSources));
  const countByStatus = Object.fromEntries(
    Object.values(RULE_STATUS).map((status) => [
      status,
      rules.filter((rule) => rule.status === status).length,
    ]),
  );
  return { rules, problems, countByStatus };
}
