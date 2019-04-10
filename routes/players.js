module.exports = playerRepository => {

  const express = require('express');
  const router = express.Router();

  router.post('/', express.json(), (req, res) => {

    const username = req.body.username;
    const password = req.body.password;

    if (username === null || password === null) {
      return res.sendStatus(400);
    }

    playerRepository.createPlayer(username, password);

    res.sendStatus(201);

  });

  router.post('/:username/movements', (req, res) => {
    // TODO
  });

  return router;

}
