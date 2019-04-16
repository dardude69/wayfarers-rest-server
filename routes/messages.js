'use strict';

const express = require('express');

function makeNextMessageId() {
  let id = 0;
  return () => id++;
}

module.exports = gameState => {
  const nextMessageId = makeNextMessageId();

  const router = express.Router();

  router.get('/', (req, res) => {
    res.json(gameState.messages);
  });

  router.post('/', express.json(), (req, res) => {
    if (req.body.body == null) {
      return res.sendStatus(400);
    }

    gameState.messages[nextMessageId()] = req.body;
    res.sendStatus(204);
  });

  return router;
};
