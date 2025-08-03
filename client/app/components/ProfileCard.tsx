import React from 'react';
import { FaGlobe } from 'react-icons/fa'; // Example icon for global rank

interface ProfileCardProps {
  username: string;
  profileImageUrl?: string; // NEW: Accept profileImageUrl prop
}

const ProfileCard: React.FC<ProfileCardProps> = ({ username, profileImageUrl }) => {
  const globalRank = 12345; // Dummy rank for now

  return (
    <div className="dashboard-section profile-card-codemaster">
      <div className="profile-header-codemaster">
        {/* Display actual avatar image if available, otherwise fallback to first letter */}
        {profileImageUrl ? (
          <img src={profileImageUrl} alt={`${username}'s avatar`} className="profile-avatar-codemaster" />
        ) : (
          <div className="profile-avatar-codemaster flex items-center justify-center text-3xl font-bold text-white">
            {username.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="profile-info-codemaster">
          <h3>{username}</h3>
          <p className="global-rank-codemaster">
            <FaGlobe /> Global Rank: <span className="font-semibold">{globalRank}</span>
          </p>
        </div>
      </div>
      <div className="overall-progress-codemaster">
        <h4>Overall Progress</h4>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: '70%' }}></div>
          <span className="progress-bar-text">70%</span>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
