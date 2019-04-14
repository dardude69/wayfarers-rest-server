'use strict';

/* Create tables in database if they're missing,
 * resolve promise with player repository API to act on database. */

const argon2 = require('argon2');
const assert = require('assert');
const util = require('util');
const uuid = require('uuid/v4');

module.exports = db => new Promise((resolve, reject) => {

  const dbRunAsync = util.promisify(db.run.bind(db));
  const dbGetAsync = util.promisify(db.get.bind(db));

  const repository = {

    createPlayer: async (username, password) => {

      const passwordHash = await argon2.hash(password);
      return dbRunAsync(`INSERT INTO Players VALUES (?, ?, ?, datetime('now'));`,
        uuid(),
        username,
        passwordHash);

    },

    authPlayer: async (username, password) => {
      assert(username != null && username.length > 0 && password != null);

      const passwordHash = (await dbGetAsync('SELECT password_hash FROM Players WHERE username = ?;', username)).password_hash;
      if (passwordHash == null) {
        return false; // The user doesn't exist.
      }

      return argon2.verify(passwordHash, password);

    },

    getPlayerId: username => dbGetAsync('SELECT id FROM Players WHERE username = ?;', username),

    playerExists: async username => (await dbGetAsync('SELECT EXISTS (SELECT 1 FROM Players WHERE username = ?) AS player_exists;', username)).player_exists === 1,
  };

  /* Create database tables, if necessary. */

  const createPlayerTableSql = `
    CREATE TABLE IF NOT EXISTS Players (
      id TEXT PRIMARY KEY NOT NULL,
      username TEXT NOT NULL UNIQUE,
      password_hash BLOB NOT NULL,
      created_at TEXT NOT NULL
    );
  `;

  dbRunAsync(createPlayerTableSql)
    .then(() => resolve(repository))
    .catch(error => reject(error));

});
