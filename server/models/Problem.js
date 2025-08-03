const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  // Renamed 'code' to 'problemIdCode' for clarity as the unique problem identifier
  // This will be used in your URL (e.g., /problems/SUM1001/...)
  problemIdCode: {
    type: String,
    required: true,
    unique: true, // Ensures no two problems have the same short code
  },
  // New field: `initialCode` will hold the boilerplate code for the editor
   initialCode: {
    type: Map, // Use Map for flexible keys like 'cpp', 'java'
    of: String, // Values in the map will be Strings
    default: {}, // Initialize as an empty object
    required: true // Or false, depending on if every problem must have initial code
  },
  description: {
    type: String,
    required: true,
  },
  // New field: input format description
  inputFormat: {
    type: String,
    required: true,
  },
  // New field: output format description
  outputFormat: {
    type: String,
    required: true,
  },
  // New field: constraints as an array of strings
  constraints: {
    type: [String], // An array where each element is a string constraint
    default: [],
  },
  // New field: examples, an array of objects
  examples: [
    {
      input: { type: String, required: true },
      output: { type: String, required: true },
      explanation: { type: String } // Optional explanation for the example
    }
  ],
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true,
  },
  // Time limit in milliseconds (frontend expects ms)
  timeLimit: {
    type: Number,
    default: 2000, // Default to 2 seconds (2000 ms)
  },
  // New field: memory limit in MB
  memoryLimit: {
    type: Number,
    default: 256, // Default to 256 MB
  },
  testCases: [
    {
      input: { type: String, required: true },
      expectedOutput: { type: String, required: true },
      isHidden: {
        type: Boolean,
        default: false,
      }
    }
  ],
  // New field: acceptance rate (can be updated by submission logic)
  acceptanceRate: {
    type: Number,
    default: 0,
  },
  // New field: total attempts (can be updated by submission logic)
  totalAttempts: {
    type: Number,
    default: 0,
  },
  // New field: tags for categorization
  tags: {
    type: [String], // An array where each element is a string tag
    default: [],
  },
  // New field: sample input (for the custom input box default)
  sampleInput: {
    type: String,
    default: '',
  },
  // New field: sample output (optional, but good for display consistency)
  sampleOutput: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Problem', problemSchema);