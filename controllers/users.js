const User = require('../models/user');
const Playlist = require('../models/playlist');

module.exports = {
  index,
  show,
}

function timeConverter(duration) {
  let mins = Math.floor(duration / 60).toString();
  let secs = (duration % 60).toString();
  if (mins >= 60) {
    let hrs = Math.floor(mins / 60).toString()
    let minutes = (mins % 60).toString();
    if (minutes < 1 && secs < 30) return `${hrs} hr`;
    if (secs > 30) {
      return `${hrs} hr, ${(parseInt(minutes) + 1).toString()} min`;
    }
    return `${hrs} hr, ${minutes} min`;
  }
  if (secs > 30) return (parseInt(mins) + 1).toString() + " min";
  return `${mins} min`;
}

function show(req, res) {
  Playlist.find({user: req.params.id})
  .sort('title')
  .populate('user').exec(function(err, playlists) {
    if (err) console.log(err);
    playlists.forEach(pl => {
      pl.duration = pl.songs.reduce((acc, s) => acc + s.duration, 0);
      pl.duration = timeConverter(pl.duration);
    });
    res.render('users/show', { playlists, title: 'MY PLAYLISTS' })
  })
}

function index(req, res) {
  User.find({}, function(err, users) {
    if (err) console.log(err);
    res.render('users/index', { users, title: 'Project PLAYLIST' });
  });
}


