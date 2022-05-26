const router = require('express').Router();

router.all('/', (req, res) => res.sendStatus(402));

module.exports = router;
