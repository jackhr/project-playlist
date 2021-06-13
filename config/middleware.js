module.exports = function setPreviousUrl(req, res, next) {
  req.session.returnTo = req.originalUrl;
  return next();
}
