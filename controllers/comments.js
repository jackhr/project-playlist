const Playlist = require('../models/playlist');

module.exports = {
  create,
  delete: deleteOne,
  update,
}

function update(req, res) {
  // Note the cool "dot" syntax to query on the property of a subdoc
  Playlist.findOne({'comments._id': req.params.id}, function(err, playlist) {
    // Find the comment subdoc using the id method on Mongoose arrays
    // https://mongoosejs.com/docs/subdocs.html
    const commentSubdoc = playlist.comments.id(req.params.id);
    // Ensure that the comment was created by the logged in user
    if (!commentSubdoc.userId.equals(req.user._id)) return res.redirect(`/playlists/${playlist._id}`);
    // Update the text of the comment
    commentSubdoc.content = req.body.content;
    // Save the updated playlist
    playlist.save(function(err) {
      // Redirect back to the playlist's show view
      res.redirect(`/playlists/${playlist._id}`);
    });
  });
}

function deleteOne(req, res) {
  Playlist.findOne(
    {'comments._id': req.params.id, 'comments.userId': req.user._id},
    function(err, playlist) {
      if (!playlist || err) return res.redirect(`/playlists/${playlist._id}`);
      playlist.comments.remove(req.params.id);
      playlist.save(function(err) {
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