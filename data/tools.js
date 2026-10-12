// @ts-check

/**
 * Outils que le joueur peut posséder (concept C-INV-04, spécification B.8). Les noms affichés sont
 * dans src/presentation/i18n/fr.js.
 */

/**
 * Sorte d'outil : ce qu'exige une récolte (R-RES-OUT-001).
 * @typedef {'axe' | 'pickaxe'} ToolKind
 */

/**
 * @typedef {object} ToolDefinition
 * @property {string} id Identifiant unique, kebab-case.
 * @property {ToolKind} kind
 * @property {string} icon Icône (clé de ICONS, data/icons.js).
 */

/** @type {Readonly<Record<string, Readonly<ToolDefinition>>>} */
export const TOOLS = Object.freeze({
  'flint-axe': Object.freeze({ id: 'flint-axe', kind: 'axe', icon: 'axe' }),
  'flint-pickaxe': Object.freeze({ id: 'flint-pickaxe', kind: 'pickaxe', icon: 'pickaxe' }),
});
