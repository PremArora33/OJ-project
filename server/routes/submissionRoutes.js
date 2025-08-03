const express = require('express');
const router = express.Router();
const { handleSubmitCode, handleRunCustomCode } = require('../controllers/submissionController');
const { requireAuth } = require('../middlewares/authMiddleware'); // Import your authentication middleware

// Route for handling code submissions (runs against problem test cases)
// Apply requireAuth middleware here to ensure req.user is populated
router.post('/submit', requireAuth, handleSubmitCode);

// Route for handling custom code runs (runs against single custom input)
router.post('/run-custom', handleRunCustomCode);

// Optional: Add a route to get a user's past submissions if you implement it later
// router.get('/:userId', getSubmissionsByUserId);

module.exports = router;
