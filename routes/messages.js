'use strict';

const censor = require('../censor');
const express = require('express');
const playerUtil = require('../player-util');

module.exports = (gameState, playerRepository) => {

  const validatePostJsonSchema = (req, res, next) => {
    const { sender, content } = req.body;

    if (sender == null || sender.username == null) {
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
      return res.sendStatus(404);
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
    (req, res, next) => {
      if (process.env.CENSOR_MESSAGE_CONTENT) {
        req.body.content = censor(req.body.content);
      }

      next();
    },
    async (req, res) => {
      const [ username, content ] = [ req.body.sender.username, req.body.content ];
      const id = await playerRepository.getPlayerIdFromUsername(username);

      gameState.messages.push({
        sender: {
          id,
          username
        },
        content
      });

      return res.sendStatus(204);
    });

  return router;
};
