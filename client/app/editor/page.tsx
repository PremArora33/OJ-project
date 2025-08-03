"use client";

import Editor from "@monaco-editor/react";
import { useState, useEffect } from "react";
import Navbar from '../components/Navbar';
import { FaRocket, FaCode } from 'react-icons/fa';

export default function CodeEditorPage() {
  const [code, setCode] = useState(`#include<iostream>\nusing namespace std;\nint main() {\n  cout << "Hello, World!";\n  return 0;\n}`);
  const [language, setLanguage] = useState("cpp");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [aiReview, setAiReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Sync theme mode from body class
  useEffect(() => {
    const checkTheme = () => {
      if (typeof window !== "undefined") {
        setIsDarkMode(!document.body.classList.contains("light-mode"));
      }
    };

    checkTheme(); // Initial check
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.body, { attributes: true });

    return () => observer.disconnect();
  }, []);

  const handleRun = async () => {
    setLoading(true);
    setOutput("");
    try {
      const res = await fetch("http://localhost:8000/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code, input }),
      });

      const data = await res.json();
      if (typeof data === "string") setOutput(data);
      else if (typeof data.output === "string") setOutput(data.output);
      else if (typeof data.error === "string") setOutput(data.error);
      else setOutput("⚠️ Unknown response");
    } catch (err) {
      console.error("Compiler error:", err);
      setOutput("❌ Error connecting to compiler.");
    } finally {
      setLoading(false);
    }
  };

  const handleAIReview = async () => {
    setAiLoading(true);
    setAiReview("");
    try {
      const res = await fetch("http://localhost:5000/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });

      const data = await res.json();
      setAiReview(data?.explanation || "⚠️ No explanation received.");
    } catch (err) {
      console.error("AI error:", err);
      setAiReview("❌ Failed to get AI explanation.");
    } finally {
      setAiLoading(false);
    }
  };

  const monacoTheme = isDarkMode ? "vs-dark" : "vs-light";

  return (
    <div className="editor-page-container">
      <Navbar />

      <div className="oj-editor-panel-wrapper">
        <h1 className="editor-title">
          <FaRocket className="editor-title-icon" /> OJcompiler
        </h1>

        <div className="editor-controls">
          <label className="editor-label">Choose Language:</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="editor-select"
          >
            <option value="cpp">C++</option>
            <option value="c">C</option>
            <option value="java">Java</option>
            <option value="python">Python</option>
          </select>
        </div>

        <div className="editor-container">
          <div className="editor-simple-header">
            <FaCode className="editor-header-icon" />
            <span className="editor-header-text">Write your code here</span>
          </div>

          <Editor
            height="calc(100% - 40px)"
            defaultLanguage="cpp"
            language={language}
            value={code}
            onChange={(value) => setCode(value || "")}
            theme={monacoTheme}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollbar: {
                vertical: 'visible',
                horizontal: 'auto'
              },
            }}
          />
        </div>

        <div className="input-section">
          <h2 className="input-title">Input:</h2>
          <textarea
            placeholder="Optional input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={4}
            className="custom-input editor-textarea"
          />
        </div>

        <div className="button-group">
          <button
            onClick={handleRun}
            className="glow-btn editor-run-btn"
            disabled={loading}
          >
            {loading ? "Running..." : "Run Code"}
          </button>

          <button
            onClick={handleAIReview}
            className="glow-btn editor-run-btn"
            disabled={aiLoading}
            style={{ backgroundColor: "#28a745" }}
          >
            {aiLoading ? "AI Reviewing..." : "AI Review 🤖"}
          </button>
        </div>

        <div className="output-section">
          <h2 className="output-title">Output:</h2>
          <pre className="output-box editor-output-box">{output}</pre>
        </div>

        <div className="ai-section">
          <h2 className="output-title">AI Review:</h2>
          <pre className="output-box editor-output-box">
            {aiLoading ? "🤖 Thinking..." : aiReview}
          </pre>
        </div>
      </div>
    </div>
  );
}
