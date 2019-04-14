const assert = require('assert');

module.exports = (gameState, playerRepository) => {

  /* Verify HTTP Basic Auth username/password match a username/password hash in
   * the database, and that the given username is also expected. */

  function verifyBasicAuthPlayerIs(username) {
    assert(username && username.length > 0);

    return async (req, res, next) => {
      const user = require('basic-auth')(req);

      if (user == null
        || user.name.length == 0
        || !(await playerRepository.authPlayer(user.name, user.pass))) {
        return res.set('WWW-Authenticate', `Basic realm="Wayfarer's Rest"`).sendStatus(401); // Unauthorized
      }

      if (user.name != username) {
        return res.sendStatus(403); // Forbidden
      }

      next();
    };
  }

  const express = require('express');
  const router = express.Router();

  /* Create player */

  router.post('/', express.json(), async (req, res, next) => {
    if (req.body.username == null || req.body.password == null) {
      return res.sendStatus(400); // Bad request
    }

    if (await playerRepository.playerExists(req.body.username)) {
      return res.sendStatus(409); // Conflict
    }

    playerRepository.createPlayer(req.body.username, req.body.password)
      .then(() => res.sendStatus(204))
      .catch(next);
  });

  /* Move player */

  router.post('/:username/movements',
    (req, res, next) => verifyBasicAuthPlayerIs(req.params.username)(req, res, next),
    express.json(),
    (req, res) => {
      const position = { x: 0, y: 0 }; // TODO: Get from player entity
      const newPosition = position;

      switch (req.body.direction) {
        case 'left':
          --newPosition.x;
          break;
        case 'right':
          ++newPosition.x;
          break;
        case 'up':
          --newPosition.y;
          break;
        case 'down':
          ++newPosition.y;
          break;
        default:
          return res.sendStatus(400); // Bad request
      }

      console.log(newPosition); // XXX

      // TODO: Collision check. If collide, 409 (Conflict).

      res.sendStatus(204);
    });

  return router;

};
