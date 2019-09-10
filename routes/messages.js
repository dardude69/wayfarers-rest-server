'use strict';

const express = require('express');
const playerUtil = require('../player-util');

module.exports = (gameState, playerRepository) => {

  const validatePostJsonSchema = (req, res, next) => {
    const { sender, content } = req.body;

    if (sender == null || sender.id == null || sender.username == null) {
      return res.sendStatus(400);
    }

    if (content == null) {
      return res.sendStatus(400);
    }

    next();
  };

  const validatePostSender = async (req, res, next) => {
    const username = req.body.sender.username;

    if (!(await playerRepository.playerWithUsernameExists(username))) {
      return res.sendStatus(409);
    }

    if (req.body.sender.id !== await playerRepository.getPlayerIdFromUsername(username)) {
      return res.sendStatus(409);
    }

    next();
  };

  const router = express.Router();

  router.get('/', (req, res) => {
    res.json(gameState.messages);
  });

  router.post('/',
    express.json(),
    validatePostJsonSchema,
    validatePostSender,
    async (req, res, next) => (await playerUtil.basicAuthExpectPlayer(req.body.sender.username, playerRepository))(req, res, next),
    (req, res) => {
      gameState.messages.push({
        sender: {
          id: req.body.sender.id,
          username: req.body.sender.username
        },
        content: req.body.content
      });

      return res.sendStatus(204);
    });

  return router;
};
