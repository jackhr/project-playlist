const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  content: String,
  userId: {type: Schema.Types.ObjectId, ref: 'User'},
  userName: String,
  userAvatar: String,
},
{
  timestamps: true,
});

const songSchema = new Schema({
  title: String,
  artist: String,
},
{
  timestamps: true,
});

const playlistSchema = new Schema({
  title: String,
  songs: [songSchema],
  comments: [commentSchema],
  user: {type: Schema.Types.ObjectId, ref: 'User'}
},
{
  timestamps: true,
});

module.exports = mongoose.model('Playlist', playlistSchema);