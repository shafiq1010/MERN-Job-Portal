const Application = require('../models/Application');
const Job = require('../models/Job');

// @desc    Apply for a job
// @route   POST /api/applications/apply/:jobId
// @access  Private (Seeker only)
exports.applyJob = async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const seekerId = req.user.id;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Check if already applied
    const alreadyApplied = await Application.findOne({ job: jobId, seeker: seekerId });
    if (alreadyApplied) {
      return res.status(400).json({ success: false, message: 'You have already applied for this job' });
    }

    // Ensure resume file is uploaded
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a resume' });
    }

    const application = await Application.create({
      job: jobId,
      seeker: seekerId,
      resumePath: `uploads/${req.file.filename}`,
      coverLetter: req.body.coverLetter || '',
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get seeker's submitted applications
// @route   GET /api/applications/seeker
// @access  Private (Seeker only)
exports.getSeekerApplications = async (req, res) => {
  try {
    const applications = await Application.find({ seeker: req.user.id })
      .populate({
        path: 'job',
        select: 'title companyName location type salary description',
      })
      .sort({ appliedAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get employer's incoming applications
// @route   GET /api/applications/employer
// @access  Private (Employer only)
exports.getEmployerApplications = async (req, res) => {
  try {
    // Find all jobs posted by this employer
    const myJobs = await Job.find({ employer: req.user.id }).select('_id');
    const jobIds = myJobs.map((j) => j._id);

    // Find applications for these jobs
    const applications = await Application.find({ job: { $in: jobIds } })
      .populate({
        path: 'job',
        select: 'title companyName',
      })
      .populate({
        path: 'seeker',
        select: 'name email profile',
      })
      .sort({ appliedAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private (Employer only)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['Pending', 'Shortlisted', 'Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const application = await Application.findById(req.params.id).populate('job');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Verify employer is the owner of the job
    if (application.job.employer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update status for this job application',
      });
    }

    application.status = status;
    await application.save();

    res.status(200).json({
      success: true,
      message: `Application status updated to ${status}`,
      application,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
