// src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const TutorSession = require('../models/TutorSession'); // Adjust path if needed

// Middleware to check if the user is an admin
function isAdmin(req, res, next) {
  if (req.user && req.user.email === 'admin@example.com') {
    return next();
  }
  res.redirect('/'); // Redirect to home if not an admin
}

// Admin Dashboard Route
router.get('/', isAdmin, async (req, res) => {
  try {
    // Retrieve all tutor sessions from MongoDB
    const tutorSessions = await TutorSession.find();
    // Render the admin dashboard view and pass the tutor sessions to the view
    res.render('adminDashboard', { tutorSessions });
  } catch (err) {
    console.error('Error retrieving tutor sessions:', err);
    res.render('adminDashboard', { tutorSessions: [] });
  }
});

module.exports = router;
