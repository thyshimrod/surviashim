import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createLogger } from '../../../src/debug/logger.js';

function createSink() {
  const written = [];
  const record =
    (level) =>
    (...args) =>
      written.push([level, ...args]);
  return {
    written,
    sink: {
      debug: record('debug'),
      info: record('info'),
      warn: record('warn'),
      error: record('error'),
    },
  };
}

describe('logger', () => {
  it("n'écrit que les messages de niveau supérieur ou égal au seuil", () => {
    const { sink, written } = createSink();
    const logger = createLogger({ level: 'warn', sink });

    logger.debug('m', 'ignoré');
    logger.info('m', 'ignoré');
    logger.warn('m', 'gardé');
    logger.error('m', 'gardé', { code: 1 });

    assert.deepEqual(written, [
      ['warn', '[m] gardé'],
      ['error', '[m] gardé', { code: 1 }],
    ]);
  });

  it('utilise le niveau info pour un niveau inconnu', () => {
    const { sink, written } = createSink();
    const logger = createLogger({ level: 'bavard', sink });

    logger.debug('m', 'ignoré');
    logger.info('m', 'gardé');

    assert.equal(written.length, 1);
  });
});
