'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaSun, FaMoon } from 'react-icons/fa';

export default function Navbar() {
  const [darkMode, setDarkMode] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);

    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      if (savedMode !== null) {
        setDarkMode(savedMode === 'true');
      }

      const userId = localStorage.getItem('loggedInUserId');
      setIsLoggedIn(!!userId);
    }
  }, []);

  useEffect(() => {
    if (!isClient) return;

    localStorage.setItem('darkMode', String(darkMode));
    document.body.classList.toggle('dark-mode', darkMode);
    document.body.classList.toggle('light-mode', !darkMode);
  }, [darkMode, isClient]);

  const handleToggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem('loggedInUserId');
    setIsLoggedIn(false);
    router.push('/login');
  };

  const handleDashboardClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    const userId = localStorage.getItem('loggedInUserId');
    if (userId) {
      router.push('/dashboard');
    } else {
      alert('⚠️ Please log in to access the Dashboard.');
      router.push('/login');
    }
  };

  return (
    <nav className="navbar">
      <Link href="/" className="logo-link">
        <div className="logo-group">
          <img src="/logo.svg" alt="logo" className="logo-icon" />
          <div className="logo">OJverse</div>
        </div>
      </Link>

      <ul className="nav-links">
        <li><Link href="/problems">Problems</Link></li>
        <li><Link href="/editor">Compiler</Link></li>

        <li>
          <Link href="#" onClick={handleDashboardClick}>
            Dashboard
          </Link>
        </li>

        {isLoggedIn ? (
          <li>
            <button onClick={handleLogout} className="btn-primary">
              Logout
            </button>
          </li>
        ) : (
          <>
            <li><Link href="/login">Log In</Link></li>
            <li>
              <Link href="/signup">
                <button className="btn-primary">Sign Up</button>
              </Link>
            </li>
          </>
        )}

        <li>
          <button className="theme-toggle-btn" onClick={handleToggleTheme}>
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
        </li>
      </ul>
    </nav>
  );
}
