var express = require('express');
var router = express.Router();
const passport = require('passport');
const fetch = require('node-fetch');
const usersCtrl = require('../controllers/users')

/* GET home page. */
router.get('/', usersCtrl.index
// function(req, res, next) {
//   const username = req.query.username;
//   console.log(`username: ${username}`);
//   res.render('index', { title: 'Project PLAYLIST' });
// }
);

// Google OAuth login route
router.get('/auth/google', passport.authenticate(
  'google',
  { scope: ['profile', 'email'] }
));
// Google OAuth callback route
router.get('/oauth2callback', passport.authenticate(
  'google',
  {
    successRedirect : '/',
    failureRedirect : '/'
  }
));
// OAuth logout route
router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

module.exports = router;
