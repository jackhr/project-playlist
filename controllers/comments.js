const Playlist = require('../models/playlist');

module.exports = {
  create,
  delete: deleteOne,
}

function deleteOne(req, res) {
  Playlist.findOne(
    {'comments._id': req.params.id, 'comments.userId': req.user._id},
    function(err, playlist) {
      if (!playlist || err) return res.redirect(`/playlists/${playlist._id}`);
      // Remove the subdoc (https://mongoosejs.com/docs/subdocs.html)
      playlist.comments.remove(req.params.id);
      // Save the updated playlist
      playlist.save(function(err) {
        // Redirect back to the playlist's show view
        res.redirect(`/playlists/${playlist._id}`);
      });
    }
  );
}

function create(req, res) {
  Playlist.findById(req.params.id, function(err, playlist) {
    console.log(req.body);
    req.body.userId = req.user._id;
    req.body.userName = req.user.name;
    req.body.userAvatar = req.user.avatar;
    playlist.comments.push(req.body);
    playlist.save(function(err) {
      res.redirect(`/playlists/${playlist._id}`);
    });
  });
}