import React from 'react';
import { FaLightbulb } from 'react-icons/fa'; // Icon for recommended problems header

interface RecommendedProblem {
  problemName: string;
  tags: string[];
}

interface RecommendedProblemsProps {
  problems: RecommendedProblem[];
}

const RecommendedProblems: React.FC<RecommendedProblemsProps> = ({ problems }) => {
  return (
    // Apply dashboard-section and recommendations-card classes
    <div className="dashboard-section recommendations-card">
      <h3><FaLightbulb /> Recommended Problems</h3>
      {problems.length === 0 ? (
        <p className="text-link-color text-center py-4">No recommendations at the moment.</p>
      ) : (
        <ul className="recommended-list">
          {problems.map((problem, index) => (
            <li key={index} className="recommendation-item">
              <a href="#" className="problem-title-link">{problem.problemName}</a>
              <div className="problem-tags">
                {problem.tags.map((tag, tagIndex) => (
                  <span key={tagIndex} className="tag-badge">
                    {tag}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="view-all-recommendations">
        <button className="btn-secondary">View All</button>
      </div>
    </div>
  );
};

export default RecommendedProblems;
