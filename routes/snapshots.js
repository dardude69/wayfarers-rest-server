module.exports = gameState => {

  const router = require('express').Router();

  router.get('/', (req, res) => {
    const snapshot = {}

    // TODO: Populate snapshot using gamestate.

    res.json(snapshot);
  });

  return router;
};
