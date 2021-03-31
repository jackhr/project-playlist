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
};

function newSong(req, res) {
  Playlist.findById(req.params.id, function(err, playlist) {
    res.render('playlists/add-song', { playlist, title: playlist.title });
  });
}

function show(req, res) {
   Playlist.findById(req.params.id).populate('user').exec(function(err, playlist) {
     res.render('playlists/show', { playlist, title: `${playlist.title} playlist` })
   })
}

function create(req, res) {
  const playlist = new Playlist(req.body);
  playlist.user = req.user._id;
  console.log("new playlist: ", playlist, '\n', 'req.user: ', req.user)
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
      track.duration = minutes + ":" + seconds;
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

function index(req, res) {
  Playlist.find({})
  .sort('title')
  .populate('user').exec(function(err, playlists) {
    if (err) console.log(err);
    console.log(playlists);
    res.render('playlists/index', { playlists, title: 'ALL PLAYLISTS' });
  });
}

function deleteOne(req, res) {
  Playlist.findByIdAndDelete(req.params.id, function(err, playlist) {
    console.log(playlist)
    if (err) console.log(err);
    res.redirect(`/users/${playlist.user}`);
  })
}