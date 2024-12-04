// src/models/TutorSession.js
const mongoose = require('mongoose');

// Define the schema for tutor sessions
const tutorSessionSchema = new mongoose.Schema({
  tutorName: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  duration: {
    type: Number, // in hours
    required: true,
  },
});

const TutorSession = mongoose.model('TutorSession', tutorSessionSchema);

module.exports = TutorSession;
