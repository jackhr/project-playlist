const User = require('../models/user');
const Playlist = require('../models/playlist');
const token = process.env.SHAZAM_KEY;
const rootURL = "https://genius.p.rapidapi.com/";
const fetch = require('node-fetch');

module.exports = {
  index,
  show,
}

function show(req, res) {
  Playlist.find({user: req.params.id}, function(err, playlists) {
    if (err) console.log(err);
    res.render('users/show', { playlists, title: 'MY PLAYLISTS' })
  })
}

function index(req, res, next) {
  const q = req.query.q;
  console.log(req.query.q);
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
    res.render('index', { searchData, title: 'Project PLAYLIST' });
  })
  .catch(err => {
    console.log(err)
  });
}


