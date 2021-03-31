const Playlist = require('../models/playlist');

module.exports = {
  create,
  delete: deleteOne,
}

function deleteOne(req, res) {
  Playlist.findOne(
    {'songs._id': req.params.id}, function(err, playlist) {
      playlist.songs.remove(req.params.id);
      playlist.save(function(err) {
        res.redirect(`/playlists/${playlist._id}`);
      });
    }
  )
}

function create(req, res) {
  Playlist.findById(req.params.id, function(err, playlist) {
    playlist.songs.push(req.body);
    playlist.save(function(err) {
      res.redirect(`/playlists/${playlist._id}`);
    });
  });
}