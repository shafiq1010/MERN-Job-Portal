const Job = require('../models/Job');

// @desc    Get all jobs (with optional search and filters)
// @route   GET /api/jobs
// @access  Public
exports.getJobs = async (req, res) => {
  try {
    const { keyword, location, type } = req.query;
    let query = {};

    // Keyword search (title, companyName, description)
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { companyName: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
      ];
    }

    // Filter by location
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    // Filter by job type
    if (type) {
      query.type = type;
    }

    const jobs = await Job.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single job details
// @route   GET /api/jobs/:id
// @access  Public
exports.getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate({
      path: 'employer',
      select: 'name email profile',
    });

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job listing not found' });
    }

    res.status(200).json({
      success: true,
      job,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create new job posting
// @route   POST /api/jobs
// @access  Private (Employer only)
exports.createJob = async (req, res) => {
  try {
    // Add employer user id to req.body
    req.body.employer = req.user.id;

    // Default companyName from employer profile if not provided
    if (!req.body.companyName && req.user.profile && req.user.profile.companyName) {
      req.body.companyName = req.user.profile.companyName;
    }

    const job = await Job.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Job posting created successfully',
      job,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update a job posting
// @route   PUT /api/jobs/:id
// @access  Private (Employer only)
exports.updateJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job listing not found' });
    }

    // Make sure user is the job owner
    if (job.employer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: `User ${req.user.id} is not authorized to update this job`,
      });
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Job posting updated successfully',
      job,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete a job posting
// @route   DELETE /api/jobs/:id
// @access  Private (Employer only)
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job listing not found' });
    }

    // Make sure user is the job owner
    if (job.employer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: `User ${req.user.id} is not authorized to delete this job`,
      });
    }

    await job.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Job posting deleted successfully',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get jobs posted by the logged-in employer
// @route   GET /api/jobs/employer/myjobs
// @access  Private (Employer only)
exports.getEmployerJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ employer: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
