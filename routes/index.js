const router = require('express').Router();

router.use('/players', require('./players'));

router.use('/snapshots', require('./snapshots'));

module.exports = router;
