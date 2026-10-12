// @ts-check

/** Niveaux de journalisation, du plus bavard au plus silencieux. */
export const LOG_LEVELS = Object.freeze({
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 100,
});

/**
 * Écrit un message d'un module, avec des données facultatives.
 * @callback LogWriter
 * @param {string} module
 * @param {string} message
 * @param {unknown} [data]
 * @returns {void}
 */

/**
 * @typedef {object} Logger
 * @property {LogWriter} debug
 * @property {LogWriter} info
 * @property {LogWriter} warn
 * @property {LogWriter} error
 */

/**
 * Crée un journal filtré par niveau. Seul point du code autorisé à écrire dans la console.
 * @param {object} [options]
 * @param {string} [options.level] Niveau minimal affiché : debug, info, warn, error, silent.
 * @param {Pick<Console, 'debug' | 'info' | 'warn' | 'error'>} [options.sink] Destination.
 * @returns {Logger}
 */
export function createLogger({ level = 'info', sink = console } = {}) {
  const threshold = LOG_LEVELS[level] ?? LOG_LEVELS.info;

  /**
   * @param {'debug' | 'info' | 'warn' | 'error'} messageLevel
   * @returns {LogWriter}
   */
  const writer = (messageLevel) => (module, message, data) => {
    if (LOG_LEVELS[messageLevel] < threshold) {
      return;
    }
    const text = `[${module}] ${message}`;
    if (data === undefined) {
      sink[messageLevel](text);
    } else {
      sink[messageLevel](text, data);
    }
  };

  return {
    debug: writer('debug'),
    info: writer('info'),
    warn: writer('warn'),
    error: writer('error'),
  };
}
