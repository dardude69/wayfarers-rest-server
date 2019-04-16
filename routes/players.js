const assert = require('assert').strict;
const express = require('express');
const playerUtil = require('../player-util');

module.exports = (gameState, playerRepository) => {
  const router = express.Router();

  /* Create player. */

  router.post('/', express.json(), async (req, res, next) => {
    if (req.body.username == null || req.body.password == null) {
      return res.sendStatus(400); // Bad request
    }

    if (await playerRepository.playerWithUsernameExists(req.body.username)) {
      return res.sendStatus(409); // Conflict
    }

    playerRepository.createPlayer(req.body.username, req.body.password)
      .then(() => res.sendStatus(204))
      .catch(next);
  });

  /* Move player. */

  router.post('/:username/movements',
    (req, res, next) => playerUtil.basicAuthExpectPlayer(req.params.username, playerRepository)(req, res, next),
    express.json(),
    async (req, res) => {
      const id = await playerRepository.getPlayerIdFromUsername(req.params.username);
      const player = await playerUtils.getPlayerState(id);

      let {x, y} = player.location;

      switch (req.body.direction) {
        case 'left':
          --x;
          break;
        case 'right':
          ++x;
          break;
        case 'up':
          --y;
          break;
        case 'down':
          ++y;
          break;
        default:
          return res.sendStatus(400); // Bad request
      }

      if (gameState.maps[map].collisions[y][x]) {
        return res.sendStatus(409);
      }

      player.location = {x, y};

      res.sendStatus(204);
    }
  );

  return router;
};
