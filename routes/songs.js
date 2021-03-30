const express = require('express');
const router = express.Router();
const songsCtrl = require('../controllers/songs');

// POST /playlists/:id/songs
router.post('/playlists/:id/songs', songsCtrl.create);

router.delete('/songs/:id', songsCtrl.delete);

module.exports = router;

// user._id = 605e46dec378fa970f4fd5b0