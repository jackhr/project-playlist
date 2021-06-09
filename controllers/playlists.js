const Playlist = require('../models/playlist');
const rootURL = "https://genius.p.rapidapi.com/";
const fetch = require('node-fetch');
const uuid = require('uuid');
const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const token = process.env.SHAZAM_KEY;
const BASE_URL = process.env.S3_BASE_URL;
const BUCKET = process.env.S3_BUCKET;
const REGION = process.env.REGION;

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
    res.render('playlists/add-song', { playlist, title: playlist.title, failed: false });
  });
}

function show(req, res) {
  Playlist.findById(req.params.id).populate('user').exec(function(err, playlist) {
    playlist.duration = playlist.songs.reduce((acc, s) => acc + s.duration, 0);
    playlist.duration = timeConverter(playlist.duration);
    res.render('playlists/show', { playlist, title: `${playlist.title} playlist` })
  })
}

async function create(req, res) {
  AWSData = await getNewImageUrl(req.files.img);
  const playlist = new Playlist(req.body);
  playlist.img = AWSData.url;
  playlist.AWSKey = AWSData.key;
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
      return track;
    });
    Playlist.findById(req.params.id, function(err, playlist) {
      if (searchData.total === 0) {
        res.render(`playlists/add-song`, { failed: true, playlist, title: playlist.title })
      }
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
    playlists.forEach(pl => {
      pl.duration = pl.songs.reduce((acc, s) => acc + s.duration, 0);
      pl.duration = timeConverter(pl.duration);
    });
    res.render('playlists/index', { playlists, title: 'All Playlists' });
  });
}

function deleteOne(req, res) {
  Playlist.findByIdAndDelete(req.params.id, function(err, playlist) {
    deleteImage(playlist.AWSKey);
    if (err) console.log(err);
    res.redirect(`/users/${playlist.user}`);
  })
}

/*-----Helper Functions-----*/

function generateAWSKey(photo) {
  const hex = uuid.v4().slice(uuid.v4().length-6);
  const fileExtension = photo.mimetype.match(/[/](.*)/)[1].replace('', '.');
  return hex + fileExtension;
}

async function getNewImageUrl(photo) {
  const uploadParams = {
    Bucket: BUCKET,
    Key: generateAWSKey(photo),
    Body: photo.data
  }
  const s3 = new S3Client({ region: REGION });
  const run = async () => {
    try {
      const data = await s3.send(new PutObjectCommand(uploadParams));
      console.log(`Successfully uploaded ${uploadParams.Key}:`, data);
    } catch (err) {
      console.log("Error", err);
    }
  };
  run();
  return {
    url: `${BASE_URL}${BUCKET}/${uploadParams.Key}`,
    key: uploadParams.Key
  }
}

async function deleteImage(key) {
  const uploadParams = {
    Bucket: BUCKET,
    Key: key,
  }
  const s3 = new S3Client({ region: REGION });
  const run = async () => {
    try {
      await s3.send(new DeleteObjectCommand(uploadParams));
      console.log("Successfully deleted", key);
    } catch (err) {
      console.log("Error", err);
    }
  };
  run();
}