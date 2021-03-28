const User = require('../models/user');
const token = process.env.SHAZAM_KEY;
const rootURL = "https://genius.p.rapidapi.com/";
const fetch = require('node-fetch');


// fetch("https://shazam.p.rapidapi.com/search?term=kiss%20the%20rain&locale=en-US&offset=0&limit=5", {
// 	"method": "GET",
// 	"headers": {
// 		"x-rapidapi-key": token,
// 		"x-rapidapi-host": "shazam.p.rapidapi.com"
// 	}
// });

module.exports = {
  index,
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


