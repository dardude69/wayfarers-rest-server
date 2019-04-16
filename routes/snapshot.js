const express = require('express');
const playerUtil = require('../player-util');

module.exports = (gameState, playerRepository) => {
  const router = express.Router();

  router.get('/:playerUsername',
    async (req, res, next) => (await playerUtil.basicAuthExpectPlayer(req.params.playerUsername, playerRepository))(req, res, next),
    async (req, res) => {
      const currentPlayerId = await playerRepository.getPlayerIdFromUsername(req.params.playerUsername);
      const currentPlayerState = await playerUtil.getPlayerState(currentPlayerId, gameState, playerRepository);

      const snapshot = {
        map: {
          collision: gameState.maps[currentPlayerState.location.map].collision,
          tiles: gameState.maps[currentPlayerState.location.map].tiles
        },
        players: {},
        messages: gameState.messages
      };

      /* Players in same map. */

      for ([id, playerState] of Object.entries(gameState.players)) {
        if (playerState.location.map === currentPlayerState.location.map) {
          snapshot.players[id] = playerState;
        }
      }

      res.json(snapshot);
    }
  );

  return router;
};