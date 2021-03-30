const Playlist = require('../models/playlist');

module.exports = {
  create,
  delete: deleteOne,
}

function deleteOne(req, res) {

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