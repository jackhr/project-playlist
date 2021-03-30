const Playlist = require('../models/playlist');

module.exports = {
  create,
}

function create(req, res) {
  Playlist.findById(req.params.id, function(err, playlist) {
    playlist.songs.push(req.body);
    playlist.save(function(err) {
      res.redirect(`/users/${playlist.user}`);
    });
  });
}