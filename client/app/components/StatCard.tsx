import React from 'react';
import { FaCheckCircle, FaChartLine } from 'react-icons/fa'; // Import icons as needed

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: string; // Optional icon name to render
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon }) => {
  const renderIcon = () => {
    switch (icon) {
      case 'FaCheckCircle': return <FaCheckCircle className="stat-icon-codemaster" />;
      case 'FaChartLine': return <FaChartLine className="stat-icon-codemaster" />;
      default: return null;
    }
  };

  return (
    // Apply dashboard-section and stat-card-small classes from dashboard.css
    <div className="dashboard-section stat-card-small">
      {renderIcon()}
      <p className="stat-value-codemaster">{value}</p>
      <h3 className="stat-label-codemaster">{label}</h3>
    </div>
  );
};

export default StatCard;
