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
    if (gameState.players[id] == null) {
      /* Whenever a value is set on playerState, record the time it happened.
       * Used to "log out" inactive players. */

      const playerState = {}
      playerState.location = await playerRepository.getPlayerLocation(id);
      playerState.username = await playerRepository.getPlayerUsernameFromId(id);

      const handler = {
        get: (target, property) => {
          if (typeof(target[property]) === 'object' && target[property] !== null) {
            return new Proxy(target[property], handler);
          }
          return Reflect.get(target, property);
        },

        set: (target, property, value) => {
          assert(property !== 'updatedAt'); // Don't be dumb.
          playerState.updatedAt = Date.now();
          return Reflect.set(target, property, value);
        }
      };

      gameState.players[id] = new Proxy(playerState, handler);
    }

    return gameState.players[id];
  }

};
