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
  deleteCoverImage,
  editTitle
};

function timeConverter(duration) {
  let mins = Math.floor(duration / 60).toString();
  let secs = (duration % 60).toString();
  if (mins >= 60) {
    let hrs = Math.floor(mins / 60).toString();
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

function deleteCoverImage(req, res) {
  Playlist.findById(req.params.id, function(err, playlist) {
    if (err) console.log(err);
    console.log(playlist);
    deleteImage(playlist.AWSKey);
    playlist.img = "";
    playlist.AWSKey = "";
    playlist.save(function(err) {
      if (err) console.log(err);
      res.redirect(`/playlists/${req.params.id}`);
    });
  });
}

function editImage(req, res) {
  Playlist.findById(req.params.id).populate('user').exec(async function(err, playlist) {
    if (err) console.log(err);
    if (req.files) {
      if (playlist.img) deleteImage(playlist.AWSKey);
      AWSData = await getNewImageUrl(req.files.img);
      playlist.img = AWSData.url;
      playlist.AWSKey = AWSData.key;
      playlist.save(function(err) {
        if (err) console.log(err);
        setTimeout(function() {
          res.redirect(`/playlists/${req.params.id}`);
        }, 1000);
      });
    } else {
      res.render('playlists/show', { playlist, title: `${playlist.title} playlist`, editFunc: true });
    }
  });
}

function editTitle(req, res) {
  Playlist.findById(req.params.id, function(err, playlist) {
    playlist.title = req.body.title;
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
    res.render('playlists/add-song', {
      playlist,
      title: playlist.title,
      failed: false,
      tracks: false,
      lastQuery: false
    });
  });
}

function show(req, res) {
  Playlist.findById(req.params.id).populate('user').exec(function(err, playlist) {
    playlist.duration = playlist.songs.reduce((acc, s) => acc + s.duration, 0);
    playlist.duration = timeConverter(playlist.duration);
    res.render('playlists/show', {
      playlist,
      title: `${playlist.title} playlist`,
      editFunc: false
    });
  });
}

async function create(req, res) {
  const playlist = new Playlist(req.body);
  if (req.files) {
    AWSData = await getNewImageUrl(req.files.img);
    playlist.img = AWSData.url;
    playlist.AWSKey = AWSData.key;
  }
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
  };
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
        res.render(`playlists/add-song`, {
          q,
          playlist,
          failed: true,
          tracks: false,
          lastQuery: false,
          title: playlist.title
        });
      }
      res.render('playlists/add-song', {
        q,
        tracks,
        playlist,
        failed: false,
        lastQuery: false,
        title: playlist.title
      });
    });
  })
  .catch(err => {
    console.log(err);
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
    if (err) console.log(err);
    if(playlist.AWSKey) deleteImage(playlist.AWSKey);
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
  };
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
  };
}

async function deleteImage(key) {
  const uploadParams = {
    Bucket: BUCKET,
    Key: key,
  };
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