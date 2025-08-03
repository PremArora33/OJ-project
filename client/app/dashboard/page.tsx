"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FaTachometerAlt,
  FaCode,
  FaFileAlt,
  FaTrophy,
  FaCog
} from 'react-icons/fa';

import Navbar from '../components/Navbar';
import ProfileCard from '../components/ProfileCard';
import StatCard from '../components/StatCard';
import ActivityChart from '../components/ActivityChart';
import DifficultyBarChart from '../components/DifficultyBarChart';
import RecentSubmissions from '../components/RecentSubmissions';
import RecommendedProblems from '../components/RecommendedProblems';
import AvatarSelectionModal from '../components/AvatarSelectionModal';

interface ProblemDifficulty {
  difficulty: 'Easy' | 'Medium' | 'Hard';
  count: number;
}

interface ActivityLogEntry {
  date: string;
  problemsSolved: number;
}

interface RecentSubmission {
  problemName: string;
  language: string;
  status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Runtime Error';
  timestamp: string;
}

interface RecommendedProblem {
  problemName: string;
  tags: string[];
}

interface DashboardData {
  username: string;
  totalProblemsSolved: number;
  acceptanceRate: number;
  problemsByDifficulty: ProblemDifficulty[];
  activityLog: ActivityLogEntry[];
  recentSubmissions: RecentSubmission[];
  recommendedProblems: RecommendedProblem[];
  profileImageUrl?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLink, setActiveLink] = useState('/dashboard');
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem('loggedInUserId');

    if (!storedUserId) {
      setError("No user logged in. Please log in to view your dashboard.");
      setLoading(false);
      router.push('/login');
    } else {
      setCurrentUserId(storedUserId);
      fetchDashboardData(storedUserId);
    }
  }, []);

  const fetchDashboardData = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:5000/api/dashboard/${userId}`, {
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to fetch dashboard data');
      }

      const data: DashboardData = await res.json();
      setDashboardData(data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAvatar = async (imageUrl: string) => {
    setIsAvatarModalOpen(false);

    if (!currentUserId) {
      setError("Please log in to update your avatar.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/users/${currentUserId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ profileImageUrl: imageUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update avatar');
      }

      const updatedUser = await response.json();
      const newUrl = updatedUser.user?.profileImageUrl || "https://placehold.co/36x36/A044FF/FFFFFF?text=U";

      setDashboardData(prev => prev ? {
        ...prev,
        profileImageUrl: newUrl,
      } : null);
    } catch (err: any) {
      setError(err.message || 'Error updating avatar.');
    }
  };

  if (loading) {
    return (
      <div className="dashboard-layout-container flex justify-center items-center min-h-screen">
        <p className="text-xl text-gray-400">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-layout-container flex justify-center items-center min-h-screen flex-col">
        <p className="text-xl text-red-500">Error: {error}</p>
        <div className="login-prompt mt-4">
          <Link href="/login" className="login-link">Go to Login</Link>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="dashboard-layout-container flex justify-center items-center min-h-screen flex-col">
        <p className="text-xl text-gray-400">No dashboard data available.</p>
        <Link href="/login" className="login-link mt-4">Go to Login</Link>
      </div>
    );
  }

  return (
    <div className="dashboard-layout-container">
      <Navbar />

      <div className="dashboard-main-wrapper">
        <aside className="dashboard-sidebar">
          <nav className="sidebar-nav">
            <li>
              <Link href="/dashboard" className={`sidebar-link ${activeLink === '/dashboard' ? 'active' : ''}`} onClick={() => setActiveLink('/dashboard')}>
                <FaTachometerAlt /> Dashboard
              </Link>
            </li>
            <li>
              <Link href="/problems" className={`sidebar-link ${activeLink === '/problems' ? 'active' : ''}`} onClick={() => setActiveLink('/problems')}>
                <FaCode /> Problems
              </Link>
            </li>
            <li>
              <Link href="/submissions" className={`sidebar-link ${activeLink === '/submissions' ? 'active' : ''}`} onClick={() => setActiveLink('/submissions')}>
                <FaFileAlt /> Submissions
              </Link>
            </li>
            <li>
              <Link href="/contests" className={`sidebar-link ${activeLink === '/contests' ? 'active' : ''}`} onClick={() => setActiveLink('/contests')}>
                <FaTrophy /> Contests
              </Link>
            </li>
          </nav>
          <div className="sidebar-settings">
            <Link href="/settings" className={`sidebar-link ${activeLink === '/settings' ? 'active' : ''}`} onClick={() => setActiveLink('/settings')}>
              <FaCog /> Settings
            </Link>
          </div>
          <p className="copyright-text">&copy; 2024 OJverse</p>
        </aside>

        <main className="dashboard-content-grid">
          <div className="profile-card-codemaster">
            <ProfileCard username={dashboardData.username} profileImageUrl={dashboardData.profileImageUrl} />
          </div>
          <div className="total-problems-solved">
            <StatCard label="Problems Solved" value={dashboardData.totalProblemsSolved} icon="FaCheckCircle" />
          </div>
          <div className="acceptance-rate">
            <StatCard label="Acceptance Rate" value={`${dashboardData.acceptanceRate}%`} icon="FaChartLine" />
          </div>
          <div className="difficulty-chart-codemaster">
            <DifficultyBarChart problemsByDifficulty={dashboardData.problemsByDifficulty} />
          </div>
          <div className="activity-chart-codemaster">
            <ActivityChart activityLog={dashboardData.activityLog} />
          </div>
          <div className="submissions-table-card">
            <RecentSubmissions submissions={dashboardData.recentSubmissions} />
          </div>
          <div className="recommendations-card">
            <RecommendedProblems problems={dashboardData.recommendedProblems} />
          </div>
        </main>
      </div>

      <AvatarSelectionModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        onSelectAvatar={handleSelectAvatar}
        currentAvatar={dashboardData.profileImageUrl || "https://placehold.co/36x36/A044FF/FFFFFF?text=U"}
      />
    </div>
  );
}
