// @ts-check

/**
 * R-IHM-AFF-001 : la vue a la taille de la fenêtre en pixels physiques (taille CSS × rapport de
 * pixels de l'appareil, arrondie). On n'utilise pas `screen.width` / `screen.height`, qui donnent
 * la taille du moniteur et non celle de la fenêtre.
 * @param {object} params
 * @param {number} params.cssWidth Largeur de la fenêtre (`window.innerWidth`).
 * @param {number} params.cssHeight Hauteur de la fenêtre (`window.innerHeight`).
 * @param {number} params.pixelRatio `window.devicePixelRatio`.
 * @returns {{ width: number, height: number }} Taille de la vue (px physiques = px de monde).
 */
export function computeViewSize({ cssWidth, cssHeight, pixelRatio }) {
  return {
    width: Math.round(cssWidth * pixelRatio),
    height: Math.round(cssHeight * pixelRatio),
  };
}
