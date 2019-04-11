module.exports = playerRepository => {

  const express = require('express');
  const router = express.Router();

  router.post('/', express.json(), (req, res) => {

    // TODO: json validation middleware
    // TODO: data validation middleware ("must contain username and password")

    playerRepository.createUser(req.body.username, req.body.password)
      .then(() => res.sendStatus(201))
      .catch(error => {

        console.error(error);
        res.sendStatus(500);

      });

  });

  router.post('/:username/movements', (req, res) => {
    // TODO
  });

  return router;

}
