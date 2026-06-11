const express = require('express');
const {
  applyJob,
  getSeekerApplications,
  getEmployerApplications,
  updateApplicationStatus,
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Route to apply for a job (includes resume file upload)
router.post(
  '/apply/:jobId',
  protect,
  authorize('seeker'),
  (req, res, next) => {
    // Custom error handling for multer
    upload.single('resume')(req, res, function (err) {
      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
      next();
    });
  },
  applyJob
);

// Get applications lists by role
router.get('/seeker', protect, authorize('seeker'), getSeekerApplications);
router.get('/employer', protect, authorize('employer'), getEmployerApplications);

// Update status of an application
router.put('/:id/status', protect, authorize('employer'), updateApplicationStatus);

module.exports = router;
