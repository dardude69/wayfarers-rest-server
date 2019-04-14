/* Load maps saved in Tiled JSON export format. */

module.exports = (filePath, gameState) => {
  const tiled = require(filePath);

  const map = {
    collision: [];
  };





  /* Find and load collision layer. */

  const chunks = tiled.layers.map(layer => layer.chunks);
  const chunkPositions = chunks.concat.apply([], chunks).map(chunk => ({ x: chunk.x, y: chunk.y }));

  const minX = chunkPositions.map(p => p.x).reduce((min, current) => Math.min(min, current), 0);
  const minY = chunkPositions.map(p => p.y).reduce((min, current) => Math.min(min, current), 0);

  gameState.maps[filePath] = map;
};
