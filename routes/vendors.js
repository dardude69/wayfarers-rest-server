module.exports = world => {
  const express = require('express');
  const router = express.Router();

  router.post('/:id/sales', express.json(), (req, res) => {

    

  });

  return router;
};
