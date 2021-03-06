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

  /* Verify player credentials. */

  router.get('/:username/authentication',
    async (req, res, next) => (await playerUtil.basicAuthExpectPlayer(req.params.username, playerRepository))(req, res, next),
    (req, res) => res.sendStatus(204)
  );

  /* Move player. */

  router.post('/:username/movements',
    async (req, res, next) => (await playerUtil.basicAuthExpectPlayer(req.params.username, playerRepository))(req, res, next),
    express.json(),
    async (req, res) => {
      const id = await playerRepository.getPlayerIdFromUsername(req.params.username);
      const player = await playerUtil.getPlayerState(id, gameState, playerRepository);

      let {x, y, map} = player.location;

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

      const teleporter = gameState.maps[map].teleporters[y][x];
      if (teleporter != null) {
        player.location.map = teleporter.map;
        player.location.x = teleporter.x;
        player.location.y = teleporter.y;

        return res.sendStatus(204);
      }

      player.location.x = x;
      player.location.y = y;

      res.sendStatus(204);
    }
  );

  return router;
};
