const express = require('express');
const router = express.Router();
const TutorSession = require('../models/TutorSession');
const { sendEmailToAdmin } = require('../emailService');  // Correctly destructure the function

// Display the tutor form (only if logged in)
router.get('/', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }

  try {
    // Retrieve all tutor sessions from MongoDB
    const tutorSessions = await TutorSession.find();
    // Render the tutor form and pass the tutor sessions to the view
    res.render('tutorForm', { user: req.user, tutorSessions });
  } catch (err) {
    console.error('Error retrieving tutor sessions:', err);
    res.render('tutorForm', { user: req.user, tutorSessions: [] });
  }
});

// Handle tutor form submission
router.post('/log', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }

  const { date, location, description, duration } = req.body;

  // Create a new tutor session document with data from the form
  const newSession = new TutorSession({
    tutorName: req.user.displayName,
    date,
    location,
    description,
    duration,
  });

  try {
    // Save the new session to MongoDB
    await newSession.save();
    // Send an email to the admin with the session details
    sendEmailToAdmin(newSession);  // Call the function to send the email
    // Redirect to the tutor page after logging the session
    res.redirect('/tutor');
  } catch (err) {
    console.error('Error saving session:', err);
    res.redirect('/tutor');
  }
});

module.exports = router;
