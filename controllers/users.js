const User = require('../models/user');
const Playlist = require('../models/playlist');
const token = process.env.SHAZAM_KEY;
const rootURL = "https://genius.p.rapidapi.com/";
const fetch = require('node-fetch');

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


