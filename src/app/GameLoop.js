// @ts-check

/** Durée maximale prise en compte entre deux images, pour éviter un rattrapage massif. */
const MAX_FRAME_DURATION_MS = 250;
const MIN_SPEED = 0.25;
const MAX_SPEED = 8;

/**
 * Boucle de jeu à pas fixe (GUIDELINES §6) : la logique avance toujours par ticks de même durée,
 * quel que soit le rythme d'affichage ; le rendu a lieu à chaque image.
 */
export class GameLoop {
  /**
   * @param {object} params
   * @param {number} params.stepMs Durée d'un tick en millisecondes (1000 / TICK_RATE).
   * @param {() => void} params.update Exécute un tick de logique.
   * @param {(frameTime: number) => void} params.render Dessine l'état courant.
   * @param {(callback: (time: number) => void) => void} params.requestFrame
   *   Planifie l'image suivante (`requestAnimationFrame` en jeu, une fonction factice en test).
   */
  constructor({ stepMs, update, render, requestFrame }) {
    this.stepMs = stepMs;
    this.update = update;
    this.render = render;
    this.requestFrame = requestFrame;
    this.accumulatedMs = 0;
    /** @type {number | undefined} */
    this.lastFrameTime = undefined;
    this.isRunning = false;
    this.isPaused = false;
    this.speed = 1;
    this.frame = this.frame.bind(this);
  }

  /** Démarre la boucle ; sans effet si elle tourne déjà. */
  start() {
    if (this.isRunning) {
      return;
    }
    this.isRunning = true;
    this.lastFrameTime = undefined;
    this.requestFrame(this.frame);
  }

  /** Arrête la boucle : plus aucune image n'est traitée. */
  stop() {
    this.isRunning = false;
  }

  /** Met en pause ou reprend la logique ; le rendu continue. */
  togglePause() {
    this.isPaused = !this.isPaused;
    this.accumulatedMs = 0;
  }

  /** En pause : exécute un seul tick (débogage pas à pas). */
  stepOnce() {
    if (this.isPaused) {
      this.update();
    }
  }

  /** @param {number} speed Multiplicateur de vitesse, borné entre 0,25 et 8. */
  setSpeed(speed) {
    this.speed = Math.min(MAX_SPEED, Math.max(MIN_SPEED, speed));
  }

  /**
   * Une image : rattrape le temps écoulé par ticks entiers, puis dessine.
   * @param {number} now Horodatage fourni par `requestAnimationFrame` (ms).
   */
  frame(now) {
    if (!this.isRunning) {
      return;
    }
    const elapsedMs = this.lastFrameTime === undefined ? 0 : now - this.lastFrameTime;
    this.lastFrameTime = now;

    if (!this.isPaused) {
      this.accumulatedMs += Math.min(elapsedMs, MAX_FRAME_DURATION_MS) * this.speed;
      while (this.accumulatedMs >= this.stepMs) {
        this.update();
        this.accumulatedMs -= this.stepMs;
      }
    }

    this.render(now);
    this.requestFrame(this.frame);
  }
}
