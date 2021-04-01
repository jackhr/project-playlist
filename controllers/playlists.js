const Playlist = require('../models/playlist');
const token = process.env.SHAZAM_KEY;
const rootURL = "https://genius.p.rapidapi.com/";
const fetch = require('node-fetch');

module.exports = {
  index,
  new: newPlaylist,
  create,
  search,
  show,
  newSong,
  delete: deleteOne,
  editDescription,
  editImage,
};

function editImage(req, res) {
  Playlist.findById(req.params.id, function(err, playlist) {
    playlist.img = req.body.img;
    playlist.save(function(err) {
      res.redirect(`/playlists/${req.params.id}`);
    });
  });
}
function editDescription(req, res) {
  Playlist.findById(req.params.id, function(err, playlist) {
    playlist.about = req.body.about;
    playlist.save(function(err) {
      res.redirect(`/playlists/${req.params.id}`);
    });
  });
}

function newSong(req, res) {
  Playlist.findById(req.params.id, function(err, playlist) {
    res.render('playlists/add-song', { playlist, title: playlist.title });
  });
}

function show(req, res) {
   Playlist.findById(req.params.id).populate('user').exec(function(err, playlist) {
     let about = playlist.about;
     res.render('playlists/show', { about, playlist, title: `${playlist.title} playlist` })
   })
}

function create(req, res) {
  const playlist = new Playlist(req.body);
  playlist.user = req.user._id;
  // console.log("new playlist: ", playlist, '\n', 'req.user: ', req.user)
  playlist.save(function(err) {
    if (err) console.log(err);
    res.redirect(`/playlists/${playlist._id}`);
  });
}

function newPlaylist(req, res) {
  res.render('playlists/new', { title: 'New Playlist' });
}

function search(req, res) {
  const q = req.query.q;
  const options = {
	"method": "GET",
	"headers": {
		"x-rapidapi-key": token,
		"x-rapidapi-host": "deezerdevs-deezer.p.rapidapi.com"
	}
  }
  fetch(`${rootURL}search?q=${q}`, options)
  .then(res => res.json())
  .then(searchData => {
    const tracks = searchData.data.map(track => {
      let minutes = Math.floor(track.duration/60).toString();
      let seconds = (track.duration % 60).toString();
      if (seconds.length === 1) seconds = "0" + seconds;
      track.time = minutes + ":" + seconds;
      console.log(track.time, track.duration)
      return track;
    });
    Playlist.findById(req.params.id, function(err, playlist) {
      res.render('playlists/results', { q, playlist, tracks, title: `Song Search for ${playlist.title} playlist` });
    });
  })
  .catch(err => {
    console.log(err)
  });
}

function timeConverter(num) {
  let mins = Math.floor(num/60).toString();
  let secs = (num % 60).toString();
  if (mins >= 60) {
    secs = (mins % 60).toString();
    let hrs = Math.floor(mins/60).toString()
    if (secs < 1) return hrs + " hr";
    return hrs + " hr, " + secs + " min"
  }
  return mins + " min"
}

function index(req, res) {
  Playlist.find({})
  .sort('title')
  .populate('user').exec(function(err, playlists) {
    if (err) console.log(err);
    let playLength = 0;
    playlists.forEach(pl => {
      playLength = pl.songs.reduce((acc, s) => {
        console.log(s.time, s.duration);
        return acc + s.duration;
      }, 0);
    });
    console.log(playLength);
    playLength = timeConverter(playLength);
    console.log(playLength);
    res.render('playlists/index', { playLength, playlists, title: 'ALL PLAYLISTS' });
  });
}

function deleteOne(req, res) {
  Playlist.findByIdAndDelete(req.params.id, function(err, playlist) {
    console.log(playlist)
    if (err) console.log(err);
    res.redirect(`/users/${playlist.user}`);
  })
}