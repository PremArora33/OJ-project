const { exec } = require("child_process");
const path = require("path");

/**
 * Executes a Python script with the given input.
 * @param {string} filePath - Path to the Python source code file (.py).
 * @param {string} inputPath - Path to the input file.
 * @returns {Promise<Object>} - Resolves with { output, verdict, time, memory }. Rejects with { error, verdict, output, time, memory }.
 */
const executePython = async (filePath, inputPath) => {
    return new Promise((resolve, reject) => {
        // Command to run the Python script with input redirection
        // Using `python3` is generally preferred for modern Python versions
        const command = `python3 "${filePath}" < "${inputPath}"`;
        console.log("🚀 RUN PYTHON CMD:", command);

        // Execute the command with a timeout
        exec(command, { timeout: 5000 }, (error, stdout, stderr) => { // Added a 5-second timeout
            let verdict = "Executed";
            let errorMessage = "";
            let timeTaken = 0; // Placeholder for actual measurement
            let memoryUsed = 0; // Placeholder for actual measurement

            if (error) {
                errorMessage = stderr || error.message;

                if (error.killed && error.signal === 'SIGTERM') {
                    verdict = "Time Limit Exceeded";
                    errorMessage = "Time Limit Exceeded";
                } else if (error.code !== 0) {
                    verdict = "Runtime Error";
                }
                console.error("❌ Python Execution Error:", errorMessage);
                return reject({
                    error: errorMessage,
                    verdict: verdict,
                    output: stdout, // Include partial output if any
                    time: timeTaken,
                    memory: memoryUsed
                });
            }

            // Successful execution
            console.log("✅ Python Execution Successful.");
            return resolve({
                output: stdout,
                verdict: verdict,
                time: timeTaken,
                memory: memoryUsed
            });
        });
    });
};

module.exports = executePython;