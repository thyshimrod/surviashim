// @ts-check

/**
 * Couleurs, polices et formes de l'affichage qui ne viennent pas des images (bandes, ombres,
 * mode debug). Les longueurs des formes sont en px de monde.
 */
export const THEME = Object.freeze({
  colors: Object.freeze({
    band: '#10140f',
    shadow: 'rgba(0, 0, 0, 0.25)',
    debugBackground: 'rgba(0, 0, 0, 0.7)',
    debugText: '#e8f5d0',
    debugHitbox: '#ff3b3b',
    debugBlocking: 'rgba(255, 220, 60, 0.8)',
    loadingText: '#e8f5d0',
  }),
  fonts: Object.freeze({
    debug: '13px monospace',
    message: '20px sans-serif',
  }),
  shapes: Object.freeze({
    shadowHeight: 6,
  }),
  debug: Object.freeze({
    lineHeightPx: 16,
    paddingPx: 8,
    widthPx: 260,
    marginPx: 8,
  }),
});
