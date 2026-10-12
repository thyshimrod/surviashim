import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseParameterValue, parseRules } from '../../../tools/specParser.js';
import { collectTestedExamples, findCoverageProblems } from '../../../tools/specCoverage.js';

const SPEC_SAMPLE = `
# Partie A
\`\`\`markdown
#### R-XXX-YYY-001 · Gabarit à ignorer
| NOUVEAU | v0.1 | — |
\`\`\`

# Partie D
#### R-ENN-DEP-001 · Une règle
| Statut | Version | Paramètres |
|---|---|---|
| NOUVEAU | v0.1 | — |

| # | Étant donné | Quand | Alors |
|---|---|---|---|
| 1 | a | b | c |
| 2 | a | b | c |

#### R-ENN-DEP-002 · Une règle supprimée
| SUPPRIMÉ | v0.1 | — |

## 4. Autre thème
| 9 | ligne hors règle | | |
`;

describe('specParser', () => {
  it('lit identifiant, titre, statut et exemples, en ignorant les blocs de code', () => {
    assert.deepEqual(parseRules(SPEC_SAMPLE), [
      { id: 'R-ENN-DEP-001', title: 'Une règle', status: 'NOUVEAU', examples: [1, 2] },
      { id: 'R-ENN-DEP-002', title: 'Une règle supprimée', status: 'SUPPRIMÉ', examples: [] },
    ]);
  });

  it('interprète les valeurs de paramètres', () => {
    assert.equal(parseParameterValue(' 960 '), 960);
    assert.equal(parseParameterValue('0,5'), 0.5);
    assert.equal(parseParameterValue('illimitée'), Infinity);
    assert.deepEqual(parseParameterValue('(64, −48)'), { x: 64, y: -48 });
    assert.throws(() => parseParameterValue('beaucoup'), /Unreadable/);
  });
});

describe('specCoverage', () => {
  const rules = parseRules(SPEC_SAMPLE);

  it('rattache chaque exemple testé à la règle du describe qui le précède', () => {
    const tested = collectTestedExamples([
      "describe('R-ENN-DEP-001 · x', () => { it('ex.1 — a'); it('ex.2 — b'); });",
    ]);

    assert.deepEqual([...tested.get('R-ENN-DEP-001')], [1, 2]);
  });

  it('ne signale rien quand tout est couvert', () => {
    const tested = new Map([['R-ENN-DEP-001', new Set([1, 2])]]);

    assert.deepEqual(findCoverageProblems(rules, tested), []);
  });

  it('signale une règle sans test et un exemple manquant', () => {
    assert.deepEqual(findCoverageProblems(rules, new Map()), [
      'R-ENN-DEP-001 (NOUVEAU) : aucun test',
    ]);
    assert.deepEqual(findCoverageProblems(rules, new Map([['R-ENN-DEP-001', new Set([1])]])), [
      "R-ENN-DEP-001 : l'exemple 2 n'est pas testé",
    ]);
  });

  it('signale un test sur une règle supprimée, inconnue, ou sur un exemple inexistant', () => {
    const tested = new Map([
      ['R-ENN-DEP-001', new Set([1, 2, 3])],
      ['R-ENN-DEP-002', new Set([1])],
      ['R-ZZZ-ZZZ-999', new Set([1])],
    ]);

    assert.deepEqual(findCoverageProblems(rules, tested), [
      "R-ENN-DEP-001 : l'exemple 3 est testé mais n'existe pas",
      'R-ENN-DEP-002 : testée alors que son statut est « SUPPRIMÉ »',
      'R-ZZZ-ZZZ-999 : testée mais absente de la spécification',
    ]);
  });
});
