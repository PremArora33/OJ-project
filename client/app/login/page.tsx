"use client";

import { useState, useEffect } from "react";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // ⬅️ Include cookies
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        console.log("✅ Login success:", data.user);

        // ✅ Save user ID locally for session tracking
        localStorage.setItem("loggedInUserId", data.user.id);

        alert("Login successful! Redirecting to dashboard...");
        window.location.href = "/dashboard";
      } else {
        alert("❌ Login failed: " + data.message);
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      alert("Something went wrong.");
    }
  };

  if (!mounted) return null;

  return (
    <main className="auth-container">
      <div className="auth-bg-code">
        function solve() &#123; return 42; &#125;
      </div>

      <img src="/dev-hero.svg" alt="Dev Background" className="auth-bg-img" />

      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Log In</h2>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button type="submit" className="btn-primary">
          Log In
        </button>
      </form>
    </main>
  );
}
