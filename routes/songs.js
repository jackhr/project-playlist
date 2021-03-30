const express = require('express');
const router = express.Router();
const songsCtrl = require('../controllers/songs');

// POST /playlists/:id/songs
router.post('/playlists/:id/songs', songsCtrl.create);

router.delete('/songs/:id', songsCtrl.delete);

module.exports = router;