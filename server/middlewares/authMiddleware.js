const jwt = require('jsonwebtoken');
const User = require('../models/User');

const requireAuth = async (req, res, next) => {
  console.log('--- Inside requireAuth middleware ---'); // Debug log: Middleware entered
  const token = req.cookies.token;
  console.log('Token received:', token ? 'Exists' : 'Does NOT exist'); // Debug log: Token presence

  if (!token) {
    console.error('Auth Error: No token found in cookies.'); // Debug log: No token
    return res.status(401).json({ message: 'Unauthorized: No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded payload:', decoded); // Debug log: Decoded token

    // Ensure decoded.id exists and is a valid ID for Mongoose
    if (!decoded.id) {
        console.error('Auth Error: Decoded token missing user ID.');
        return res.status(401).json({ message: 'Unauthorized: Invalid token payload.' });
    }

    req.user = await User.findById(decoded.id).select('-passwordHash');
    if (!req.user) {
      console.error('Auth Error: User not found for decoded ID:', decoded.id); // Debug log: User not found
      return res.status(401).json({ message: 'Unauthorized: User not found.' });
    }
    console.log('User authenticated successfully:', req.user.username, 'ID:', req.user._id); // Debug log: User authenticated
    next(); // Proceed to the next middleware/controller
  } catch (err) {
    console.error('Auth Error: Token verification failed or database error in middleware:', err.message); // Debug log: Catch block error
    res.status(401).json({ message: 'Unauthorized: Token is not valid.' });
  }
};

module.exports = { requireAuth };
