const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  content: String,
  rating: Number,
  user: {type: Schema.Types.ObjectId, ref: 'User'},
});

const songSchema = new Shema({
  title: String,
  artist: String,
});

const playlistSchema = new Schema({
  title: String,
  songs: [songSchema],
  comments: [commentSchema],
  user: {type: Schema.Types.ObjectId, ref: 'User'}
});

// module.exports = mongoose.model('Playlist', playlistSchema);