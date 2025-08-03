const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
// const { protect } = require('../middlewares/authMiddleware'); // Assuming you have an auth middleware

// @route   GET /api/dashboard/:userId
// @desc    Get dashboard data for a specific user
// @access  Private (requires authentication/authorization)
router.get('/:userId', dashboardController.getDashboardData); // You might add 'protect' middleware here later: router.get('/:userId', protect, dashboardController.getDashboardData);

module.exports = router;
