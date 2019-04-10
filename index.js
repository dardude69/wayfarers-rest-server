const config = require('config');
const fs = require('fs');
const https = require('https');
const sqlite3 = require('sqlite3');

const app = require('express')();

const db = new sqlite3.Database(config.get('databaseFilePath'));
const playerRepository = require('./repositories/player/sqlite')(db);

app.use('/api/v1/players', require('./routes/players')(playerRepository));
app.use('/api/v1/snapshots', require('./routes/snapshots'));

const options = {
  cert: fs.readFileSync(config.get('tls.certFilePath')),
  key: fs.readFileSync(config.get('tls.keyFilePath'))
};

https.createServer(options, app).listen(config.get('port'));
