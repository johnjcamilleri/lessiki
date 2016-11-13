/**
 * Ensure that a user is logged in and has access to specified resource
 *
 * Modified version of https://github.com/jaredhanson/connect-ensure-login/blob/master/lib/ensureLoggedIn.js
 *
 * This middleware ensures that a user is logged in.  If a request is received
 * that is unauthenticated, the request will be redirected to a login page (by
 * default to `/login`).
 *
 * Additionally, `returnTo` will be be set in the session to the URL of the
 * current request.  After authentication, this value can be used to redirect
 * the user to the page that was originally requested.
 *
 * Options:
 *   - `redirectTo`   URL to redirect to for login, defaults to _/login_
 *   - `setReturnTo`  set redirectTo in session, defaults to _true_
 *
 * @param {Object} options
 * @return {Function}
 * @api public
 */
module.exports = function checkAccess (options) {
  // Process options
  if (typeof options === 'string') {
    options = { redirectTo: options }
  }
  options = options || {}
  var url = options.redirectTo || '/login'
  var setReturnTo = (options.setReturnTo === undefined) ? true : options.setReturnTo

  return function (req, res, next) {
    // Check logged in
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      if (setReturnTo && req.session) {
        req.session.returnTo = res.locals.baseURL + (req.originalUrl || req.url)
      }
      return res.redirect(url)
    }

    // Check access
    var resource = (req.params.resource) ? req.params.resource : req.query.resource
    if (req.user.access.indexOf(resource) === -1 && req.user.access !== 'all') {
      res.status(401).send('User ' + req.user.username + ' is not authorised to access resource: ' + resource)
      return
      // if (setReturnTo && req.session) {
      //   req.session.returnTo = res.locals.baseURL + (req.originalUrl || req.url)
      // }
      // return res.redirect(url)
    }

    // Ok
    next()
  }
}