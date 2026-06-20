const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  skills: [{
    type: String
  }],
  experience: {
    type: mongoose.Schema.Types.Mixed, // Detailed list or descriptive block
    default: []
  },
  projects: [{
    type: mongoose.Schema.Types.Mixed // List of projects parsed
  }],
  education: {
    type: mongoose.Schema.Types.Mixed, // Education objects
    default: []
  },
  rawText: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Resume', ResumeSchema);
