var express = require('express');
var router = express.Router();
const passport = require('passport');
const fetch = require('node-fetch');
const playlistsCtrl = require('../controllers/playlists')

// GET
router.get('/new', playlistsCtrl.new);

router.get('/', playlistsCtrl.index);

module.exports = router;