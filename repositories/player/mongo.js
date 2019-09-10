'use strict';

const argon2 = require('argon2');
const assert = require('assert').strict;
const config = require('config');

module.exports = async db => {

  const repository = {
    createPlayer: async (username, password) => {

      // NOTE: id is just going to be the automatically assigned _id.

      const passwordHash = await argon2.hash(password);

      const location = {
        x: config.get('playerDefaults.location.x'),
        y: config.get('playerDefaults.location.y'),
        map: config.get('playerDefaults.location.map')
      };

    },

    authPlayer: async (username, password) => {
      assert(username != null);
      assert(username.length > 0);
      assert(password != null);

      const passwordHash = 'meme'; // FIXME: get from DB

      return argon2.verify(passwordHash, password);
    },

    playerWithUsernameExists: async username => false, // FIXME: Check in DB

    getPlayerIdFromUsername: async username => '', // FIXME: Get from DB

    getPlayerUsernameFromId: async id => '', // FIXME: Get from DB

    getPlayerLocation: async id => ({ x: 0, y: 0, map: './maps/basement.json' }), // FIXME: Get from DB
  };

  // FIXME
  /* "Schema creation" -- not sure what this looks like in Mongo.
   * Setting up collections? */

  return repository;

};
