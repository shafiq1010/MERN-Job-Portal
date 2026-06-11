const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  seeker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  resumePath: {
    type: String,
    required: [true, 'Please upload a resume'],
  },
  coverLetter: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Shortlisted', 'Accepted', 'Rejected'],
    default: 'Pending',
    required: true,
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Application', ApplicationSchema);
