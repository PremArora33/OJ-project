const Problem = require('../models/Problem');

// 🔥 CREATE a new problem
exports.createProblem = async (req, res) => {
  console.log("🔥 [POST] /api/problems hit");
  console.log("📥 Request Body:", req.body);

  try {
    // We now have many more fields in the schema.
    // Instead of directly creating from req.body (which is fine if req.body matches schema exactly),
    // it's good practice to destructure and ensure required fields are present,
    // and also to handle the unique constraint error specifically.
    const {
      title,
      problemIdCode, // This is new, and has unique: true
      initialCode,   // This is new
      description,
      inputFormat,   // This is new
      outputFormat,  // This is new
      constraints,   // This is new
      examples,      // This is new
      difficulty,
      timeLimit,
      memoryLimit,   // This is new
      testCases,
      acceptanceRate, // This is new
      totalAttempts,  // This is new
      tags,           // This is new
      sampleInput,    // This is new
      sampleOutput    // This is new
    } = req.body;

    // Basic validation for required new fields (you can add more robust validation)
    if (!title || !problemIdCode || !initialCode || !description || !inputFormat || !outputFormat || !difficulty) {
      return res.status(400).json({ message: "Missing required problem fields." });
    }

    const newProblem = await Problem.create({
      title,
      problemIdCode,
      initialCode,
      description,
      inputFormat,
      outputFormat,
      constraints,
      examples,
      difficulty,
      timeLimit,
      memoryLimit,
      testCases,
      acceptanceRate,
      totalAttempts,
      tags,
      sampleInput,
      sampleOutput
    });

    console.log("✅ Problem created:", newProblem);
    res.status(201).json(newProblem);
  } catch (err) {
    console.error("❌ Error creating problem:", err.message);
    // Handle unique key error for problemIdCode specifically
    if (err.code === 11000 && err.keyPattern && err.keyPattern.problemIdCode) {
      return res.status(409).json({ message: "Problem with this ID code already exists. Please choose a different problemIdCode.", error: err.message });
    }
    res.status(500).json({ message: "Failed to create problem", error: err.message });
  }
};

// 📄 GET all problems
// No changes needed here, as it fetches all problems.
exports.getAllProblems = async (req, res) => {
  try {
    const problems = await Problem.find().sort({ createdAt: -1 });
    console.log(`📦 Returning ${problems.length} problems`);
    res.status(200).json(problems);
  } catch (err) {
    console.error("❌ Failed to fetch problems:", err.message);
    res.status(500).json({ message: "Failed to fetch problems", error: err.message });
  }
};

// 🔍 GET a single problem by ID (MongoDB _id)
// No changes needed here, as it already uses findById(req.params.id)
exports.getProblemById = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id); // Finds by MongoDB _id
    if (!problem) {
      console.warn("⚠️ Problem not found:", req.params.id);
      return res.status(404).json({ message: "Problem not found" });
    }
    res.status(200).json(problem);
  } catch (err) {
    console.error("❌ Error retrieving problem:", err.message);
    // Add specific check for invalid ObjectId format (common error)
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        return res.status(400).json({ message: "Invalid Problem ID format.", error: err.message });
    }
    res.status(500).json({ message: "Error retrieving problem", error: err.message });
  }
};

// ✏️ UPDATE a problem by ID (MongoDB _id)
// No major changes needed, req.body will automatically map to new schema fields
exports.updateProblem = async (req, res) => {
  try {
    // Mongoose will automatically apply updates to new fields if they are in req.body
    // and defined in the schema.
    const updated = await Problem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      console.warn("⚠️ Problem not found for update:", req.params.id);
      return res.status(404).json({ message: "Problem not found" });
    }
    console.log("🔁 Problem updated:", updated);
    res.status(200).json(updated);
  } catch (err) {
    console.error("❌ Failed to update problem:", err.message);
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        return res.status(400).json({ message: "Invalid Problem ID format.", error: err.message });
    }
    // Handle unique constraint error on problemIdCode if updating it to an existing one
    if (err.code === 11000 && err.keyPattern && err.keyPattern.problemIdCode) {
      return res.status(409).json({ message: "Problem with this ID code already exists.", error: err.message });
    }
    res.status(500).json({ message: "Failed to update problem", error: err.message });
  }
};

// ❌ DELETE a problem by ID (MongoDB _id)
// No changes needed, as it already uses findByIdAndDelete(req.params.id)
exports.deleteProblem = async (req, res) => {
  try {
    const deleted = await Problem.findByIdAndDelete(req.params.id);
    if (!deleted) {
      console.warn("⚠️ Problem not found for deletion:", req.params.id);
      return res.status(404).json({ message: "Problem not found" });
    }
    // Log the problemIdCode of the deleted problem for better context
    console.log("🗑️ Problem deleted:", deleted.problemIdCode || deleted._id);
    res.status(200).json({ message: "Problem deleted successfully" });
  } catch (err) {
    console.error("❌ Failed to delete problem:", err.message);
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        return res.status(400).json({ message: "Invalid Problem ID format.", error: err.message });
    }
    res.status(500).json({ message: "Failed to delete problem", error: err.message });
  }
};