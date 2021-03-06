var express = require('express');
var router = express.Router();
const playlistsCtrl = require('../controllers/playlists');
const isLoggedIn = require('../config/auth');
const setPreviousUrl = require('../config/middleware');

router.get('/new', isLoggedIn, playlistsCtrl.new);

router.get('/:id', setPreviousUrl, playlistsCtrl.show);

router.get('/', setPreviousUrl, playlistsCtrl.index);

router.get('/:id/search', isLoggedIn, playlistsCtrl.newSong);

router.get('/:id/search/results', isLoggedIn, playlistsCtrl.search);

router.post('/', isLoggedIn, playlistsCtrl.create);

router.put('/:id/image', isLoggedIn, playlistsCtrl.editImage);

router.put('/:id/description', isLoggedIn, playlistsCtrl.editDescription);

router.put('/:id/title', isLoggedIn, playlistsCtrl.editTitle);

router.delete('/:id', isLoggedIn, playlistsCtrl.delete);

router.delete('/:id/image', isLoggedIn, playlistsCtrl.deleteCoverImage);

module.exports = router;