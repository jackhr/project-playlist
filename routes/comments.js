const express = require('express');
const router = express.Router();
const commentsCtrl = require('../controllers/comments');

// POST /playlists/:id/songs
router.post('/playlists/:id/comments', commentsCtrl.create);

router.delete('/comments/:id', commentsCtrl.delete);

module.exports = router;