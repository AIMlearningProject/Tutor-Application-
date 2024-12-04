const express = require('express');
const path = require('path');
const passport = require('passport');
const session = require('express-session');
const mongoose = require('mongoose');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const tutorRoutes = require('./routes/tutorRoutes');
const adminRoutes = require('./routes/adminRoutes');
const TutorSession = require('./models/TutorSession');

// Initialize app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse incoming request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Middleware to serve static files (like CSS)
app.use(express.static(path.join(__dirname, 'public')));

// Middleware for session handling
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret_key',
  resave: false,
  saveUninitialized: true
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Use the routes
app.use('/auth', authRoutes);
app.use('/tutor', tutorRoutes);
app.use('/admin', adminRoutes);

// Set up view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Google OAuth Strategy
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:3000/auth/google/callback',
},
(accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Connect to MongoDB
mongoose.set('debug', true);  // Enable debugging logs
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000  // Timeout set to 30 seconds
})
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);  // Exit the process with a failure code
  });

// Define the route for root "/"
app.get('/', (req, res) => {
  const isAdmin = req.user && req.user.email === process.env.ADMIN_EMAIL;
  res.render('index', { user: req.user, isAdmin });
});

// Define the route for /dashboard
app.get('/dashboard', async (req, res) => {
  if (!req.user) {
    return res.redirect('/');  // Redirect to home if the user is not authenticated
  }

  try {
    let tutorSessions;
    if (req.user.email === process.env.ADMIN_EMAIL) {
      // Admin user can see all tutor sessions
      tutorSessions = await TutorSession.find();
    } else {
      // Regular user can only see their own tutor sessions
      tutorSessions = await TutorSession.find({ tutorName: req.user.displayName });
    }

    res.render('dashboard', { user: req.user, tutorSessions });
  } catch (error) {
    console.error('Error retrieving tutor sessions:', error);
    res.render('dashboard', { user: req.user, tutorSessions: [] });
  }
});

// Handle logout
app.get('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
