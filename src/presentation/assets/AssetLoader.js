// @ts-check

/**
 * Précharge les images avant le démarrage (GUIDELINES § 8.1) : une image manquante produit une
 * erreur qui nomme le fichier, jamais un rendu vide silencieux.
 */
export class AssetLoader {
  /** Crée un chargeur sans image. */
  constructor() {
    /** @type {Map<string, HTMLImageElement>} */
    this.images = new Map();
  }

  /**
   * @param {readonly string[]} paths Chemins depuis la racine du projet.
   * @returns {Promise<void>}
   * @throws {Error} Si un fichier ne peut pas être chargé (le message contient son chemin).
   */
  async loadImages(paths) {
    await Promise.all(paths.map((path) => this.loadImage(path)));
  }

  /**
   * @param {string} path
   * @returns {Promise<void>}
   */
  loadImage(path) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => {
        this.images.set(path, image);
        resolve();
      });
      image.addEventListener('error', () => reject(new Error(`Cannot load image "${path}"`)));
      image.src = path;
    });
  }

  /**
   * @param {string} path
   * @returns {HTMLImageElement}
   * @throws {Error} Si l'image n'a pas été préchargée.
   */
  getImage(path) {
    const image = this.images.get(path);
    if (image === undefined) {
      throw new Error(`Image "${path}" was not preloaded`);
    }
    return image;
  }
}
