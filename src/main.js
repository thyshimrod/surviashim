// @ts-check
// Point d'entrée navigateur : assemble métier, présentation et boucle de jeu.
// Paramètres d'URL : ?debug=1 (panneau et raccourcis de debug), ?log=debug (journal détaillé).
import { GAME_PARAMETERS } from '../data/gameParameters.js';
import { NPCS } from '../data/npcs.js';
import { CHARACTER_SHEETS } from '../data/sprites.js';
import { ICON_SET } from '../data/icons.js';
import { TILESETS } from '../data/tileset.js';
import { GameLoop } from './app/GameLoop.js';
import { setMoveIntent } from './core/commands/commands.js';
import { GAME_EVENTS } from './core/events/gameEvents.js';
import { Game } from './core/Game.js';
import { DebugOverlay } from './debug/DebugOverlay.js';
import { createLogger } from './debug/logger.js';
import { walkAnimationFrom } from './presentation/animation/selectFrame.js';
import { AssetLoader } from './presentation/assets/AssetLoader.js';
import { screenToWorld } from './presentation/camera/camera.js';
import { Screen } from './presentation/canvas/Screen.js';
import { GameRenderer } from './presentation/GameRenderer.js';
import { TEXTS } from './presentation/i18n/fr.js';
import { bindKeyboard } from './presentation/input/keyboard.js';
import { MovementInput } from './presentation/input/MovementInput.js';
import { CharacterRenderer } from './presentation/renderers/CharacterRenderer.js';
import { GameInterface } from './presentation/ui/GameInterface.js';

const SPEED_FACTOR = 2;
const MS_PER_SECOND = 1000;

const urlParameters = new URLSearchParams(window.location.search);
const isDebugEnabled = urlParameters.has('debug');
const logger = createLogger({
  level: urlParameters.get('log') ?? (isDebugEnabled ? 'debug' : 'warn'),
});

const screen = new Screen(document, 'screen');
// R-IHM-AFF-001 : taille de la fenêtre (et non du moniteur), en pixels physiques.
const fitToWindow = () =>
  screen.resize(window.innerWidth, window.innerHeight, window.devicePixelRatio);
fitToWindow();
window.addEventListener('resize', fitToWindow);
screen.showMessage(TEXTS.loading);

const assets = new AssetLoader();
try {
  await assets.loadImages([
    ...Object.values(TILESETS).map((tileset) => tileset.image),
    ICON_SET.image,
    ...new Set(Object.values(CHARACTER_SHEETS).map((sheet) => sheet.image)),
  ]);
  start();
} catch (error) {
  logger.error('assets', 'Chargement impossible', error);
  screen.showMessage(TEXTS.loadError(error instanceof Error ? error.message : String(error)));
}

/** Crée la partie et lance la boucle, une fois les images chargées. */
function start() {
  const game = Game.create();
  game.events.onAny((type, payload) => logger.debug('game', type, payload));
  logger.info('game', 'Nouvelle partie');

  const renderer = createRenderer(game);
  game.events.on(GAME_EVENTS.TILE_CHANGED, ({ column, row }) => renderer.refreshTile(column, row));
  const ui = createInterface(game, renderer);
  const loop = createLoop(game, renderer, ui);

  new MovementInput({
    target: window,
    onDirectionChange: (direction) => game.execute(setMoveIntent(direction)),
  }).attach();
  if (isDebugEnabled) {
    enableDebugControls({ game, loop, renderer, ui });
  }
  loop.start();
}

/**
 * @param {Game} game
 * @returns {GameRenderer}
 */
function createRenderer(game) {
  const animation = walkAnimationFrom(GAME_PARAMETERS);
  const rendererFor = (/** @type {string} */ sheetName) => {
    const sheet = CHARACTER_SHEETS[sheetName];
    return new CharacterRenderer({ sheet, image: assets.getImage(sheet.image), animation });
  };
  return new GameRenderer({
    doc: document,
    screen,
    state: game.getState(),
    playerRenderer: rendererFor('hero'),
    npcRenderers: Object.fromEntries(
      Object.values(NPCS).map((npc) => [npc.id, rendererFor(npc.sheet)]),
    ),
    tilesets: Object.fromEntries(
      Object.entries(TILESETS).map(([key, tileset]) => [key, assets.getImage(tileset.image)]),
    ),
  });
}

/**
 * Interface branchée sur le clic et le clavier.
 * @param {Game} game
 * @param {GameRenderer} renderer
 * @returns {GameInterface}
 */
function createInterface(game, renderer) {
  const ui = new GameInterface({
    doc: document,
    container: /** @type {HTMLElement} */ (document.getElementById('interface')),
    game,
    notificationTicks: GAME_PARAMETERS.NOTIFICATION_TICKS,
  });
  // R-IHM-INS-001, R-IHM-INS-005 : un clic désigne un PNJ, un élément ou une tuile.
  screen.canvas.addEventListener('click', (event) => {
    const point = screenToWorld(screen.pixelOf(event), renderer.origin);
    ui.handleWorldClick(renderer.designate(point, game.getState()));
  });
  window.addEventListener('keydown', (event) => {
    if (ui.handleKey(event.key)) {
      event.preventDefault();
    }
  });
  return ui;
}

/**
 * Boucle à pas fixe : un tick de logique par 1/TICK_RATE s, un rendu par image.
 * @param {Game} game
 * @param {GameRenderer} renderer
 * @param {GameInterface} ui
 * @returns {GameLoop}
 */
function createLoop(game, renderer, ui) {
  const debugOverlay = isDebugEnabled ? new DebugOverlay() : undefined;
  const loop = new GameLoop({
    stepMs: MS_PER_SECOND / GAME_PARAMETERS.TICK_RATE,
    update: () => game.update(),
    render: (frameTime) => {
      renderer.render(game.getState());
      ui.render();
      if (debugOverlay !== undefined) {
        debugOverlay.drawWorld(screen.context, game.getState(), game.rules, renderer.origin);
        debugOverlay.countFrame(frameTime);
        debugOverlay.render(screen.context, game.getState(), loop);
      }
    },
    requestFrame: (callback) => window.requestAnimationFrame(callback),
  });
  return loop;
}

/**
 * Raccourcis du mode debug et accès depuis la console du navigateur
 * (surshim.game.getState(), surshim.loop.togglePause()…).
 * @param {{ game: Game, loop: GameLoop, renderer: GameRenderer, ui: GameInterface }} parts
 */
function enableDebugControls({ game, loop, renderer, ui }) {
  bindKeyboard(window, {
    p: () => loop.togglePause(),
    n: () => loop.stepOnce(),
    '+': () => loop.setSpeed(loop.speed * SPEED_FACTOR),
    '-': () => loop.setSpeed(loop.speed / SPEED_FACTOR),
  });
  Object.assign(window, { surshim: { game, loop, renderer, ui, parameters: GAME_PARAMETERS } });
}
