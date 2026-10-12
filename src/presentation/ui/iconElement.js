// @ts-check
import { ICON_SET, ICONS } from '../../../data/icons.js';

/**
 * Élément DOM qui affiche une icône de l'atlas (concept C-IHM-11), découpée dans la planche
 * d'icônes par `background-position`.
 * @param {Document} doc
 * @param {string} name Clé de ICONS.
 * @returns {HTMLSpanElement}
 */
export function iconElement(doc, name) {
  const icon = doc.createElement('span');
  icon.className = 'icon';
  const definition = ICONS[name];
  if (definition !== undefined) {
    const size = ICON_SET.iconSize;
    icon.style.backgroundImage = `url(${ICON_SET.image})`;
    icon.style.backgroundPosition = `-${definition.column * size}px -${definition.row * size}px`;
  }
  return icon;
}
