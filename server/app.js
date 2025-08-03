const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

// Route imports
const authRoutes = require('./routes/authRoutes');
const problemRoutes = require('./routes/problemRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const userRoutes = require('./routes/userRoutes');
const aiRoutes = require('./routes/aiRoutes');
const submissionRoutes = require('./routes/submissionRoutes');

const app = express();

// ✅ CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',       // Local frontend
  'https://your-deployed-site.com' // Add production URL if deployed
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// ✅ Middleware
app.use(express.json());
app.use(cookieParser());

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/submissions', submissionRoutes); // <--- CRUCIAL CHANGE: Changed base path to '/api/submissions'

// ✅ Optional: Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke on the server!', error: err.message || 'Unknown error' });
});

module.exports = app;
