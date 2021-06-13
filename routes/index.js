var express = require('express');
var router = express.Router();
const passport = require('passport');
const isLoggedIn = require('../config/auth');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index')
});

// Google OAuth login route
router.get('/auth/google', function(req, res, next) {
  passport.authenticate(
    'google',
    { scope: ['profile', 'email'] }
  )(req, res, next);
});
// Google OAuth callback route
router.get('/oauth2callback', function(req, res, next) {
  passport.authenticate('google', function(err, user) {
    if (err) return next(err);
    if (!user) return res.redirect('/');
    req.logIn(user, function(err) {
      if (err) return next(err);
      res.redirect(req.session.returnTo || '/');
      return delete req.session.returnTo;
    });
  })(req, res, next);
});
// OAuth logout route
router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

function test(req, res, next) {
  console.log(req.originalUrl);
  next();
}

module.exports = router;
