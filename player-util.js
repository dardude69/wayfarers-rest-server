const assert = require('assert').strict;
const basicAuth = require('basic-auth');

module.exports = {

  basicAuthExpectPlayer: async (username, playerRepository) => {
    assert(username);
    assert(username.length > 0);

    return async (req, res, next) => {
      const user = basicAuth(req);

      if (user == null
        || user.name.length == 0
        || !(await playerRepository.authPlayer(user.name, user.pass))) {

        return res
          .set('WWW-Authenticate', `Basic realm="Wayfarer's Rest"`)
          .sendStatus(401); // Unauthorized
      }

      if (user.name != username) {
        return res.sendStatus(403); // Forbidden
      }

      next();
    };
  },

  /* Lazy initialise/retrieve player state object from game state. */

  getPlayerState: async (id, gameState, playerRepository) => {
    let playerState = gameState.players[id];

    if (playerState == null) {
      /* Whenever a value is set on playerState, record the time it happened.
       * Used to "log out" inactive players. */
      const handler = {
        set: (target, property, value) => {
          assert(property !== 'updatedAt'); // Don't be dumb.

          target.updatedAt = Date.now();
          return Reflect.set(target, property, value);
        }
      };

      playerState = new Proxy({}, handler);
      playerState.location = await playerRepository.getPlayerLocation(id);
      playerState.username = await playerRepository.getPlayerUsernameFromId(id);

      gameState.players[id] = playerState;
    }

    return playerState;
  }

};
