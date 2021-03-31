const express = require('express');
const router = express.Router();
const songsCtrl = require('../controllers/songs');
const isLoggedIn = require('../config/auth');

// POST /playlists/:id/songs
router.post('/playlists/:id/songs', isLoggedIn, songsCtrl.create);

router.delete('/songs/:id', isLoggedIn, songsCtrl.delete);

module.exports = router;