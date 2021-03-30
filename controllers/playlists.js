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
   Playlist.findById(req.params.id, function(err, playlist) {
     res.render('playlists/show', { playlist, title: `song Search for ${playlist.title} playlist` })
   })
}

function create(req, res) {
  const playlist = new Playlist(req.body);
  console
  playlist.user = req.user._id;
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
      "x-rapidapi-host": "genius.p.rapidapi.com"
    }
  }
  fetch(`${rootURL}search?q=${q}`, options)
  .then(res => res.json())
  .then(searchData => {
    const tracks = searchData.response.hits
    Playlist.findById(req.params.id, function(err, playlist) {
      res.render('playlists/results', { q, playlist, tracks, title: `Song Search for ${playlist.title} playlist` });
    })
  })
  .catch(err => {
    console.log(err)
  });
}

function index(req, res) {
  Playlist.find({}, function(err, playlists) {
    if (err) console.log(err);
    res.render('playlists/index', { playlists, title: 'ALL PLAYLISTS' });
  });
}

function deleteOne(req, res) {
  Playlist.findByIdAndDelete(req.params.id, function(err, playlist) {
    if (err) console.log(err);
    res.redirect(`/user/${playlist.user}`);
  })
}