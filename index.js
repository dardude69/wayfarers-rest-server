const config = require('config');
const fs = require('fs');
const https = require('https');
const sqlite3 = require('sqlite3');
const util = require('util');

const app = require('express')();

(async () => {

  const db = new sqlite3.Database(config.get('databaseFilePath'));
  await util.promisify(db.run.bind(db))('PRAGMA foreign_keys = ON;');

  const [playerRepository] = await Promise.all([require('./repositories/player/sqlite')(db)]);








  // TODO: Load from file, db, etc.
  // TODO: Proxy.

  const gameState = {
    players: {

      

    },

    messages: {}
  };







  /* Don't start serving until async dependency setup is complete.
   * It makes the code easier to reason about. */

  app.use('/api/v1/messages', require('./routes/messages')(gameState));
  app.use('/api/v1/players', require('./routes/players')(gameState, playerRepository));
  app.use('/api/v1/snapshots', require('./routes/snapshots')(gameState));

  const options = {
    cert: fs.readFileSync(config.get('tls.certFilePath')),
    key: fs.readFileSync(config.get('tls.keyFilePath'))
  };

  https.createServer(options, app).listen(config.get('port'));

})();

// TODO: Catch close event, close all resources gracefully.
