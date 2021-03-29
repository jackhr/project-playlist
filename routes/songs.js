const express = require('express');
const router = express.Router();
const songsCtrl = require('../controllers/songs');

// POST /playlists/:id/songs
router.post('/playlists/:id/songs', songsCtrl.create);

module.exports = router;