const config = require('config');
const fs = require('fs');
const https = require('https');

/* */



/* */

const app = require('express')();

app.use('/api/v1', require('./routes'));

const options = {
  cert: fs.readFileSync(config.get('tls.certFilePath')),
  key: fs.readFileSync(config.get('tls.keyFilePath'))
};

https.createServer(options, app).listen(config.get('port'));
