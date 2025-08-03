const generateFile = require("../utils/generateFile");
const generateInputFile = require("../utils/generateInputFile");

const executeCpp = require("../utils/executeCpp");
const executeC = require("../utils/executeC");
const executeJava = require("../utils/executeJava");
const executePython = require("../utils/executePython");

const fs = require('fs/promises'); // Import fs.promises for async file operations (including cleanup)

// Helper to sanitize output for display (can be shared or defined locally if only used here)
const sanitizeOutput = (output) => {
  return output ? output.replace(/\r\n/g, '\n').trim() : '';
};

// ✅ 1. Direct Code Execution (No test cases)
const runCode = async (req, res) => {
  // --- DEBUGGING CONSOLE.LOGS ---
  console.log('--- Inside Compiler Service: runCode ---');
  console.log('Compiler Service Received req.body for runCode:', req.body);
  const { language = "cpp", code, input = "" } = req.body;
  console.log('Compiler Service: runCode language:', language);
  console.log('Compiler Service: runCode code length:', code ? code.length : 'N/A');
  console.log('Compiler Service: runCode input length:', input ? input.length : 'N/A');
  // --- END DEBUGGING CONSOLE.LOGS ---

  if (!code) {
    return res.status(400).json({ error: "❌ Empty code!" });
  }

  let codePath = null;
  let inputPath = null;
  let compiledBinaryPath = null; // To store path of compiled executable/class dir

  try {
    codePath = await generateFile(language, code);
    inputPath = await generateInputFile(input);

    let executionResult; // Will hold the final output, verdict, time, memory
    let executeFunction; // Points to the specific execute utility (executeCpp, executePython, etc.)

    switch (language) {
      case "cpp":
        executeFunction = executeCpp;
        break;
      case "python":
        executeFunction = executePython;
        // Python is interpreted, no separate compile step needed for single run.
        // Directly execute the script.
        executionResult = await executeFunction(codePath, inputPath);
        compiledBinaryPath = null; // No binary to clean up specific to Python
        break;
      case "c":
        executeFunction = executeC;
        break;
      case "java":
        executeFunction = executeJava;
        break;
      default:
        return res.status(400).json({ error: "❌ Unsupported language!" });
    }

    // For compiled languages (C++, C, Java), we need to compile first, then run.
    if (language === "cpp" || language === "c" || language === "java") {
        try {
            // Step 1: Compile the code
            // Pass true for compileOnly. The function returns { binaryPath: ... }
            const compileResult = await executeFunction(codePath, null, true);
            compiledBinaryPath = compileResult.binaryPath; // Store the path to the compiled executable/class directory

            // Step 2: Run the compiled binary/class
            // Pass the compiledBinaryPath (or class directory for Java) and false for run mode
            executionResult = await executeFunction(compiledBinaryPath, inputPath, false);

        } catch (compileRunErr) {
            // This catch block specifically handles compilation errors or immediate runtime errors
            // during the compile/run sequence for compiled languages.
            console.error(`❌ ${language.toUpperCase()} Compilation/Execution Error for single run:`, compileRunErr);
            return res.status(200).json({ // Return 200 for logical errors like compilation/runtime error
                output: sanitizeOutput(compileRunErr?.output),
                verdict: compileRunErr?.verdict || "Error",
                error: compileRunErr?.error || "Compilation/Runtime Error"
            });
        }
    }

    // Send back the result for successful runs (including Python, which was handled earlier)
    res.status(200).json({
        output: sanitizeOutput(executionResult?.output),
        verdict: executionResult?.verdict || "Executed",
        time: executionResult?.time || 0,
        memory: executionResult?.memory || 0,
    });

  } catch (topLevelErr) {
    // This catch handles errors during file generation (generateFile, generateInputFile)
    // or any other unexpected critical issues in the runCode function itself.
    console.error("❌ Compiler Service: Top-level Error in runCode:", topLevelErr);
    res.status(500).json({
      error: topLevelErr?.message || "❌ Internal server error in compiler service!",
      verdict: "Internal Server Error",
      output: ""
    });
  } finally {
      // Ensure cleanup of temporary files (source code, input, and compiled binaries/class dirs)
      if (codePath) await fs.unlink(codePath).catch(e => console.error("Error deleting source code file:", e));
      if (inputPath) await fs.unlink(inputPath).catch(e => console.error("Error deleting input file:", e));

      // Clean up the compiled binary or Java class directory.
      // Use fs.promises.rm for recursive deletion, which works for both files and directories.
      if (compiledBinaryPath) {
          await fs.rm(compiledBinaryPath, { recursive: true, force: true })
                  .catch(e => console.error("Error deleting compiled binary/dir:", e));
      }
  }
};

// ✅ 2. Judge Submission With Test Cases — FULL VERDICT TABLE (unchanged, but included for completeness)
const runCodeWithTestCases = async (req, res) => {
    // ... (Your existing runCodeWithTestCases function code) ...
    // This function should remain largely as it was in the last successful C++ submission.
    // It already correctly uses the compileOnly flag.
    // Make sure it also uses `fs.rm` for `compiledBinaryPath` cleanup if you copy-pasted the cleanup logic.
    // (My last provided version for compilerController.js already uses `fs.unlink` for codePath and inputPath,
    // and correctly used `fs.rm` for compiledBinaryPath).

    // ... (rest of the runCodeWithTestCases code) ...
     console.log('--- Inside Compiler Service: runCodeWithTestCases ---');
     console.log('Compiler Service Received req.body:', req.body);
     const { language = "cpp", code, problemId, testCases, timeLimit, memoryLimit } = req.body; // Added testCases, timeLimit, memoryLimit here
     console.log('Compiler Service: language:', language);
     console.log('Compiler Service: code length:', code ? code.length : 'N/A');
     console.log('Compiler Service: problemId:', problemId);
     console.log('Compiler Service: testCases length:', testCases ? testCases.length : 'N/A');
     console.log('Compiler Service: timeLimit:', timeLimit);
     console.log('Compiler Service: memoryLimit:', memoryLimit);
     // --- END DEBUGGING CONSOLE.LOGS ---

     if (!code || !problemId || !testCases || !Array.isArray(testCases) || testCases.length === 0) { // Added testCases validation
       console.error('Compiler Service Validation Failed: Missing required fields.'); // Added for clarity
       return res.status(400).json({ error: "❌ Code, Problem ID, and Test Cases are required" }); // Updated error message
     }

     // Define paths for compiled binaries (outside the loop as it's compiled once)
     let compiledBinaryPath = null;
     let codePath = null; // Declare codePath outside try block for finally cleanup

     try {
       // Generate the code file once for compilation
       codePath = await generateFile(language, code);

       // First, attempt to compile the code
       try {
           // executeCpp now returns { output: stdout, error: stderr, binaryPath: path }
           // We only need the binary path for subsequent runs
           let compileFunction;
           switch(language) {
               case "cpp": compileFunction = executeCpp; break;
               case "c": compileFunction = executeC; break;
               case "java": compileFunction = executeJava; break;
               case "python": // Python doesn't have a compilation step like C++/Java
                   compiledBinaryPath = null; // No binary to cleanup for python
                   break;
               default: throw new Error("Unsupported language for compilation");
           }

           if (language !== "python") { // Only attempt compilation for compiled languages
                const compileResult = await compileFunction(codePath, null, true); // Pass true to only compile
                compiledBinaryPath = compileResult.binaryPath; // Store the path to the compiled executable/class dir
           }

       } catch (compileErr) {
           // If compilation fails, return compilation error for all test cases
           const compilationError = compileErr?.error || "Compilation Error";
           const results = testCases.map(tc => ({
               input: tc.input,
               expectedOutput: tc.input, // Use input as placeholder if expected is not available
               actualOutput: '',
               status: 'Compilation Error',
               time: 0,
               memory: 0,
               isHidden: tc.isHidden,
               errorMessage: compilationError
           }));
           return res.status(200).json({
               overallStatus: "Compilation Error",
               testCaseResults: results,
               compilationError: compilationError
           });
       }

       const allTestCases = testCases;
       const results = [];
       let overallStatus = "Accepted"; // Assume Accepted unless a test case fails
       let maxTimeTaken = 0;
       let maxMemoryUsed = 0;

       // If compilation was successful (or language is Python), run against each test case
       for (let i = 0; i < allTestCases.length; i++) {
           const testCase = allTestCases[i];
           let inputPath = null;

           try {
               inputPath = await generateInputFile(testCase.input);

               let output;
               let runFunction;
               switch(language) {
                   case "cpp": runFunction = executeCpp; break;
                   case "python": runFunction = executePython; break;
                   case "c": runFunction = executeC; break;
                   case "java": runFunction = executeJava; break;
                   default: throw new Error("Unsupported language for execution");
               }

               if (language === "python") {
                   output = await runFunction(codePath, inputPath); // Python runs the source directly
               } else {
                   // Execute the already compiled binary (or Java class dir) with the current test case input
                   output = await runFunction(compiledBinaryPath, inputPath, false); // Pass false for run mode
               }


               const expected = testCase.expectedOutput.trim();
               const actual = output.output.trim();

               const status = expected === actual ? "Passed" : "Wrong Answer";

               results.push({
                   index: i + 1,
                   input: sanitizeOutput(testCase.input),
                   expectedOutput: sanitizeOutput(expected), // Keep expected output consistent
                   actualOutput: sanitizeOutput(actual),
                   status: status,
                   isHidden: testCase.isHidden,
                   time: output.time || 0,
                   memory: output.memory || 0,
               });

               if (status !== "Passed") {
                   overallStatus = "Wrong Answer"; // Update overall status if any WA
               }

               // Update max time and memory
               if (output.time) maxTimeTaken = Math.max(maxTimeTaken, output.time);
               if (output.memory) maxMemoryUsed = Math.max(maxMemoryUsed, output.memory);

           } catch (runErr) {
               // Handle runtime errors (e.g., Time Limit Exceeded, Runtime Error)
               const errorMessage = runErr?.error || "Runtime Error";
               let statusType = "Runtime Error";
               if (errorMessage.includes("Time Limit Exceeded")) { // Basic check, refine based on actual error messages
                   statusType = "Time Limit Exceeded";
               }

               if (overallStatus === "Accepted") { // Only downgrade overall status if it's currently Accepted
                   overallStatus = statusType;
               }

               results.push({
                   index: i + 1,
                   input: sanitizeOutput(testCase.input),
                   expectedOutput: sanitizeOutput(testCase.expectedOutput),
                   actualOutput: sanitizeOutput(runErr.output || ""), // Actual output might be partial or empty on error
                   status: statusType,
                   isHidden: testCase.isHidden,
                   time: runErr.time || 0,
                   memory: runErr.memory || 0,
                   errorMessage: sanitizeOutput(errorMessage)
               });
           } finally {
               // Clean up input file after each test case execution
               if (inputPath) await fs.unlink(inputPath).catch(e => console.error("Error deleting input file:", e));
           }
       }

       res.status(200).json({
         overallStatus: overallStatus,
         testCaseResults: results,
         maxTimeTaken: maxTimeTaken,
         maxMemoryUsed: maxMemoryUsed,
       });

     } catch (err) {
       console.error("❌ Compiler Service: Top-level Error in runCodeWithTestCases:", err);
       res.status(500).json({
         overallStatus: "Internal Compiler Error",
         error: err?.message || "Failed to process test cases in compiler service",
         compilationError: err?.error
       });
     } finally {
         // Clean up the source code file and the compiled binary/class directory after all test cases are done
         if (codePath) await fs.unlink(codePath).catch(e => console.error("Error deleting source code file:", e));
         // For compiled languages, use fs.rm for recursive deletion
         if (compiledBinaryPath) {
             await fs.rm(compiledBinaryPath, { recursive: true, force: true })
                     .catch(e => console.error("Error deleting compiled binary/dir:", e));
         }
     }
};

module.exports = { runCode, runCodeWithTestCases };