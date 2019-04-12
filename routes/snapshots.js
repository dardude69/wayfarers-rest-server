module.exports = world => {

  const router = require('express').Router();

  router.get('/:frame?', (req, res) => {

    /* Time travel! */

    let frame = 0;
    if (req.params.frame) {
      frame = parseInt(req.params.frame);

      if (isNaN(frame)) {
        return res.sendStatus(400);
      }
    }

    // 

    

  });

  return router;
};
