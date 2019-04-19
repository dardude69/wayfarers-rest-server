'use strict';

const express = require('express');

module.exports = gameState => {
  const router = express.Router();

  router.get('/', (req, res) => {
    res.json(gameState.messages);
  });

  router.post('/', express.json(), (req, res) => {
    if (req.body.body == null) {
      return res.sendStatus(400);
    }

    gameState.messages.push(req.body);
    gameState.messages = gameState.messages.slice(-32);

    res.sendStatus(204);
  });

  return router;
};
