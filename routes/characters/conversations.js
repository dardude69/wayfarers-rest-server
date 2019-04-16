const express = require('express');
const router = express.Router();

/* Start conversation */

router.put('/api/v2/characters/:characterId/conversations/:playerUsername', (req, res) => {});

/* Finish conversation */

router.delete('/api/v2/characters/:characterId/conversations/:playerUsername', (req, res) => {});

/* Continue conversation */

return router;
