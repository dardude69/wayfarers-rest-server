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
const config = require('config');

function getTiles(tiledExport) {
  const tiles = [];

  tiledExport.layers
    .filter(layer => layer.type === 'tilelayer' && layer.name !== 'Collision')
    .forEach(layer => {
      tiles.push(arrayUtil.linearToGrid(layer.data, layer.width));
    });

  return tiles;
}

function getCollisions(tiledExport) {
  const collisionLayers = tiledExport.layers
    .filter(layer => layer.type === 'tilelayer' && layer.name === 'Collision');

  assert(collisionLayers.length < 2, 'multiple collision layers are not supported');
  if (collisionLayers.length === 0) {
    return [];
  }

  const collisionLayer = collisionLayers[0];

  return arrayUtil.linearToGrid(
    collisionLayer.data
      .map(tile => tile > 0),
    collisionLayer.width);
}

function getObjectsOfType(tiledExport, type) {
  /* Get all objects in export with type. */

  const objectLayers = tiledExport.layers.filter(layer => layer.type == 'objectgroup');
  const objects = [].concat.apply([], objectLayers.map(layer => layer.objects))
    .filter(object => object.type == type);

  /* Validate object properties. */

  const tileSize = config.get('tileSize');

  objects.forEach(object => {
    assert((object.x % tileSize) == 0);
    assert((object.y % tileSize) == 0);

    assert(object.width == tileSize);
    assert(object.height == tileSize);

    assert((object.rotation % 90) == 0);
  });

  /* Transform returned objects into a more useful representation. */

  return objects
    .map(tiledObject => {
      const object = {
        x: tiledObject.x / tileSize,
        y: tiledObject.y / tileSize,

        customProperties: {}
      };

      if (tiledObject.properties != null) {
        for (const {name, type, value} of tiledObject.properties) {
          object.customProperties[name] = value;
        }
      }

      return object;
    });
}

function getTeleporters(tiledExport) {
  const teleporters = [];
  for (let y = 0; y < tiledExport.height; ++y) {
    teleporters[y] = new Array(tiledExport.width);
  }

  getObjectsOfType(tiledExport, 'Teleporter')
    .forEach(object => {
      assert(object.customProperties.x);
      assert(object.customProperties.y);
      assert(object.customProperties.map);

      teleporters[object.y][object.x] = {
        x: object.customProperties.x,
        y: object.customProperties.y,
        map: object.customProperties.map,
      }
    });

  return teleporters;
}

module.exports = (filePath, gameState) => {
  const tiledExport = require(filePath);
  assert(!tiledExport.infinite, 'infinite maps are not supported');

  const map = {
    width: tiledExport.width,
    height: tiledExport.height
  };

  map.tiles = getTiles(tiledExport);
  map.collisions = getCollisions(tiledExport);
  map.teleporters = getTeleporters(tiledExport);

  gameState.maps[filePath] = map;
};
