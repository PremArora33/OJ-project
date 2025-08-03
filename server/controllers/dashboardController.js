const User = require("../models/User");

// @desc    Get dashboard data for a specific user

// @route   GET /api/dashboard/:userId

// @access  Private (requires authentication/authorization)

exports.getDashboardData = async (req, res) => {
  try {
    // In a real application, you would typically get the userId from the authenticated user's token

    // For now, we'll use a route parameter or a hardcoded ID for testing.

    // Assuming you have a middleware that attaches user.id to req.user after authentication

    const userId = req.params.userId; // Or req.user.id if using auth middleware // Find the user by ID and select specific dashboard fields

    const user = await User.findById(userId).select(
      "username totalProblemsSolved acceptanceRate problemsByDifficulty activityLog recentSubmissions recommendedProblems"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("❌ Error fetching dashboard data:", error);

    res
      .status(500)
      .json({ message: "Server error while fetching dashboard data" });
  }
};
