import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FaChartLine } from 'react-icons/fa'; // Icon for chart header

interface ActivityLogEntry {
  date: string;
  problemsSolved: number;
}

interface ActivityChartProps {
  activityLog: ActivityLogEntry[];
}

const ActivityChart: React.FC<ActivityChartProps> = ({ activityLog }) => {
  const formattedData = activityLog.map(entry => ({
    ...entry,
    date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));

  return (
    // Apply dashboard-section and activity-chart-codemaster classes
    <div className="dashboard-section activity-chart-codemaster chart-card-codemaster">
      <h3><FaChartLine /> Problem Solving Activity</h3>
      <p className="chart-subtitle">Problems solved over the last 5 days</p>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={formattedData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--td-border)" />
          <XAxis dataKey="date" stroke="var(--link-color)" tickLine={false} />
          <YAxis stroke="var(--link-color)" tickLine={false} />
          <Tooltip
            cursor={{ stroke: 'var(--btn-primary-bg)', strokeWidth: 2 }}
            contentStyle={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '8px', boxShadow: 'var(--card-shadow)' }}
            labelStyle={{ color: 'var(--text-color)' }}
            itemStyle={{ color: 'var(--output-box-color)' }}
          />
          <Line
            type="monotone"
            dataKey="problemsSolved"
            stroke="url(#colorUv)"
            strokeWidth={3}
            dot={{ stroke: 'var(--primary-color)', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, strokeWidth: 3, fill: 'var(--primary-color)' }}
          />
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="1" y2="0">
              <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="var(--status-accepted)" stopOpacity={0.8}/>
            </linearGradient>
          </defs>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ActivityChart;
