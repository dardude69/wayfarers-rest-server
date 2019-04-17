/* Load maps saved in Tiled JSON export format.
 *
 * This is *not* a general Tiled map loader.
 * In the interests of saving time, this function currently only loads what I
 * use from Tiled map files.
 *
 * (Level design is *basically* programming, anyway, so I reserve the right to
   * assert freely here.) */

const assert = require('assert').strict;
const arrayUtil = require('./array-util');

function loadCollisions(tiledExport, map) {
  const collisionLayers = tiledExport.layers.filter(layer => layer.name === 'Collision');

  assert(collisionLayers.length < 2, 'multiple collision layers are not supported');
  if (collisionLayers.length === 0) {
    map.collisions = [];
    return;
  }

  const collisionLayer = collisionLayers[0];

  map.collisions = arrayUtil.linearToGrid(collisionLayer.data, collisionLayer.width)
    .map(tile => tile > 0);
}

function loadTiles(tiledExport, map) {
  map.tiles = [];

  tiledExport.layers
    .filter(layer => layer.name !== 'Collision')
    .forEach(layer => {
      map.tiles.push(arrayUtil.linearToGrid(layer.data, layer.width));
    });
}

module.exports = (filePath, gameState) => {
  const tiledExport = require(filePath);
  assert(!tiledExport.infinite, 'infinite maps are not supported');

  const map = {
    width: tiledExport.width,
    height: tiledExport.height
  };

  loadCollisions(tiledExport, map);
  loadTiles(tiledExport, map);

  gameState.maps[filePath] = map;
};
