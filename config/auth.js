module.exports = function isLoggedIn(req, res, next) {
  // Pass the req/res to the next middleware/route handler
  if ( req.isAuthenticated() ) return next();
  // Redirect to login if the user is not already logged in
  req.session.returnTo = req.originalUrl; 
  res.redirect('/auth/google');
}

