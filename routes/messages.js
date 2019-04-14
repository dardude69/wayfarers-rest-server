'use strict';

module.exports = gameState => {

  const nextId = (() => {
    let id = 0;
    return () => id++;
  })();

  const express = require('express');
  const router = express.Router();

  router.get('/', (req, res) => {
    // XXX: Might want to limit this later...
    res.json(gameState.messages);
  });

  // TODO: Auth
  router.post('/', express.json(), (req, res) => {
    if (req.body.body == null) {
      return res.sendStatus(400);
    }

    // TODO: Validate other fields

    const id = nextId();

    gameState.messages[id] = req.body;
    res.sendStatus(204);
  });

  return router;

};
