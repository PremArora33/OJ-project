const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
// const { protect } = require('../middlewares/authMiddleware'); // Assuming you have an auth middleware

// @route   PATCH /api/users/:userId
// @desc    Update user profile data (e.g., profileImageUrl)
// @access  Private (requires authentication/authorization)
router.patch('/:userId', userController.updateUserProfile); // You might add 'protect' middleware here later: router.patch('/:userId', protect, userController.updateUserProfile);

module.exports = router;
