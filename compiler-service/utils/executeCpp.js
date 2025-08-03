const { exec } = require("child_process");
const path = require("path");
const fs = require("fs-extra"); // fs-extra is used for mkdirsSync
const { v4: uuid } = require("uuid");

const outputPath = path.join(__dirname, "../outputs");

// Ensure outputs directory exists
if (!fs.existsSync(outputPath)) {
    fs.mkdirsSync(outputPath);
}

/**
 * Executes C++ code, either compiling it or running a pre-compiled binary.
 * @param {string} filePath - Path to the source code file (if compileOnly is true) or path to the compiled binary (if compileOnly is false).
 * @param {string | null} inputPath - Path to the input file. Null if compileOnly is true.
 * @param {boolean} [compileOnly=false] - If true, only compiles the code and returns the binary path. If false, runs the given binary.
 * @returns {Promise<Object>} - Resolves with { output, verdict, time, memory } for run, or { binaryPath } for compile. Rejects with { error, verdict, output, time, memory }.
 */
const executeCpp = async (filePath, inputPath, compileOnly = false) => {
    const jobId = uuid();
    const outputBinary = path.join(outputPath, `${jobId}.out`); // Unique binary name for the executable

    return new Promise((resolve, reject) => {
        if (compileOnly) {
            // --- COMPILE MODE ---
            // filePath is the path to the source code (.cpp file)
            const compileCommand = `g++ "${filePath}" -o "${outputBinary}"`;
            console.log("🛠️ COMPILE CMD:", compileCommand);

            exec(compileCommand, (compileErr, _, compileStderr) => {
                if (compileErr) {
                    // Compilation error
                    console.error("❌ Compilation Error:", compileStderr);
                    return reject({
                        error: compileStderr,
                        verdict: "Compilation Error",
                        output: "",
                        time: 0,
                        memory: 0
                    });
                }
                // Compilation successful: resolve with the path to the compiled binary
                console.log("✅ Compilation Successful. Binary:", outputBinary);
                resolve({ binaryPath: outputBinary });
            });
        } else {
            // --- RUN MODE ---
            // filePath is now expected to be the path to the compiled binary (.out file)
            const runCommand = `"${filePath}" < "${inputPath}"`; // Use filePath as binary path
            console.log("🚀 RUN CMD:", runCommand);

            // You might want to add options for timeout (e.g., `timeout 5s` on Linux or `chcp 65001 && cmd /c "timeout /t 5" ...` on Windows)
            // or resource limits (ulimit on Linux) for actual competitive programming judging.
            // For now, a basic exec call:
            exec(runCommand, { timeout: 5000 }, (runErr, runStdout, runStderr) => { // Added a 5-second timeout
                let verdict = "Executed";
                let errorMessage = "";
                let timeTaken = 0; // Placeholder
                let memoryUsed = 0; // Placeholder

                if (runErr) {
                    errorMessage = runStderr || runErr.message;
                    if (runErr.killed && runErr.signal === 'SIGTERM') {
                        // This usually indicates timeout on systems that support exec timeout option
                        verdict = "Time Limit Exceeded";
                        errorMessage = "Time Limit Exceeded";
                    } else if (runErr.code !== 0) {
                        // Non-zero exit code, likely a runtime error
                        verdict = "Runtime Error";
                    }
                    console.error("❌ Execution Error:", errorMessage);
                    return reject({
                        error: errorMessage,
                        verdict: verdict,
                        output: runStdout, // Include partial output if any
                        time: timeTaken,
                        memory: memoryUsed
                    });
                }

                // Successful execution
                console.log("✅ Execution Successful.");
                resolve({
                    output: runStdout,
                    verdict: "Executed",
                    time: timeTaken, // This would come from an actual measurement tool
                    memory: memoryUsed // This would come from an actual measurement tool
                });
            });
        }
    });
};

module.exports = executeCpp;