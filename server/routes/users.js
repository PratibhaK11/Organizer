const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/User');

// Utility function to clear cookies
const clearCookies = (res) => {
  res.clearCookie('connect.sid'); // Clear session cookie
  // Add other cookies to clear if needed
};

// Register
router.post('/register', async (req, res) => {
  const { name, email, password, password2 } = req.body;
  const errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (password !== password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ errors: [{ msg: 'Email already exists' }] });
    }

    const newUser = new User({ name, email, password });
    newUser.password = await bcrypt.hash(password, 10);

    await newUser.save();
    clearCookies(res); // Clear cookies on registration
    res.status(201).json({ user: newUser });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(400).json({ msg: info.message });

    req.logIn(user, err => {
      if (err) return next(err);
      clearCookies(res); // Clear cookies on login
      res.status(200).json({ user });
    });
  })(req, res, next);
});

// Logout
router.get('/logout', async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    
    if (userId) {
      // Remove the user's subscription
      await User.findByIdAndUpdate(userId, { subscription: null });

      // Destroy session
      req.logout(err => {
        if (err) return next(err);

        // Clear cookies
        clearCookies(res);

        res.status(200).json({ message: 'Logged out successfully' });
      });
    } else {
      res.status(200).json({ message: 'Already logged out' });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
