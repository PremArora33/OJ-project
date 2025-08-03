"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaTimesCircle, FaCheckCircle } from "react-icons/fa";

export default function SignupPage() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [mounted, setMounted] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        // This is the updated section.
        // It now correctly checks for 'loggedInUserId' from the backend response.
        if (data.user && data.user.loggedInUserId) {
          console.log("✅ Signup success, user ID:", data.user.loggedInUserId);
          localStorage.setItem("loggedInUserId", data.user.loggedInUserId);
          showMessage(
            "success",
            "Registration successful! Redirecting to dashboard..."
          );
          router.push("/dashboard");
        } else {
          showMessage(
            "error",
            "Registration successful, but user ID not found in response."
          );
          console.error(
            "Registration successful, but user ID not found in response:",
            data
          );
        }
      } else {
        showMessage(
          "error",
          "Registration failed: " + (data.message || "Unknown error.")
        );
        console.error("❌ Registration failed:", data);
      }
    } catch (error) {
      console.error("❌ Registration error:", error);
      showMessage(
        "error",
        "Something went wrong during registration. Please try again."
      );
    }
  };

  if (!mounted) return null;

  return (
    <main className="auth-container">
      <div className="auth-bg-code">
        const register = () =&gt; &#123; return true; &#125;
      </div>

      <img
        src="/dev-hero.svg"
        alt="Dev Illustration"
        className="auth-bg-img"
      />

      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Sign Up</h2>
        {message && (
          <div className={`message-box ${message.type}`}>
            {message.type === "success" ? <FaCheckCircle /> : <FaTimesCircle />}
            <p>{message.text}</p>
          </div>
        )}
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
        />
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
          Sign Up
        </button>
        <div className="login-prompt">
          Already registered?{" "}
          <a href="/login" className="login-link">
            Login here
          </a>
        </div>
      </form>
    </main>
  );
}