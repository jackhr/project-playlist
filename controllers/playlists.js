const Playlist = require('../models/playlist');
const token = process.env.SHAZAM_KEY;

fetch("https://shazam.p.rapidapi.com/search?term=kiss%20the%20rain&locale=en-US&offset=0&limit=5", {
	"method": "GET",
	"headers": {
		"x-rapidapi-key": token,
		"x-rapidapi-host": "shazam.p.rapidapi.com"
	}
});

module.exports = {
  index,
};

function index(req, res) {
  Playlist.find({}, function(err, flights) {
    if (err) console.log(err);
    res.render('playlists/index', { flights });
  });
}

