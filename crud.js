require('dotenv').config();
require('./config/database');
const User = require('./models/user');

let u, users;

User.find({}, (err, userDocs) => users = userDocs);