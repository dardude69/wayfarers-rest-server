module.exports = (world, playerRepository)=> {

  const express = require('express');
  const router = express.Router();

  router.post('/', express.json(), (req, res) => {

    // TODO: json validation middleware
    // TODO: data validation middleware ("must contain username and password")

    playerRepository.createUser(req.body.username, req.body.password)
      .then(() => res.sendStatus(201))
      .catch(next);

  });

  router.post('/:username/movements', (req, res) => {

    

  });

  return router;

};
