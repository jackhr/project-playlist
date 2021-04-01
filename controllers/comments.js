const Playlist = require('../models/playlist');

module.exports = {
  create,
  delete: deleteOne,
  update,
}

function update(req, res) {
  Playlist.findOne({'comments._id': req.params.id}, function(err, playlist) {
    const commentSubdoc = playlist.comments.id(req.params.id);
    if (!commentSubdoc.userId.equals(req.user._id)) return res.redirect(`/playlists/${playlist._id}`);
    commentSubdoc.content = req.body.content;
    playlist.save(function(err) {
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