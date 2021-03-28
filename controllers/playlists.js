const Playlist = require('../models/playlist');
const token = process.env.SHAZAM_KEY;
const rootURL = "https://genius.p.rapidapi.com/";
const fetch = require('node-fetch');


module.exports = {
  index,
  new: newSong,
  create: addSong,
};

function addSong() {

}

function newSong(req, res, next) {
  console.log('here')
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
    res.render('playlists/new', { searchData, title: 'Project PLAYLIST' });
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

