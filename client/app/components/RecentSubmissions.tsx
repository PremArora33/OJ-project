import React from 'react';
import { FaCodeBranch } from 'react-icons/fa'; // Icon for table header

interface RecentSubmission {
  problemName: string;
  language: string;
  status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Runtime Error';
  timestamp: string;
}

interface RecentSubmissionsProps {
  submissions: RecentSubmission[];
}

const RecentSubmissions: React.FC<RecentSubmissionsProps> = ({ submissions }) => {
  return (
    // Apply dashboard-section and submissions-table-card classes
    <div className="dashboard-section submissions-table-card">
      <h3><FaCodeBranch /> Recent Submissions</h3>
      <div className="table-responsive">
        <table className="submissions-table"><thead>
            <tr>
              <th>Problem</th>
              <th>Language</th>
              <th>Status</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {submissions.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center text-link-color py-4">No recent submissions.</td>
              </tr>
            ) : (
              submissions.map((sub, index) => (
                <tr key={index}>
                  <td><a href="#" className="problem-title-link">{sub.problemName}</a></td>
                  <td>{sub.language}</td>
                  <td>
                    <span className={`status-badge status-${sub.status.toLowerCase().replace(/\s/g, '-')}`}>
                      {sub.status}
                    </span>
                  </td>
                  <td>{new Date(sub.timestamp).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentSubmissions;
