// app/problems/[code]/[id]/page.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';

// ADDED: Dynamic import for MonacoEditor to ensure client-side rendering
import dynamic from 'next/dynamic';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
    ssr: false, // This is crucial: disables server-side rendering
    loading: () => (
        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-color)' }}>
            Loading Editor...
        </div>
    ),
});

import {
    FaCode,
    FaLightbulb,
    FaMoon,
    FaSun,
    FaArrowUp,
    FaBookmark,
    FaCheckCircle,
    FaTimesCircle,
    FaClock,
    FaMemory,
    FaRobot,
} from 'react-icons/fa';
import Navbar from '../../../components/Navbar'; // Adjust path if needed

import styles from './ProblemPage.module.css'; // Your CSS module

// --- Interfaces (UPDATED based on your backend's actual schema) ---
interface Problem {
    _id: string; // MongoDB auto-generated ID
    title: string;
    problemIdCode: string; // Your unique problem identifier (e.g., SUM1001)
    // UPDATED: initialCode is now an object/map for language-specific boilerplate
    initialCode: { [key: string]: string }; // Map where keys are languages (e.g., 'cpp') and values are code strings
    description: string;
    inputFormat: string;
    outputFormat: string;
    constraints: string[]; // This should be an array of strings based on schema
    examples: Array<{ input: string; output: string; explanation?: string }>;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    timeLimit: number; // in milliseconds
    memoryLimit: number; // in MB
    testCases: { input: string; expectedOutput: string; isHidden: boolean }[]; // From your schema
    acceptanceRate: number;
    totalAttempts: number;
    tags: string[];
    sampleInput: string;
    sampleOutput: string;
    createdAt: string;
}

interface TestCaseResult {
    input: string;
    expectedOutput: string;
    actualOutput: string;
    // CORRECTED: Added 'Wrong Answer' to the status union type
    status: 'Passed' | 'Failed' | 'Wrong Answer' | 'Runtime Error' | 'Time Limit Exceeded' | 'Compilation Error';
    time?: number; // in ms
    memory?: number; // in MB
    isHidden: boolean; // Indicates if the test case is hidden from the user
    errorMessage?: string; // For errors like RTE, CTE
}

interface Submission {
    _id: string; // The submission ID from the backend
    problemId: string;
    userId: string; // You'll integrate user later
    code: string;
    language: string;
    status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Runtime Error' | 'Compilation Error' | 'Pending';
    timeTaken: number; // Max time across test cases
    memoryUsed: number; // Max memory across test cases
    submittedAt: string; // Date string
    testCaseResults: TestCaseResult[]; // Array of results for all test cases
}

// --- Helper Components ---

const ExampleBlock: React.FC<{ example: Problem['examples'][0]; index: number }> = ({ example, index }) => (
    <div className={styles.exampleBlock}>
        <h4>Example {index + 1}:</h4>
        <p>Input:</p>
        <pre className={styles.exampleCode}>{example.input}</pre>
        <p>Output:</p>
        <pre className={styles.exampleCode}>{example.output}</pre>
        {example.explanation && (
            <>
                <p>Explanation:</p>
                <p>{example.explanation}</p>
            </>
        )}
    </div>
);

const TestCaseItem: React.FC<{ result: TestCaseResult; index: number }> = ({ result, index }) => {
    let statusClass = styles.statusPending; // Default
    let statusIcon = <FaClock />; // Default icon

    if (result.status === 'Passed') {
        statusClass = styles.statusPassed;
        statusIcon = <FaCheckCircle />;
    } else if (result.status === 'Failed' || result.status === 'Wrong Answer') {
        statusClass = styles.statusFailed;
        statusIcon = <FaTimesCircle />;
    } else if (result.status === 'Runtime Error' || result.status === 'Time Limit Exceeded' || result.status === 'Compilation Error') {
        statusClass = styles.statusError;
        statusIcon = <FaTimesCircle />; // Or a specific error icon if you have one, like FaExclamationCircle
    }

    return (
        <div className={styles.testCaseItem}>
            <div className={styles.testCaseHeader}>
                <span>Test Case {index + 1}</span>
                <span className={`${styles.statusBadge} ${statusClass}`}>
                    {statusIcon} {result.status}
                </span>
            </div>
            {result.isHidden ? (
                <p>Test case details are hidden.</p>
            ) : (
                <>
                    <p>Input:</p>
                    <pre>{result.input}</pre>
                    <p>Expected Output:</p>
                    <pre>{result.expectedOutput}</pre>
                    <p>Actual Output:</p>
                    <pre>{result.actualOutput || 'N/A'}</pre> {/* Show actual output for debugging */}
                    {result.errorMessage && (
                        <>
                            <p>Error Message:</p>
                            <pre className={styles.errorMessage}>{result.errorMessage}</pre>
                        </>
                    )}
                    <div className={styles.testCaseMetrics}>
                        {result.time !== undefined && (
                            <span>
                                <FaClock /> Time: {result.time}ms
                            </span>
                        )}
                        {result.memory !== undefined && (
                            <span>
                                <FaMemory /> Memory: {result.memory}MB
                            </span>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

// --- Main Page Component ---
const ProblemPage: React.FC = () => {
    const params = useParams();
    const id = params.id as string; // MongoDB _id from URL
    const problemIdCode = params.code as string; // problemIdCode from URL (e.g., SUM1001)

    const [problem, setProblem] = useState<Problem | null>(null);
    const [activeTab, setActiveTab] = useState<'output' | 'testcases' | 'submissions' | 'aifeedback' | 'description' | 'examples' | 'constraints'>('description');
    const [customInput, setCustomInput] = useState<string>('');
    const [output, setOutput] = useState<string>(''); // For run output
    const [runLoading, setRunLoading] = useState<boolean>(false);
    const [submitLoading, setSubmitLoading] = useState<boolean>(false);
    const [testCaseResults, setTestCaseResults] = useState<TestCaseResult[]>([]); // For 'Test Cases' tab
    const [submissions, setSubmissions] = useState<Submission[]>([]); // For 'Submissions' tab
    const [aiFeedback, setAiFeedback] = useState<string>('');
    const [aiLoading, setAiLoading] = useState<boolean>(false);
    const [selectedLanguage, setSelectedLanguage] = useState<string>('cpp'); // Default to 'cpp'
    const [editorCode, setEditorCode] = useState<string>('// Start coding here...'); // Editor content
    const [defaultCode, setDefaultCode] = useState<string>(''); // For reset functionality
    const [isDarkTheme, setIsDarkTheme] = useState<boolean>(true); // Controlled by your Navbar or global theme context
    const [verdict, setVerdict] = useState<string>(''); // Overall verdict for 'Run Input'

    const problemDetailsRef = useRef<HTMLDivElement>(null);

    // Apply theme class to body (consider using a global context or Tailwind for better theme management)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            document.body.classList.toggle('light-mode', !isDarkTheme);
        }
    }, [isDarkTheme]);

    // Fetch problem data from backend
    useEffect(() => {
        const fetchProblem = async () => {
            try {
                // Fetching by MongoDB _id
                const response = await fetch(`http://localhost:5000/api/problems/${id}`);
                if (!response.ok) {
                    throw new Error('Problem not found');
                }
                const data: Problem = await response.json();
                setProblem(data);

                // *** IMPORTANT: Use data.initialCode for the editor ***
                // Now initialCode is an object, so select based on selectedLanguage
                const initialBoilerplate = data.initialCode[selectedLanguage] || '// Start coding here...';
                setEditorCode(initialBoilerplate);
                setDefaultCode(initialBoilerplate); // For reset button

                // Set custom input from sampleInput if available
                setCustomInput(data.sampleInput || '');

            } catch (error) {
                console.error('Failed to fetch problem:', error);
                setProblem(null);
            }
        };

        if (id) { // Ensure 'id' from useParams is available
            fetchProblem();
        }
    }, [id, selectedLanguage]); // Dependency on 'id' AND 'selectedLanguage'

    // Handle language change for editor (now integrated into the main useEffect with `id` dependency)
    // If you later add a problem.initialCode map to your backend, you'd update this:
    useEffect(() => {
        if (problem && problem.initialCode && problem.initialCode[selectedLanguage]) {
            setEditorCode(problem.initialCode[selectedLanguage]);
            setDefaultCode(problem.initialCode[selectedLanguage]); // Update default for reset
        } else if (problem) {
            // Fallback if specific language boilerplate not found
            setEditorCode('// No specific boilerplate for ' + selectedLanguage + '. Write your code here.');
            setDefaultCode('// No specific boilerplate for ' + selectedLanguage + '. Write your code here.');
        }
    }, [selectedLanguage, problem]); // This useEffect will now correctly react to language changes


    // Function to handle running custom input
    const handleRunInput = async () => {
        if (!editorCode || !selectedLanguage || !problem) {
            setOutput('Please write some code, select a language, and ensure problem data is loaded.');
            setVerdict('Error');
            return;
        }
        setRunLoading(true);
        setActiveTab('output'); // Always switch to output tab on run
        setOutput('Running your code...');
        setVerdict(''); // Clear previous verdict

        try {
            // CRUCIAL CHANGE: Update the URL to match the backend route
            const response = await fetch('http://localhost:5000/api/submissions/run-custom', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    language: selectedLanguage,
                    code: editorCode,
                    input: customInput, // Use custom input for 'run'
                    problemId: problem._id // Send problem ID for context/limits if backend needs it
                }),
            });

            const data = await response.json(); // This will contain output or error

            if (response.ok) {
                setOutput(data.output || data.error || 'No output generated.');
                setVerdict(data.verdict || 'Executed'); // Backend should send a verdict for custom run too
            } else {
                setOutput(`Error: ${data.error || 'Failed to run code.'}`);
                setVerdict('Execution Failed');
            }
        } catch (error) {
            console.error('Error running code:', error);
            setOutput('An unexpected error occurred while running your code.');
            setVerdict('Network Error');
        } finally {
            setRunLoading(false);
        }
    };

    // Function to handle code submission
    const handleSubmitCode = async () => {
        // --- ADD THESE CONSOLE.LOGS ---
        console.log('--- Submitting Code ---');
        console.log('Problem object:', problem);
        console.log('Editor Code length:', editorCode?.length);
        console.log('Selected Language:', selectedLanguage);
        console.log('Problem ID to be sent:', problem?._id);
        console.log('Test Cases to be sent (count):', problem?.testCases?.length);
        // --- END CONSOLE.LOGS ---

        if (!problem || !editorCode || !selectedLanguage) {
            setOutput('Cannot submit: Problem data, code, or language is missing.');
            setVerdict('Error');
            return;
        }
        setSubmitLoading(true);
        // REMOVED: setActiveTab('submissions'); // <--- REMOVED THIS LINE
        setOutput('Submitting your code and running test cases...');
        setVerdict(''); // Clear previous verdict
        setTestCaseResults([]); // Clear previous test case results

        try {
            // NEW: Send submission request to your main backend (localhost:5000)
            const submissionResponse = await fetch('http://localhost:5000/api/submissions/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // <--- ADDED THIS LINE
                body: JSON.stringify({
                    problemId: problem._id, // Send the MongoDB problem ID
                    code: editorCode,
                    language: selectedLanguage,
                    // IMPORTANT: Send the problem's test cases from frontend to backend.
                    // The backend will then pass these to the compiler service.
                    // Alternatively, your backend could fetch test cases from its DB using problemId.
                    // For now, sending from frontend simplifies the immediate next step.
                    testCases: problem.testCases.map(tc => ({
                        input: tc.input,
                        expectedOutput: tc.expectedOutput,
                        isHidden: tc.isHidden
                    })),
                    // userId: "someUserId" // You'll add this later once authentication is set up
                }),
            });

            const data = await submissionResponse.json(); // Expected to contain overall verdict and test case results

            if (submissionResponse.ok) {
                setVerdict(data.overallStatus || 'Unknown Verdict'); // Overall verdict from backend
                setOutput(data.errorMessage || ''); // Any compilation/runtime error message
                setTestCaseResults(data.testCaseResults || []); // Detailed test results

                // Add to local submissions history
                setSubmissions((prev) => [
                    {
                        _id: data.submissionId || String(prev.length + 1), // Use actual ID from backend if available
                        problemId: problem._id,
                        userId: "tempUser", // Placeholder for now - will be replaced by actual user ID
                        code: editorCode,
                        language: selectedLanguage,
                        status: data.overallStatus as Submission['status'],
                        timeTaken: data.maxTimeTaken || 0,
                        memoryUsed: data.maxMemoryUsed || 0,
                        submittedAt: new Date().toLocaleString(),
                        testCaseResults: data.testCaseResults || [],
                    },
                    ...prev,
                ]);

                // ADDED: Switch to the 'testcases' tab to show immediate results
                setActiveTab('testcases'); // <--- ADDED THIS LINE

            } else {
                setOutput(`Submission Error: ${data.error || 'Failed to submit code.'}`);
                setVerdict('Submission Failed');
                setActiveTab('output'); // Stay on output if there's a submission error
            }
        } catch (error) {
            console.error('Error submitting code:', error);
            setOutput('An unexpected error occurred while submitting your code.');
            setVerdict('Network Error');
            setActiveTab('output'); // Stay on output for network errors
        } finally {
            setSubmitLoading(false);
        }
    };

    // Function to get AI code review
    const getAICodeReview = async () => {
        if (!editorCode || !selectedLanguage) {
            setAiFeedback('Please write some code and select a language for AI review.');
            return;
        }
        setAiLoading(true);
        setActiveTab('aifeedback'); // Switch to AI Feedback tab
        setAiFeedback('Getting AI code review...');
        try {
            // Assuming your AI review service is also proxied through your main backend
            const response = await fetch('http://localhost:5000/api/ai-review', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    language: selectedLanguage,
                    code: editorCode,
                    problemStatement: problem?.description, // Provide problem description for context
                }),
            });
            const data = await response.json();
            if (response.ok) {
                setAiFeedback(data.review || 'No AI feedback received.');
            } else {
                setAiFeedback(`Error: ${data.error || 'Failed to get AI review.'}`);
            }
        } catch (error) {
            console.error('Error getting AI review:', error);
            setAiFeedback('An unexpected error occurred while getting AI review.');
        } finally {
            setAiLoading(false);
        }
    };

    const handleResetCode = () => {
        // Reset to the initial boilerplate for the currently selected language
        setEditorCode(problem?.initialCode[selectedLanguage] || '// Start coding here...');
        setOutput('');
        setVerdict('');
        setCustomInput(problem?.sampleInput || ''); // Reset custom input to sample
        setTestCaseResults([]); // Clear test results on reset
        setActiveTab('output'); // Reset to output tab
    };

    const scrollToTop = () => {
        problemDetailsRef.current?.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    if (!problem) {
        return (
            <div className="homepage-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <p className="loading-message">Loading problem or problem not found...</p>
            </div>
        );
    }

    // Determine difficulty class for styling
    const difficultyClass = {
        Easy: 'diff-easy',
        Medium: 'diff-medium',
        Hard: 'diff-hard',
    }[problem.difficulty];

    return (
        <div className="homepage-container">
            <Navbar />

            <div className={styles.mainWorkspaceArea}>
                {/* ========== LEFT PANEL (Problem Details) ========== */}
                <div className={styles.problemDetailsPanel} ref={problemDetailsRef}>
                    <h2 className={styles.mainProblemTitle}>{problem.title}</h2>
                    <div className="oj-tags">
                        <span className={`badge ${difficultyClass}`}>{problem.difficulty}</span>
                        {problem.tags && Array.isArray(problem.tags) && problem.tags.map((tag: string) => (
                            <span key={tag} className="tag">{tag}</span>
                        ))}
                    </div>

                    <div className={styles.problemMetrics}>
                        <span title="Time Limit">
                            <FaClock /> {problem.timeLimit}ms
                        </span>
                        <span title="Memory Limit">
                            <FaMemory /> {problem.memoryLimit}MB
                        </span>
                        {problem.acceptanceRate !== undefined && (
                            <span title="Acceptance Rate">
                                <FaCheckCircle /> {problem.acceptanceRate}%
                            </span>
                        )}
                        {problem.totalAttempts !== undefined && (
                            <span title="Total Attempts">
                                Attempts: {problem.totalAttempts}
                            </span>
                        )}
                    </div>

                    <div className="oj-tabs">
                        {['Description', 'Examples', 'Constraints'].map((item) => (
                            <button
                                key={item}
                                onClick={() => setActiveTab(item.toLowerCase() as any)}
                                className={`oj-tab-btn ${activeTab === item.toLowerCase() ? 'active' : ''}`}
                            >
                                {item}
                            </button>
                        ))}
                    </div>

                    <div className={styles.tabContent}>
                        {activeTab === 'description' && (
                            <>
                                <p>{problem.description}</p>
                                <p><b>Input Format:</b> {problem.inputFormat}</p>
                                <p><b>Output Format:</b> {problem.outputFormat}</p>
                            </>
                        )}
                        {activeTab === 'examples' && (
                            <>
                                {problem.examples && Array.isArray(problem.examples) && problem.examples.length > 0 ? (
                                    problem.examples.map((example, idx) => (
                                        <ExampleBlock key={idx} example={example} index={idx} />
                                    ))
                                ) : (
                                    <p>No examples provided for this problem.</p>
                                )}
                            </>
                        )}
                        {activeTab === 'constraints' && (
                            <>
                                {problem.constraints && Array.isArray(problem.constraints) && problem.constraints.length > 0 ? (
                                    <ul>
                                        {problem.constraints.map((constraint, idx) => (
                                            <li key={idx}>{constraint}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <pre>{(problem.constraints && problem.constraints.toString()) || 'N/A'}</pre>
                                )}
                            </>
                        )}
                    </div>

                    <button className={styles.scrollButton} onClick={scrollToTop} title="Scroll to Top">
                        <FaArrowUp />
                    </button>
                </div>

                {/* ========== RIGHT PANEL (Editor & Results) ========== */}
                <div className={styles.codeEditorPanel}>
                    <div className={styles.editorControls}>
                        <span className={styles.editorLabel}>Language:</span>
                        <select
                            className="editor-select"
                            value={selectedLanguage}
                            onChange={(e) => setSelectedLanguage(e.target.value)}
                            disabled={runLoading || submitLoading}
                        >
                            <option value="cpp">C++</option>
                            <option value="c">C</option>
                            <option value="python">Python</option>
                            <option value="java">Java</option>
                        </select>
                        <button onClick={handleResetCode} className={`${styles.bookmarkButton} glow-btn red`} disabled={runLoading || submitLoading}>
                            Reset
                        </button>
                        {/* Theme Toggle Button - Still Removed as per previous request */}
                    </div>

                    <div className={styles.editorContainer}>
                        {/* MonacoEditor is now dynamically imported */}
                        <MonacoEditor
                            height="100%"
                            language={selectedLanguage}
                            theme={isDarkTheme ? 'vs-dark' : 'vs-light'}
                            value={editorCode}
                            onChange={(newValue) => setEditorCode(newValue || '')}
                            options={{
                                minimap: { enabled: false },
                                lineNumbers: 'on',
                                wordWrap: 'on',
                                scrollBeyondLastLine: false,
                                fontSize: 14,
                                fontFamily: 'Fira Code, monospace',
                                renderLineHighlight: 'none',
                                readOnly: submitLoading || runLoading,
                            }}
                        />
                    </div>

                    <div className="button-group">
                        <button
                            onClick={handleRunInput}
                            className={`${styles.editorRunBtn} glow-btn blue`}
                            disabled={runLoading || submitLoading}
                        >
                            {runLoading ? 'Running...' : 'Run Input'}
                        </button>
                        <button
                            onClick={handleSubmitCode}
                            className={`${styles.editorSubmitBtn} glow-btn green`}
                            disabled={submitLoading || runLoading}
                        >
                            {submitLoading ? 'Submitting...' : 'Submit'}
                        </button>
                    </div>

                    {/* Results Panel */}
                    <div className={styles.resultsPanel}>
                        <div className={styles.resultsTabs}>
                            <button
                                className={`${styles.resultsTabButton} ${activeTab === 'output' ? 'oj-tab-btn active' : 'oj-tab-btn'}`}
                                onClick={() => setActiveTab('output')}
                            >
                                Output
                            </button>
                            <button
                                className={`${styles.resultsTabButton} ${activeTab === 'testcases' ? 'oj-tab-btn active' : 'oj-tab-btn'}`}
                                onClick={() => setActiveTab('testcases')}
                            >
                                Test Cases
                            </button>
                            <button
                                className={`${styles.resultsTabButton} ${activeTab === 'submissions' ? 'oj-tab-btn active' : 'oj-tab-btn'}`}
                                onClick={() => setActiveTab('submissions')}
                            >
                                Submissions
                            </button>
                            <button
                                className={`${styles.resultsTabButton} ${activeTab === 'aifeedback' ? 'oj-tab-btn active' : 'oj-tab-btn'}`}
                                onClick={() => setActiveTab('aifeedback')}
                            >
                                AI Feedback
                            </button>
                        </div>

                        <div className={styles.tabContent}>
                            {activeTab === 'output' && (
                                <>
                                    <h3 className={styles.outputTitle}>Custom Input:</h3>
                                    <textarea
                                        className="custom-input"
                                        placeholder="Optional custom input..."
                                        value={customInput}
                                        onChange={(e) => setCustomInput(e.target.value)}
                                        rows={4}
                                        disabled={runLoading || submitLoading}
                                    ></textarea>
                                    <h3 className={styles.outputTitle}>Output:</h3>
                                    <pre className="output-box">{output}</pre>
                                    {verdict && (
                                        <p
                                            className="verdict-status"
                                            style={{
                                                color:
                                                    verdict === 'Accepted'
                                                        ? 'lightgreen'
                                                        : verdict === 'Wrong Answer' || verdict === 'Time Limit Exceeded' || verdict === 'Runtime Error' || verdict === 'Compilation Error'
                                                            ? 'tomato'
                                                            : 'orange'
                                            }}
                                        >
                                            Verdict: {verdict}
                                        </p>
                                    )}
                                </>
                            )}
                            {activeTab === 'testcases' && (
                                <div className={styles.testCasesContainer}>
                                    {testCaseResults.length > 0 ? (
                                        testCaseResults.map((result, idx) => (
                                            <TestCaseItem key={idx} result={result} index={idx} />
                                        ))
                                    ) : (
                                        <p>Run your code or submit to see test case results.</p>
                                    )}
                                </div>
                            )}
                            {activeTab === 'submissions' && (
                                <div className={styles.submissionsContainer}>
                                    {submissions.length > 0 ? (
                                        submissions.map((sub) => (
                                            <div key={sub._id} className={styles.submissionItem}>
                                                <span className={`${styles.statusBadge} ${sub.status === 'Accepted' ? styles.statusPassed : styles.statusFailed}`}>
                                                    {sub.status === 'Accepted' ? <FaCheckCircle /> : <FaTimesCircle />} {sub.status}
                                                </span>
                                                <span>Lang: {sub.language}</span>
                                                <span>Time: {sub.timeTaken}ms</span>
                                                <span>Memory: {sub.memoryUsed}MB</span>
                                                <span>{sub.submittedAt}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p>No submissions yet. Submit your code to see history.</p>
                                    )}
                                </div>
                            )}
                            {activeTab === 'aifeedback' && (
                                <div className={styles.aiFeedbackSection}>
                                    <button
                                        onClick={getAICodeReview}
                                        className="glow-btn small"
                                        disabled={aiLoading || runLoading || submitLoading}
                                    >
                                        {aiLoading ? 'Reviewing...' : <> <FaRobot /> Get AI Review </>}
                                    </button>
                                    <pre className={styles.aiFeedbackBox}>
                                        {aiFeedback || 'Click "Get AI Review" to analyze your code.'}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div >
        </div>
    );
};

export default ProblemPage;
