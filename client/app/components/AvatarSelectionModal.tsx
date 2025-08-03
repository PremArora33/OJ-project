import React from 'react';
import { FaTimes } from 'react-icons/fa'; // For the close icon

interface AvatarSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAvatar: (imageUrl: string) => void;
  currentAvatar: string;
}

// IMPORTANT: Replace these URLs with the actual paths to your downloaded cartoon avatar images
const cartoonAvatars: string[] = [
  "/avatars/avatar1.png", // Path to your first downloaded avatar
  "/avatars/avatar2.png", // Path to your second downloaded avatar
  "/avatars/avatar3.png", // Path to your third downloaded avatar
  "/avatars/avatar4.png", // And so on...
  "/avatars/avatar5.png",
  "/avatars/avatar6.png",
  "/avatars/avatar7.png",
  "/avatars/avatar8.png",
  // Add more as needed based on how many avatars you download
];

const AvatarSelectionModal: React.FC<AvatarSelectionModalProps> = ({ isOpen, onClose, onSelectAvatar, currentAvatar }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content dashboard-card">
        <div className="modal-header">
          <h2 className="modal-title">Select Your Avatar</h2>
          <button onClick={onClose} className="modal-close-btn">
            <FaTimes />
          </button>
        </div>
        <div className="avatar-grid">
          {cartoonAvatars.map((avatarUrl, index) => (
            <div
              key={index}
              className={`avatar-option ${currentAvatar === avatarUrl ? 'selected' : ''}`}
              onClick={() => onSelectAvatar(avatarUrl)}
            >
              <img src={avatarUrl} alt={`Avatar ${index + 1}`} className="avatar-image" />
            </div>
          ))}
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn-secondary">Close</button>
        </div>
      </div>
    </div>
  );
};

export default AvatarSelectionModal;
