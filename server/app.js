const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const path = require('path');
const cors = require('cors');
const cron = require('./cron/cron');

const app = express();

// Passport Config
require('./config/passport')(passport);

// DB Config
const db = process.env.MONGO_URI;

// Connect to MongoDB
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Express body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Express session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../organizer-app/build')));

// Handle all other routes by serving the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../organizer-app/build', 'index.html'));
});

// Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/notifications', require('./routes/notifications'));

// Start server
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
