// server/config/auth.js

module.exports = {
  ensureAuthenticated: function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }

    // For API routes, return a JSON response instead of redirecting
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // For regular HTML routes, redirect to login
    req.flash('error_msg', 'Not authorized');
    res.redirect('/login');
  }
};
