// @ts-check

/**
 * Lecture de docs/SPECIFICATION.md : règles (identifiant, statut, exemples) et paramètres.
 * Le format attendu est décrit dans la partie A de la spécification.
 */

/** Statuts définis en partie A.4 de la spécification. */
export const RULE_STATUS = Object.freeze({
  TO_CONFIRM: 'À CONFIRMER',
  NEW: 'NOUVEAU',
  UPDATED: 'MODIFIÉ',
  ACTIVE: 'EN VIGUEUR',
  DELETED: 'SUPPRIMÉ',
});

/**
 * Statuts des règles qui doivent être couvertes par des tests.
 * @type {readonly string[]}
 */
export const TESTED_STATUSES = Object.freeze([
  RULE_STATUS.NEW,
  RULE_STATUS.UPDATED,
  RULE_STATUS.ACTIVE,
]);

const RULE_ID_PATTERN = 'R-[A-Z]{3}-[A-Z]{3}-\\d{3}';
const RULE_HEADING = new RegExp(`^#### (${RULE_ID_PATTERN}) · (.+)$`);
const STATUS_ROW = new RegExp(`^\\| (${Object.values(RULE_STATUS).join('|')}) \\|`);
const EXAMPLE_ROW = /^\| (\d+) \|/;
const PARAMETER_ROW = /^\| `([A-Z_]+)` \| ([^|]+?) \|/;

/**
 * @typedef {object} SpecRule
 * @property {string} id
 * @property {string} title
 * @property {string | undefined} status
 * @property {number[]} examples Numéros des exemples.
 */

/**
 * Remplace le contenu des blocs de code par des lignes vides, pour ignorer le gabarit d'exemple
 * de la partie A tout en conservant les numéros de ligne.
 * @param {string} markdown
 * @returns {string[]}
 */
function linesOutsideCodeBlocks(markdown) {
  let insideCodeBlock = false;
  return markdown.split(/\r?\n/).map((line) => {
    if (line.startsWith('```')) {
      insideCodeBlock = !insideCodeBlock;
      return '';
    }
    return insideCodeBlock ? '' : line;
  });
}

/**
 * Extrait les règles de la spécification.
 * @param {string} markdown
 * @returns {SpecRule[]}
 */
export function parseRules(markdown) {
  /** @type {SpecRule[]} */
  const rules = [];
  let current;

  for (const line of linesOutsideCodeBlocks(markdown)) {
    const heading = RULE_HEADING.exec(line);
    if (heading) {
      current = { id: heading[1], title: heading[2].trim(), status: undefined, examples: [] };
      rules.push(current);
    } else if (line.startsWith('#')) {
      current = undefined;
    } else if (current !== undefined) {
      readRuleLine(current, line);
    }
  }
  return rules;
}

/**
 * @param {SpecRule} rule
 * @param {string} line
 */
function readRuleLine(rule, line) {
  const status = STATUS_ROW.exec(line);
  if (status && rule.status === undefined) {
    rule.status = status[1];
    return;
  }
  const example = EXAMPLE_ROW.exec(line);
  if (example) {
    rule.examples.push(Number(example[1]));
  }
}

/** @typedef {{x: number, y: number}} SpecPoint */
/** @typedef {number | SpecPoint | number[] | SpecPoint[]} SpecValue */

const NUMBER = '-?\\d+(?:\\.\\d+)?';
const POINT_PATTERN = new RegExp(`\\((${NUMBER}), (${NUMBER})\\)`, 'g');
const SINGLE_POINT = new RegExp(`^\\((${NUMBER}), (${NUMBER})\\)$`);

/**
 * Extrait le tableau des paramètres (partie C) : nom → valeur interprétée.
 * Les paramètres supprimés (nom barré) sont ignorés.
 * @param {string} markdown
 * @returns {Record<string, SpecValue>}
 */
export function parseParameters(markdown) {
  const section = extractSection(markdown, '# Partie C', '# Partie D');
  /** @type {Record<string, SpecValue>} */
  const parameters = {};
  for (const line of section.split(/\r?\n/)) {
    const row = PARAMETER_ROW.exec(line);
    if (row) {
      parameters[row[1]] = parseParameterValue(row[2]);
    }
  }
  return parameters;
}

/**
 * Interprète une valeur de paramètre :
 * - « illimitée » → `Infinity` ;
 * - « 0,5 » → 0.5 (virgule décimale, sans espace) ;
 * - « 15, 15, 20 » → `[15, 15, 20]` (liste séparée par « , ») ;
 * - « (64, −48) » → `{ x: 64, y: -48 }` ;
 * - « (1, 2) → (3, 4) » ou « (1, 2), (3, 4) » → liste de points.
 * @param {string} rawValue
 * @returns {SpecValue}
 */
export function parseParameterValue(rawValue) {
  const value = rawValue.trim().replaceAll('−', '-');
  if (value === 'illimitée') {
    return Infinity;
  }
  if (value.startsWith('(')) {
    return parsePoints(value, rawValue);
  }
  if (value.includes(', ')) {
    return value.split(', ').map((item) => parseNumber(item, rawValue));
  }
  return parseNumber(value, rawValue);
}

/**
 * @param {string} value
 * @param {string} rawValue Valeur d'origine, pour le message d'erreur.
 * @returns {SpecPoint | SpecPoint[]}
 */
function parsePoints(value, rawValue) {
  const single = SINGLE_POINT.exec(value);
  if (single) {
    return { x: Number(single[1]), y: Number(single[2]) };
  }
  const points = [...value.matchAll(POINT_PATTERN)].map((match) => ({
    x: Number(match[1]),
    y: Number(match[2]),
  }));
  if (points.length === 0) {
    throw new Error(`Unreadable parameter value "${rawValue}"`);
  }
  return points;
}

/**
 * @param {string} value
 * @param {string} rawValue
 * @returns {number}
 */
function parseNumber(value, rawValue) {
  const number = Number(value.replace(',', '.'));
  if (value === '' || Number.isNaN(number)) {
    throw new Error(`Unreadable parameter value "${rawValue}"`);
  }
  return number;
}

/**
 * @param {string} markdown
 * @param {string} startHeading
 * @param {string} endHeading
 * @returns {string}
 */
function extractSection(markdown, startHeading, endHeading) {
  const start = markdown.indexOf(`\n${startHeading}`);
  const end = markdown.indexOf(`\n${endHeading}`, start + 1);
  if (start === -1 || end === -1) {
    throw new Error(`Section "${startHeading}" not found in specification`);
  }
  return markdown.slice(start, end);
}
