const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/.+\@.+\..+/, "Please fill a valid email address"],
  },
  passwordHash: {
    type: String,
    required: true,
  },
  profileImageUrl: {
    type: String,
    default: "https://placehold.co/36x36/A044FF/FFFFFF?text=U",
  },
  totalProblemsSolved: {
    type: Number,
    default: 0,
  },
  // --- NEW FIELD: totalSubmissionsCount for acceptance rate calculation ---
  totalSubmissionsCount: {
    type: Number,
    default: 0,
  },
  acceptanceRate: {
    type: Number,
    default: 0.0,
  },
  problemsByDifficulty: [
    {
      difficulty: {
        type: String,
        enum: ["Easy", "Medium", "Hard"],
        required: true,
      },
      count: { type: Number, default: 0 },
    },
  ],
  activityLog: [
    {
      // Changed from Date to String to match YYYY-MM-DD format used in controller for easier lookup
      date: { type: String, required: true },
      problemsSolved: { type: Number, default: 0 },
    },
  ],
  recentSubmissions: [
    {
      problemName: { type: String, required: true },
      language: { type: String, required: true },
      status: {
        type: String,
        enum: [
          "Accepted",
          "Wrong Answer",
          "Time Limit Exceeded",
          "Runtime Error",
          "Compilation Error", // Added 'Compilation Error'
        ],
        required: true,
      },
      timestamp: { type: Date, default: Date.now },
      // --- NEW FIELD: Link to the actual submission document ---
      submissionId: { type: Schema.Types.ObjectId, ref: "Submission" },
    },
  ],
  // --- NEW FIELD: To track problems uniquely solved by the user ---
  solvedProblems: [
    { type: Schema.Types.ObjectId, ref: "Problem" },
  ],
  recommendedProblems: [
    {
      problemName: { type: String, required: true },
      tags: [{ type: String }],
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", UserSchema);
