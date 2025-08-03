const User = require('../models/User');

// @desc    Update user profile data (e.g., profileImageUrl)
// @route   PATCH /api/users/:userId
// @access  Private (requires authentication/authorization)
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { profileImageUrl } = req.body;

    // In a real application, you'd add authorization here:
    // Make sure the authenticated user is allowed to update this profile
    // if (!req.user || req.user.id !== userId) {
    //   return res.status(403).json({ message: 'Not authorized to update this user profile' });
    // }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update only the profileImageUrl if provided
    if (profileImageUrl) {
      user.profileImageUrl = profileImageUrl;
    }

    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        profileImageUrl: user.profileImageUrl
      }
    });

  } catch (error) {
    console.error('❌ Error updating user profile:', error);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
};
