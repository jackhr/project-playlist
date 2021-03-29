var express = require('express');
var router = express.Router();
const passport = require('passport');
const fetch = require('node-fetch');
const playlistsCtrl = require('../controllers/playlists')

router.get('/new', playlistsCtrl.new);

router.get('/:id', playlistsCtrl.show);

router.get('/', playlistsCtrl.index);

router.get('/:id/search', playlistsCtrl.newSong);

router.get('/:id/search/results', playlistsCtrl.search);

router.post('/', playlistsCtrl.create);

module.exports = router;