import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FaTrophy } from 'react-icons/fa'; // Icon for chart header

interface ProblemDifficulty {
  difficulty: 'Easy' | 'Medium' | 'Hard';
  count: number;
}

interface DifficultyBarChartProps {
  problemsByDifficulty: ProblemDifficulty[];
}

const DifficultyBarChart: React.FC<DifficultyBarChartProps> = ({ problemsByDifficulty }) => {
  const getBarColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'var(--status-accepted)';
      case 'Medium': return 'var(--status-tle)';
      case 'Hard': return 'var(--status-wrong)';
      default: return 'var(--primary-color)';
    }
  };

  return (
    // Apply dashboard-section and difficulty-chart-codemaster classes
    <div className="dashboard-section difficulty-chart-codemaster chart-card-codemaster">
      <h3><FaTrophy /> Problems by Difficulty</h3>
      <p className="chart-subtitle">Breakdown of problems solved by difficulty</p>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={problemsByDifficulty} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--td-border)" />
          <XAxis dataKey="difficulty" stroke="var(--link-color)" tickLine={false} />
          <YAxis stroke="var(--link-color)" tickLine={false} />
          <Tooltip
            cursor={{ fill: 'rgba(var(--primary-rgb-value), 0.1)' }}
            contentStyle={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '8px', boxShadow: 'var(--card-shadow)' }}
            labelStyle={{ color: 'var(--text-color)' }}
            itemStyle={{ color: 'var(--output-box-color)' }}
          />
          <Bar dataKey="count">
            {
              problemsByDifficulty.map((entry, index) => (
                <Bar key={`bar-${index}`} fill={getBarColor(entry.difficulty)} />
              ))
            }
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DifficultyBarChart;
