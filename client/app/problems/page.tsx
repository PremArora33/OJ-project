"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import { FaPuzzlePiece, FaSearch } from "react-icons/fa";

interface Problem {
  _id: string;
  title: string;
  code: string;
  description: string;
  difficulty: string;
  timeLimit: number;
  topic: string;
  createdAt: string;
}

export default function ProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [filtered, setFiltered] = useState<Problem[]>([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/problems");
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setProblems(data);
      setFiltered(data);
    } catch (error) {
      console.error("Failed to fetch problems:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and search problems
  useEffect(() => {
    let data = problems;
    if (filter !== "All") {
      data = data.filter(p => p.difficulty === filter);
    }
    if (search.trim()) {
      data = data.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFiltered(data);
  }, [filter, search, problems]);

  // Helper to return difficulty badge class
  const getDifficultyClass = (difficulty: string): string => {
    switch (difficulty) {
      case "Easy": return "difficulty-badge diff-easy";
      case "Medium": return "difficulty-badge diff-medium";
      case "Hard": return "difficulty-badge diff-hard";
      default: return "difficulty-badge";
    }
  };

  return (
    <main className="problem-page-layout-container">
      {/* ✅ Global Navbar */}
      <Navbar />

      {/* ✅ Page Title */}
      <div className="problem-page-title-section">
        <FaPuzzlePiece className="problem-page-title-icon" />
        <h1>Coding Challenges</h1>
      </div>

      {/* ✅ Filters and Search */}
      <div className="problem-page-content">
        <div className="problem-filters">
          <div className="filter-buttons">
            {["All", "Easy", "Medium", "Hard"].map((level) => (
              <button
                key={level}
                onClick={() => setFilter(level)}
                className={`filter-btn ${filter === level ? 'active' : ''}`}
              >
                {level}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search problems..."
            className="problem-search-input"
          />
        </div>

        {/* ✅ Problems Table */}
        <div className="problem-table-container">
          <table className="problem-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Tags</th>
                <th>Difficulty</th>
                <th>Time Limit</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6} className="loading-message">
                    Loading problems...
                  </td>
                </tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="no-problems-message">
                    No problems found.
                  </td>
                </tr>
              )}
              {!isLoading &&
                filtered.map((prob, index) => {
                  const isNew = isClient
                    ? new Date(prob.createdAt).getTime() >
                      Date.now() - 7 * 24 * 60 * 60 * 1000
                    : false;

                  return (
                    <tr
                      key={prob._id}
                      className="problem-table-row"
                      onMouseEnter={() => setHoveredRow(prob._id)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      <td>{index + 1}</td>
                      <td className="problem-title-cell">
                        {prob.title}
                        {isClient && isNew && (
                          <span className="new-badge">NEW</span>
                        )}
                      </td>
                      <td>
                        <span className="problem-tag">{prob.topic}</span>
                      </td>
                      <td>
                        <span className={getDifficultyClass(prob.difficulty)}>
                          {prob.difficulty}
                        </span>
                      </td>
                      <td>{prob.timeLimit}s</td>
                      <td>
                        <Link
                          href={`/problems/code/${prob._id}`}
                          title="Click to solve this problem"
                        >
                          <button className="solve-btn">Solve</button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
