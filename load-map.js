/* Load maps saved in Tiled JSON export format.
 *
 * This is *not* a general Tiled map loader.
 * In the interests of saving time, this function currently only loads what I
 * use from Tiled map files.
 *
 * (Level design is *basically* programming, anyway, so I reserve the right to
   * assert freely here.) */

const assert = require('assert').strict;

function loadCollisions(tiledExport, map) {
  map.collisions = [];

  const collisionLayers = tiledExport.layers.filter(layer => layer.name === 'Collision');

  assert(collisionLayers.length < 2, 'multiple collision layers are not supported');
  if (collisionLayers.length === 0) {
    return;
  }

  const collisionLayer = collisionLayers[0];
  const rows = collisionLayer.data.length / collisionLayer.width;

  for (let row = 0; row < rows; ++row) {
    map.collisions[row] =
      collisionLayer.data
        .slice(row * collisionLayer.width, (row+1) * collisionLayer.width)
        .map(tile => tile > 0);
  }
}

function loadTiles(tiledLayer, map) {
}

module.exports = (filePath, gameState) => {
  const map = {};

  const tiledExport = require(filePath);
  assert(!tiledExport.infinite, 'infinite maps are not supported');

  loadCollisions(tiledExport, map);
  loadTiles(tiledExport, map);

  gameState.maps[filePath] = map;
};
