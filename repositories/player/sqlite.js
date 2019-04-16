'use strict';

const argon2 = require('argon2');
const assert = require('assert').strict;
const config = require('config');
const util = require('util');
const uuid = require('uuid/v4');

module.exports = async db => {

  const dbRunAsync = util.promisify(db.run.bind(db));
  const dbGetAsync = util.promisify(db.get.bind(db));

  const repository = {

    createPlayer: async (username, password) => {
      const id = uuid();

      /* This has to go first;
       *
       * the other tables have a foreign key constraint on the player ID in
       * this table. */

      const passwordHash = await argon2.hash(password);
      await dbRunAsync(`INSERT INTO Players VALUES (?, ?, ?, datetime('now'));`, id, username, passwordHash)

      /* Promise golf! */

      return Promise.all(
        [
          dbRunAsync('INSERT INTO PlayerLocations (player_id, x, y, map) VALUES (?, ?, ?, ?);',
            id,
            config.get('playerDefaults.location.x'),
            config.get('playerDefaults.location.y'),
            config.get('playerDefaults.location.map'))
        ]
      );

    },

    authPlayer: async (username, password) => {
      assert(username != null);
      assert(username.length > 0);
      assert(password != null);

      const passwordHash = (await dbGetAsync('SELECT password_hash FROM Players WHERE username = ?;', username)).password_hash;
      if (passwordHash == null) {
        return false; // The user doesn't exist.
      }

      return argon2.verify(passwordHash, password);
    },

    playerWithUsernameExists: async username =>
      (await dbGetAsync('SELECT EXISTS (SELECT 1 FROM Players WHERE username = ?) AS player_exists;', username)).player_exists === 1,

    getPlayerIdFromUsername: async username => {
      const row = await dbGetAsync('SELECT id FROM Players WHERE username = ?;', username);
      assert(row);

      return row.id;
    },

    getPlayerPosition: async id => {
      const row = await dbGetAsync('SELECT x, y, map FROM PlayerLocations WHERE player_id = ?;', id);
      assert(row);

      return row;
    }

  };

  /* Create database tables (synchronising on dependencies). */

  await dbRunAsync(`
    CREATE TABLE IF NOT EXISTS Players (
      id TEXT PRIMARY KEY NOT NULL,
      username TEXT NOT NULL UNIQUE,
      password_hash BLOB NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  await Promise.all(
    [
      dbRunAsync(`
        CREATE TABLE IF NOT EXISTS PlayerLocations (
          player_id TEXT NOT NULL REFERENCES Players (id) ON DELETE CASCADE,
          x INTEGER NOT NULL,
          y INTEGER NOT NULL,
          map TEXT NOT NULL,
          PRIMARY KEY (player_id)
        );
      `)
    ]
  );

  return repository;
};
