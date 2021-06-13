const Playlist = require('../models/playlist');

module.exports = {
  create,
  delete: deleteOne,
};

function deleteOne(req, res) {
  Playlist.findOne(
    {'songs._id': req.params.id}, function(err, playlist) {
      playlist.songs.remove(req.params.id);
      playlist.save(function(err) {
        res.redirect(`/playlists/${playlist._id}`);
      });
    }
  );
}

function create(req, res) {
  const lastQuery = JSON.parse(req.body.allTracks);
  delete req.body.allTracks;
  Playlist.findById(req.params.id, function(err, playlist) {
    playlist.songs.push(req.body);
    playlist.save(function(err) {
      res.render(`playlists/add-song`, {
        playlist,
        lastQuery,
        addedSongTitle: req.body.title,
        failed: false,
        tracks: false,
        title: playlist.title
      });
    });
  });
}