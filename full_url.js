module.exports = req => req.protocol + '://' + req.get('Host') + require('url').parse(req.originalUrl).pathname;
