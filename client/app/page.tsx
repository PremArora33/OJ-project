"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar'; // ✅ Import shared Navbar
import {
  FaSun, FaMoon, FaCode, FaLightbulb, FaRocket, FaUsers, FaChartLine,
  FaCheckCircle, FaBook, FaPuzzlePiece, FaLaptopCode, FaQuoteLeft,
  FaTwitter, FaLinkedin, FaGithub, FaEnvelope
} from 'react-icons/fa';

export default function HomePage() {
  const [darkMode, setDarkMode] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem("darkMode");
      if (savedMode !== null) {
        setDarkMode(savedMode === "true");
      }
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem("darkMode", String(darkMode));
      document.body.classList.toggle("dark-mode", darkMode);
      document.body.classList.toggle("light-mode", !darkMode);
    }
  }, [darkMode, isClient]);

  return (
    <div className="homepage-container">
      {/* ✅ Reused Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Unleash Your Inner Coder</h1>
            <p>Sharpen your skills with real coding challenges. From beginner to pro – build, and grow.</p>
            <Link href="/problems">
              <button className="btn-primary">Start Solving</button>
            </Link>
          </div>
          <div className="hero-image">
            <img src="/code-block.svg" alt="Code Visual" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Why Choose OJverse?</h2>
        <p className="section-subtitle">Discover the powerful features designed to boost your coding journey.</p>
        <div className="features-grid">
          {[
            { icon: <FaCode />, title: 'Diverse Problem Set', desc: 'Tackle a wide array of coding challenges.' },
            { icon: <FaLightbulb />, title: 'Interactive Editor', desc: 'Write and test your code online.' },
            { icon: <FaRocket />, title: 'Real-time Feedback', desc: 'Get instant results on submissions.' },
            { icon: <FaUsers />, title: 'Community & Contests', desc: 'Join contests and track your growth.' },
            { icon: <FaChartLine />, title: 'Personalized Dashboard', desc: 'Visualize your progress.' },
            { icon: <FaCheckCircle />, title: 'Skill Improvement', desc: 'Ace your interviews with practice.' }
          ].map((feature, i) => (
            <div key={i} className="feature-card">
              <span className="feature-icon">{feature.icon}</span>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works-section">
        <h2 className="section-title">How OJverse Works</h2>
        <p className="section-subtitle">Your path to coding mastery in simple steps.</p>
        <div className="how-it-works-grid">
          {[
            { icon: <FaBook />, title: "Explore Problems", step: 1 },
            { icon: <FaLaptopCode />, title: "Write & Submit Code", step: 2 },
            { icon: <FaPuzzlePiece />, title: "Get Instant Feedback", step: 3 },
            { icon: <FaChartLine />, title: "Track Progress", step: 4 }
          ].map((step, i) => (
            <div key={i} className="how-it-works-step">
              <div className="step-icon-container">
                <span className="step-number">{step.step}</span>
                <span className="step-main-icon">{step.icon}</span>
              </div>
              <h3>{step.title}</h3>
              <p>{[
                "Browse through our extensive library.",
                "Use our editor to code and submit.",
                "Get feedback instantly with details.",
                "Track progress with your dashboard."
              ][i]}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Difficulty Overview */}
      <section className="problem-overview-section">
        <h2 className="section-title">Master Any Challenge</h2>
        <p className="section-subtitle">Problems categorized by difficulty and topics.</p>
        <div className="problem-overview-grid">
          {["easy", "medium", "hard"].map((level) => (
            <div key={level} className={`difficulty-card ${level}`}>
              <h3>{level.charAt(0).toUpperCase() + level.slice(1)} Problems</h3>
              <p>{{
                easy: "Perfect for beginners to grasp basics.",
                medium: "Intermediate challenges to level up.",
                hard: "Advanced puzzles for seasoned coders."
              }[level]}</p>
              <Link href={`/problems?difficulty=${level}`} className="explore-link">
                Explore {level.charAt(0).toUpperCase() + level.slice(1)} &rarr;
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <h2 className="section-title">What Our Users Say</h2>
        <p className="section-subtitle">Hear from developers who love OJverse.</p>
        <div className="testimonials-grid">
          {[
            { name: "Jane Doe", text: "OJverse transformed my coding journey!", color: "A044FF" },
            { name: "Alex Smith", text: "The variety is amazing. I improved a lot!", color: "00D97E" },
            { name: "Maria", text: "Helps me identify weak areas clearly!", color: "FF6347" }
          ].map((user, i) => (
            <div key={i} className="testimonial-card">
              <FaQuoteLeft className="quote-icon" />
              <p className="testimonial-text">"{user.text}"</p>
              <div className="testimonial-author">
                <img src={`https://placehold.co/50x50/${user.color}/FFFFFF/png?text=${user.name.split(' ').map(n => n[0]).join('')}`} alt="User Avatar" className="author-avatar" />
                <span className="author-name">{user.name}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2 className="cta-title">Ready to Level Up Your Coding Skills?</h2>
        <p className="cta-subtitle">Join OJverse today and start your journey to becoming a coding master.</p>
        <Link href="/signup">
          <button className="btn-primary cta-button">Join OJverse Now</button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="logo-group">
              <img src="/logo.svg" alt="logo" className="logo-icon" />
              <div className="logo">OJverse</div>
            </div>
            <p className="footer-tagline">Your ultimate platform for coding challenges.</p>
          </div>
          <div className="footer-links-group">
            <div className="footer-links-column">
              <h4>Quick Links</h4>
              <ul>
                <li><Link href="/problems">Problems</Link></li>
                <li><Link href="/contests">Contests</Link></li>
                <li><Link href="/dashboard">Dashboard</Link></li>
                <li><Link href="/editor">Compiler</Link></li>
              </ul>
            </div>
            <div className="footer-links-column">
              <h4>Company</h4>
              <ul>
                <li><Link href="/about">About Us</Link></li>
                <li><Link href="/contact">Contact</Link></li>
                <li><Link href="/privacy">Privacy Policy</Link></li>
                <li><Link href="/terms">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="footer-social">
            <h4>Connect With Us</h4>
            <div className="social-icons">
              <a href="https://twitter.com" target="_blank"><FaTwitter /></a>
              <a href="https://linkedin.com" target="_blank"><FaLinkedin /></a>
              <a href="https://github.com" target="_blank"><FaGithub /></a>
              <a href="mailto:info@ojverse.com"><FaEnvelope /></a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 OJverse. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
