'use strict';

const config = require('config');
const cors = require('cors');
const express = require('express');
const fs = require('fs');
// const https = require('https');
const http = require('http');
const loadMap = require('./load-map');
const util = require('util');

const sqlite3 = require('sqlite3');

(async () => {

  function update() {

    /* Remove player objects when the player hasn't done anything for
     * a while. */

    Object.keys(gameState.players)
      .filter(key => {
        const updatedAt = gameState.players[key].updatedAt;
        const despawnTime = config.get('playerInactivityDespawnTime');

        return (Date.now()-updatedAt) >= (1000*despawnTime);
      })
      .forEach(key => {
        // TODO: Last chance for serialization.
        delete gameState.players[key]
      });

  }

  // SQLite database support.
  // TODO: Swap for Mongo (mostly for the fun practice of it).
  const db = new sqlite3.Database(config.get('sqliteDatabaseFilePath'));
  await util.promisify(db.run.bind(db))('PRAGMA foreign_keys = ON;');

  const [playerRepository] = await Promise.all([require('./repositories/player/sqlite')(db)]);

  const gameState = {
    maps: {},
    players: {},

    messages: [],
  };

  loadMap('./maps/basement.json', gameState);
  loadMap('./maps/tavern.json', gameState);
  loadMap('./maps/overworld.json', gameState);

  const app = express();
  app.use(cors({ credentials: true, origin: true })); // Free love.
  app.use('/api/v2/microtransactions', require('./routes/microtransactions'));
  app.use('/api/v2/messages', require('./routes/messages')(gameState, playerRepository));
  app.use('/api/v2/players', require('./routes/players')(gameState, playerRepository));
  app.use('/api/v2/snapshot', require('./routes/snapshot')(gameState, playerRepository));

  // const options = {
  //   cert: fs.readFileSync(config.get('tls.certFilePath')),
  //   key: fs.readFileSync(config.get('tls.keyFilePath'))
  // };
  const options = {};
  http.createServer(options, app).listen(config.get('port'));

  setInterval(update, 1000 / config.get('tickrate'));

  console.log('Server started.');

})();

// TODO: Catch close event, close all resources gracefully.
