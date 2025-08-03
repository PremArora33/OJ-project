const { exec } = require("child_process");
const path = require("path");

/**
 * Executes Java code, either compiling it or running a pre-compiled class.
 * Assumes the main class is named 'Main' (as per generateFile.js).
 * @param {string} filePath - Path to the Java source file (.java) if compileOnly=true.
 * Path to the directory containing the compiled .class file if compileOnly=false.
 * @param {string | null} inputPath - Path to the input file. Null if compileOnly is true.
 * @param {boolean} [compileOnly=false] - If true, only compiles the .java file. If false, runs the compiled .class file.
 * @returns {Promise<Object>} - Resolves with { output, verdict, time, memory } for run, or { binaryPath: dir } for compile. Rejects with { error, verdict, output, time, memory }.
 */
const executeJava = (filePath, inputPath, compileOnly = false) => {
    const filename = "Main"; // As per generateFile.js, main class is named "Main"

    return new Promise((resolve, reject) => {
        if (compileOnly) {
            // --- COMPILE MODE ---
            // filePath is the path to the Java source file (e.g., /path/to/codes/Main.java)
            const compileCommand = `javac "${filePath}"`;
            // The .class file will be created in the same directory as the .java source
            const outputDirForClass = path.dirname(filePath);

            console.log("🛠️ COMPILE JAVA CMD:", compileCommand);

            // Execute compilation with a timeout
            exec(compileCommand, { timeout: 5000 }, (compileErr, _, compileStderr) => {
                if (compileErr) {
                    console.error("❌ Java Compilation Error:", compileStderr);
                    // Reject with structured error for compilation failure
                    return reject({
                        error: compileStderr,
                        verdict: "Compilation Error",
                        output: "", // No output on compile error
                        time: 0,
                        memory: 0
                    });
                }
                // Compilation successful: resolve with the directory containing the .class file.
                // This directory will be treated as the 'binaryPath' by compilerController.js for Java.
                console.log("✅ Java Compilation Successful. Class files in:", outputDirForClass);
                resolve({ binaryPath: outputDirForClass });
            });
        } else {
            // --- RUN MODE ---
            // In run mode, 'filePath' is the 'binaryPath' returned by compileOnly mode,
            // which is the directory containing the compiled .class file (e.g., /path/to/codes/)
            const classPathDir = filePath; // Renaming for clarity in this context

            // Command to run the compiled Java class, specifying the classpath
            const runCommand = `java -cp "${classPathDir}" "${filename}" < "${inputPath}"`;
            console.log("🚀 RUN JAVA CMD:", runCommand);

            // Execute the run command with a timeout
            exec(runCommand, { timeout: 5000 }, (runErr, runStdout, runStderr) => {
                let verdict = "Executed";
                let errorMessage = "";
                let timeTaken = 0; // Placeholder for actual measurement
                let memoryUsed = 0; // Placeholder for actual measurement

                if (runErr) {
                    errorMessage = runStderr || runErr.message;
                    if (runErr.killed && runErr.signal === 'SIGTERM') {
                        verdict = "Time Limit Exceeded";
                        errorMessage = "Time Limit Exceeded";
                    } else if (runErr.code !== 0) {
                        verdict = "Runtime Error";
                    }
                    console.error("❌ Java Execution Error:", errorMessage);
                    // Reject with structured error for runtime/timeout failure
                    return reject({
                        error: errorMessage,
                        verdict: verdict,
                        output: runStdout, // Include partial output if any
                        time: timeTaken,
                        memory: memoryUsed
                    });
                }
                // Successful execution
                console.log("✅ Java Execution Successful.");
                resolve({
                    output: runStdout,
                    verdict: verdict,
                    time: timeTaken,
                    memory: memoryUsed
                });
            });
        }
    });
};

module.exports = executeJava;