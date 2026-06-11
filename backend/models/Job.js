const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Please add a job title'],
    trim: true,
  },
  companyName: {
    type: String,
    required: [true, 'Please add a company name'],
    trim: true,
  },
  location: {
    type: String,
    required: [true, 'Please add a location'],
    trim: true,
  },
  type: {
    type: String,
    required: [true, 'Please add a job type'],
    enum: ['Full-time', 'Part-time', 'Contract', 'Remote', 'Internship'],
    default: 'Full-time',
  },
  salary: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  requirements: {
    type: [String],
    default: [],
  },
  skillsRequired: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Job', JobSchema);
