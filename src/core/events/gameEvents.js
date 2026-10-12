// @ts-check

/**
 * Catalogue des événements publiés par le métier.
 *
 * | Événement          | Données                                                   |
 * |--------------------|-----------------------------------------------------------|
 * | TILE_CHANGED       | { column, row, tileId } — la tuile a changé de type       |
 * | RESOURCE_HARVESTED | { column, row, resource, amount, total }                  |
 * | ITEMS_FOUND        | { column, row, books, items, resources } — fouille        |
 * | BOOK_READ          | { bookId, recipes } — recettes apprises par cette lecture |
 * | ITEM_CRAFTED       | { recipeId, tool }                                        |
 * | QUEST_STARTED      | { questId, npcId }                                        |
 * | QUEST_COMPLETED    | { questId, npcId, experience } — expérience gagnée        |
 * | DIALOGUE_STARTED   | { npcId }                                                 |
 * | DIALOGUE_ENDED     | { npcId }                                                 |
 * | PLACE_RUMORED      | { placeId, npcId, pageId } — indice reçu                  |
 * | PLACE_DISCOVERED   | { placeId }                                               |
 * | COMMAND_REJECTED   | { command, reason }                                       |
 */
export const GAME_EVENTS = Object.freeze({
  TILE_CHANGED: 'tile-changed',
  RESOURCE_HARVESTED: 'resource-harvested',
  ITEMS_FOUND: 'items-found',
  BOOK_READ: 'book-read',
  ITEM_CRAFTED: 'item-crafted',
  QUEST_STARTED: 'quest-started',
  QUEST_COMPLETED: 'quest-completed',
  DIALOGUE_STARTED: 'dialogue-started',
  DIALOGUE_ENDED: 'dialogue-ended',
  PLACE_RUMORED: 'place-rumored',
  PLACE_DISCOVERED: 'place-discovered',
  COMMAND_REJECTED: 'command-rejected',
});
