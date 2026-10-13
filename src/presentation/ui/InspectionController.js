// @ts-check
import { harvestLabel } from './harvestView.js';
import {
  giveTo,
  goAndAct,
  harvestTile,
  rekindle,
  searchTile,
  sleepBy,
  talkTo,
} from '../../core/commands/commands.js';
import { TEXTS } from '../i18n/fr.js';
import { CONTENT_TEXTS } from '../i18n/frContent.js';
import { campfireView } from './campfireView.js';

/** @typedef {import('../input/designateTile.js').Target} Target */
/** @typedef {import('../../core/commands/harvest.js').TileInspection} TileInspection */
/** @typedef {import('../../core/commands/dialogue.js').NpcInspection} NpcInspection */
/** @typedef {import('../../core/commands/commands.js').CommandResult} CommandResult */

/**
 * Ce que le contrôleur attend du jeu.
 * @typedef {object} InspectableGame
 * @property {(tile: { column: number, row: number }) => TileInspection} inspect
 * @property {(npcId: string) => NpcInspection} inspectNpc
 * @property {(command: import('../../core/commands/commands.js').Command) => CommandResult} execute
 * @property {() => { dialogue?: unknown }} getState
 */

/**
 * Contenu de la fenêtre d'information.
 * @typedef {object} InspectionView
 * @property {string} title Nom de l'élément ou du PNJ (« Arbre », « Aldric, l'ermite »).
 * @property {string} action Ce qu'on peut faire (« Couper : 3 bois », « Parler »).
 * @property {string} button Libellé du bouton (« Récolter », « Parler »).
 * @property {boolean} isActionEnabled État du bouton (R-IHM-INS-003, R-IHM-INS-005).
 * @property {string} [warning] Message affiché quand le bouton est inactif.
 * @property {{ action: string, button: string, isEnabled: boolean }} [give] Second bouton :
 *   donner l'objet d'une quête à ce PNJ (R-IHM-INS-005).
 * @property {{ button: string, isEnabled: boolean, warning?: string }} [sleep] Second bouton :
 *   dormir près d'un feu de camp (R-IHM-INS-008).
 */

const CLOSE_KEY = 'Escape';

/**
 * Logique de la fenêtre d'information (R-IHM-INS-002 à 005), sans DOM : ce qui est inspecté,
 * ce que la fenêtre affiche, et l'action du bouton (récolter ou parler).
 */
export class InspectionController {
  /** Crée un contrôleur dont la fenêtre est fermée. */
  constructor() {
    /** @type {Target | undefined} */
    this.selected = undefined;
  }

  /** `true` si la fenêtre est ouverte. */
  get isOpen() {
    return this.selected !== undefined;
  }

  /**
   * R-IHM-INS-002, R-IHM-INS-005 : un PNJ ou un élément récoltable ouvre la fenêtre ; toute autre
   * tuile la ferme.
   * @param {Target | undefined} target Ce qui est désigné (`undefined` hors de la carte).
   * @param {InspectableGame} game
   */
  designate(target, game) {
    this.selected = isInspectable(target, game) ? { ...target } : undefined;
  }

  /** R-IHM-INS-004 : ferme la fenêtre. */
  close() {
    this.selected = undefined;
  }

  /**
   * R-IHM-INS-004 : la touche Échap ferme la fenêtre.
   * @param {string} key Valeur de `KeyboardEvent.key`.
   * @returns {boolean} `true` si la touche a été utilisée.
   */
  handleKey(key) {
    if (key !== CLOSE_KEY || !this.isOpen) {
      return false;
    }
    this.close();
    return true;
  }

  /**
   * Contenu à afficher ; recalculé à chaque image pour suivre les déplacements du joueur.
   * @param {InspectableGame} game
   * @returns {InspectionView | undefined} `undefined` si la fenêtre est fermée.
   */
  view(game) {
    const { selected } = this;
    if (selected === undefined) {
      return undefined;
    }
    const view = 'npcId' in selected ? npcView(selected.npcId, game) : tileView(selected, game);
    if (view === undefined) {
      this.close(); // L'élément a disparu (récolté) : rien à afficher.
    }
    return view;
  }

  /**
   * R-IHM-INS-008 : bouton « Dormir » ; la fenêtre se ferme si le joueur s'est endormi.
   * @param {InspectableGame} game
   * @returns {CommandResult | undefined} `undefined` si aucune tuile n'est désignée.
   */
  sleep(game) {
    const { selected } = this;
    if (selected === undefined || 'npcId' in selected) {
      return undefined;
    }
    const result = game.execute(goAndAct(sleepBy(selected)));
    if (result.ok) {
      this.close();
    }
    return result;
  }

  /**
   * Second bouton de la fenêtre : « Donner » pour un PNJ, « Dormir » pour un feu de camp.
   * @param {InspectableGame} game
   * @returns {CommandResult | undefined}
   */
  secondary(game) {
    return this.selected !== undefined && 'npcId' in this.selected
      ? this.give(game)
      : this.sleep(game);
  }

  /**
   * R-IHM-INS-005 : bouton « Donner » ; la fenêtre se ferme si le don réussit.
   * @param {InspectableGame} game
   * @returns {CommandResult | undefined} `undefined` si aucun PNJ n'est désigné.
   */
  give(game) {
    const { selected } = this;
    if (selected === undefined || !('npcId' in selected)) {
      return undefined;
    }
    const result = game.execute(goAndAct(giveTo(selected.npcId)));
    if (result.ok) {
      this.close();
    }
    return result;
  }

  /**
   * R-IHM-INS-003, R-IHM-INS-005 : action du bouton ; la fenêtre se ferme si elle réussit.
   * @param {InspectableGame} game
   * @returns {CommandResult | undefined} `undefined` si la fenêtre est fermée.
   */
  confirm(game) {
    const { selected } = this;
    if (selected === undefined) {
      return undefined;
    }
    const command = commandFor(selected, game);
    const isRekindledHere = command.type === 'REKINDLE' && game.inspect(command).isInReach;
    const result = game.execute(goAndAct(command)); // R-JOU-DEP-005 : de loin, il s'approche.
    // R-IHM-INS-008 : la fenêtre d'un feu de camp ravivé sur place reste ouverte.
    if (result.ok && !isRekindledHere) {
      this.close();
    }
    return result;
  }
}

/**
 * @param {Target | undefined} target
 * @param {InspectableGame} game
 * @returns {boolean}
 */
function isInspectable(target, game) {
  if (target === undefined) {
    return false;
  }
  if ('npcId' in target) {
    return game.inspectNpc(target.npcId).exists;
  }
  const inspection = game.inspect(target);
  return (
    inspection.harvest !== undefined ||
    inspection.search !== undefined ||
    inspection.campfire !== undefined
  );
}

/**
 * Commande du bouton : parler, fouiller ou récolter.
 * @param {Target} target
 * @param {InspectableGame} game
 * @returns {import('../../core/commands/commands.js').GoAndActCommand['action']}
 */
function commandFor(target, game) {
  if ('npcId' in target) {
    return talkTo(target.npcId);
  }
  const inspection = game.inspect(target);
  if (inspection.campfire !== undefined) {
    return inspection.campfire.isHearth ? sleepBy(target) : rekindle(target);
  }
  return inspection.search === undefined ? harvestTile(target) : searchTile(target);
}

/**
 * @param {{ column: number, row: number }} tile
 * @param {InspectableGame} game
 * @returns {InspectionView | undefined}
 */
function tileView(tile, game) {
  const inspection = game.inspect(tile);
  const title = TEXTS.tileNames[inspection.tileId] ?? inspection.tileId;
  // R-JOU-DEP-005 : de loin, le bouton reste actif ; le héros s'approchera.
  const reach = { isActionEnabled: true };
  if (inspection.campfire !== undefined) {
    return campfireView({ ...inspection, campfire: inspection.campfire });
  }
  if (inspection.search !== undefined) {
    // R-IHM-INS-006 : un élément à fouiller.
    return { title, action: TEXTS.searchAction, button: TEXTS.searchAction, ...reach };
  }
  if (inspection.harvest === undefined) {
    return undefined;
  }
  const { tool } = inspection.harvest;
  return {
    title,
    action: harvestLabel({ ...inspection, harvest: inspection.harvest }),
    button: TEXTS.harvestButton,
    // R-IHM-INS-007 : l'outil manquant passe avant la distance.
    ...(inspection.hasTool || tool === undefined
      ? reach
      : { isActionEnabled: false, warning: TEXTS.toolNeeded[tool] }),
  };
}

/**
 * @param {string} npcId
 * @param {InspectableGame} game
 * @returns {InspectionView | undefined}
 */
function npcView(npcId, game) {
  const inspection = game.inspectNpc(npcId);
  if (!inspection.exists) {
    return undefined;
  }
  return {
    title: CONTENT_TEXTS.npcNames[npcId]?.full ?? npcId,
    action: TEXTS.talkAction,
    button: TEXTS.talkAction,
    isActionEnabled: true,
    ...(inspection.giveableItem === undefined
      ? {}
      : {
          give: {
            action: TEXTS.giveAction(
              TEXTS.itemNames[inspection.giveableItem]?.inline ?? inspection.giveableItem,
            ),
            button: TEXTS.giveButton,
            isEnabled: true,
          },
        }),
  };
}

/**
 * @param {string} resource
 * @param {number} amount
 * @returns {string} Nom de la ressource accordé à la quantité.
 */
export function resourceNoun(resource, amount) {
  const noun = TEXTS.resourceNouns[resource];
  if (noun === undefined) {
    return resource;
  }
  return amount > 1 ? noun.many : noun.one;
}
