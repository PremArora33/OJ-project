const axios = require('axios');
const Problem = require('../models/Problem');
const Submission = require('../models/Submission');
const User = require('../models/User'); // Ensure User model is imported

// Base URL for your compiler service
const COMPILER_SERVICE_URL = process.env.COMPILER_SERVICE_URL || 'http://localhost:8000';

// Helper to sanitize output for display
const sanitizeOutput = (output) => {
    return output ? output.replace(/\r\n/g, '\n').trim() : '';
};

// --- Handle Run Custom Code ---
exports.handleRunCustomCode = async (req, res) => {
    const { language, code, input, problemId } = req.body;

    if (!language || !code) {
        return res.status(400).json({ error: 'Language and code are required.' });
    }

    try {
        const compilerResponse = await axios.post(`${COMPILER_SERVICE_URL}/api/run`, {
            language,
            code,
            input,
        });

        const { output, error, verdict } = compilerResponse.data;

        if (error) {
            return res.status(200).json({
                output: sanitizeOutput(error),
                verdict: verdict || 'Runtime Error'
            });
        }

        res.status(200).json({
            output: sanitizeOutput(output),
            verdict: verdict || 'Executed'
        });

    } catch (error) {
        console.error('Error running custom code:', error.response?.data || error.message);
        const errorMessage = error.response?.data?.error || 'Compiler service error';
        const errorVerdict = error.response?.data?.verdict || 'Internal Server Error';

        res.status(500).json({
            output: `An error occurred: ${errorMessage}`,
            verdict: errorVerdict,
            error: errorMessage
        });
    }
};

// --- Handle Code Submission ---
exports.handleSubmitCode = async (req, res) => {
    // --- DEBUGGING CONSOLE.LOGS (Leave these in for now, they are very useful) ---
    console.log('--- Inside handleSubmitCode ---');
    console.log('Received req.body from frontend/Postman:', req.body);
    const { problemId, language, code, testCases } = req.body;
    // IMPORTANT: userId is expected to be populated by an authentication middleware (e.g., req.user.id)
    const userId = req.user ? req.user.id : null;
    console.log('User ID (main backend):', userId);
    console.log('problemId (main backend):', problemId);
    console.log('language (main backend):', language);
    console.log('code length (main backend):', code ? code.length : 'N/A');
    console.log('testCases length (main backend):', testCases ? testCases.length : 'N/A');
    // --- END DEBUGGING CONSOLE.LOGS ---

    if (!userId) {
        console.error('Authentication failed: User ID not found in request. Ensure authMiddleware is applied.');
        return res.status(401).json({ error: 'Authentication required for submission.' });
    }

    if (!problemId || !language || !code || !testCases || !Array.isArray(testCases) || testCases.length === 0) {
        console.error('Validation failed at main backend: Missing problemId, language, code, or test cases.');
        return res.status(400).json({ error: '❌ Code, Problem ID, and Test Cases are required' });
    }

    try {
        // Fetch the full problem details from your DB to get limits and difficulty
        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ error: 'Problem not found.' });
        }

        const results = [];
        let overallStatus = 'Accepted'; // Default to Accepted, will change if any test fails
        let maxTimeTaken = 0;
        let maxMemoryUsed = 0;
        let compilationError = null;

        // Send code to compiler service for batch execution against test cases
        const compilerResponse = await axios.post(`${COMPILER_SERVICE_URL}/api/run-with-testcases`, {
            language,
            code,
            testCases,
            problemId: problemId,
            timeLimit: problem.timeLimit,
            memoryLimit: problem.memoryLimit,
        });

        const compilerResults = compilerResponse.data;

        // Handle potential compilation errors first
        if (compilerResults.compilationError) {
            overallStatus = 'Compilation Error';
            compilationError = sanitizeOutput(compilerResults.compilationError);
            // For compilation error, mark all test cases as failed
            testCases.forEach(tc => {
                results.push({
                    input: tc.input,
                    expectedOutput: tc.expectedOutput,
                    actualOutput: '',
                    status: 'Compilation Error',
                    time: 0,
                    memory: 0,
                    isHidden: tc.isHidden,
                    errorMessage: compilationError
                });
            });
        } else {
            // Process results for each test case
            let allPassed = true;
            compilerResults.testCaseResults.forEach((tcResult, index) => {
                const currentTestCase = testCases[index];

                let status = tcResult.status;
                if (status !== 'Passed') {
                    allPassed = false;
                    // Prioritize more severe statuses for overallStatus
                    if (overallStatus === 'Accepted' || overallStatus === 'Passed') {
                        overallStatus = status;
                    }
                }

                results.push({
                    input: sanitizeOutput(currentTestCase.input),
                    expectedOutput: sanitizeOutput(currentTestCase.expectedOutput),
                    actualOutput: sanitizeOutput(tcResult.actualOutput || ''),
                    status: status,
                    time: tcResult.time || 0,
                    memory: tcResult.memory || 0,
                    isHidden: currentTestCase.isHidden,
                    errorMessage: sanitizeOutput(tcResult.errorMessage || '')
                });

                // Update max time and memory
                if (tcResult.time) maxTimeTaken = Math.max(maxTimeTaken, tcResult.time);
                if (tcResult.memory) maxMemoryUsed = Math.max(maxMemoryUsed, tcResult.memory);
            });

            // Final check for overallStatus if compiler didn't provide it explicitly
            if (allPassed) {
                overallStatus = 'Accepted';
            }
        }

        // Save submission to DB
        const newSubmission = new Submission({
            code,
            language,
            verdict: overallStatus,
            problem: problemId,
            user: userId, // Link submission to the authenticated user
            timeTaken: maxTimeTaken,
            memoryUsed: maxMemoryUsed,
            testCaseResults: results,
            compilationError: compilationError,
        });
        await newSubmission.save();
        console.log(`📝 New submission saved for user ${userId} on problem ${problemId} with verdict: ${overallStatus}`);

        // --- Start: Update User Dashboard Data ---
        const user = await User.findById(userId);
        if (user) {
            // 1. Update Recent Submissions (keep last 5 for dashboard display)
            user.recentSubmissions.unshift({
                problemName: problem.title, // Assuming your Problem model has a 'title' field
                language: language,
                status: overallStatus,
                timestamp: new Date(),
                submissionId: newSubmission._id
            });
            // Ensure we don't store too many recent submissions
            if (user.recentSubmissions.length > 5) { // You can adjust this limit
                user.recentSubmissions.pop();
            }

            // 2. Update Total Problems Solved and Solved Problems List (only for Accepted solutions)
            // Ensure problem.difficulty exists for problemsByDifficulty update
            if (overallStatus === 'Accepted') {
                // Check if this problem was already uniquely solved by the user
                // Convert problemId to string for comparison if user.solvedProblems stores strings
                if (!user.solvedProblems.map(id => id.toString()).includes(problemId.toString())) {
                    user.totalProblemsSolved += 1;
                    user.solvedProblems.push(problemId); // Add problem ID to solved list

                    // Update problemsByDifficulty
                    const difficultyIndex = user.problemsByDifficulty.findIndex(
                        d => d.difficulty === problem.difficulty
                    );
                    if (difficultyIndex !== -1) {
                        user.problemsByDifficulty[difficultyIndex].count += 1;
                    } else {
                        // If difficulty not found, add it (initialize with 0 for other difficulties if needed)
                        user.problemsByDifficulty.push({ difficulty: problem.difficulty, count: 1 });
                    }

                    // Update activityLog for today
                    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
                    const activityIndex = user.activityLog.findIndex(a => a.date === today);
                    if (activityIndex !== -1) {
                        user.activityLog[activityIndex].problemsSolved += 1;
                    } else {
                        user.activityLog.push({ date: today, problemsSolved: 1 });
                    }
                }
            }

            // 3. Update Total Submissions Count (for acceptance rate calculation)
            user.totalSubmissionsCount = (user.totalSubmissionsCount || 0) + 1;

            // 4. Recalculate Acceptance Rate
            if (user.totalSubmissionsCount > 0) {
                user.acceptanceRate = (user.totalProblemsSolved / user.totalSubmissionsCount) * 100;
            } else {
                user.acceptanceRate = 0; // Avoid division by zero
            }

            await user.save();
            console.log(`📊 User ${user.username} dashboard data updated.`);
        } else {
            console.warn(`User with ID ${userId} not found after submission. Dashboard data not updated.`);
        }
        // --- End: Update User Dashboard Data ---

        res.status(200).json({
            overallStatus,
            testCaseResults: results,
            maxTimeTaken,
            maxMemoryUsed,
            submissionId: newSubmission._id,
            errorMessage: compilationError
        });

    } catch (error) {
        console.error('Error submitting code (main backend catch block):', error.response?.data || error.message);
        const errorMessage = error.response?.data?.error || 'Internal server error during submission.';
        const errorVerdict = error.response?.data?.overallStatus || 'Submission Failed';

        res.status(500).json({
            overallStatus: errorVerdict,
            testCaseResults: [], // No results on a critical error
            maxTimeTaken: 0,
            maxMemoryUsed: 0,
            error: errorMessage
        });
    }
};
