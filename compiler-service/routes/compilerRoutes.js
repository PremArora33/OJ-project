const express = require("express");
const router = express.Router();

const {
  runCode,
  runCodeWithTestCases,
} = require("../controllers/compilerController");

// ✅ Clean endpoints
router.post("/run", runCode);
router.post("/run-with-testcases", runCodeWithTestCases);

module.exports = router;
