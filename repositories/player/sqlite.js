/* Create tables in database if they're missing,
 * resolve promise with player repository API to act on database. */

const argon2 = require('argon2');
const util = require('util');
const uuid = require('uuid/v4');

module.exports = db => new Promise((resolve, reject) => {

  const dbRunAsync = util.promisify(db.run.bind(db));

  const repository = {

    createUser: async (username, password) => {

      const passwordHash = await argon2.hash(password);

      return dbRunAsync(`INSERT INTO Users VALUES (?, ?, ?, datetime('now'));`,
        uuid(),
        username,
        passwordHash);

    },

  };

  /* Create database tables, if necessary. */

  const createUserTableSql = `
    CREATE TABLE IF NOT EXISTS Users (
      id TEXT PRIMARY KEY NOT NULL,
      username TEXT NOT NULL UNIQUE,
      password_hash BLOB NOT NULL,
      created_at TEXT NOT NULL
    );
  `;

  dbRunAsync(createUserTableSql)
    .then(() => resolve(repository))
    .catch(error => reject(error));

});
