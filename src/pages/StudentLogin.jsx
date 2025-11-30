// src/pages/StudentLogin.jsx
import React, { useState } from "react";
import { getData } from "../utils/storage";

export default function StudentLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = () => {
    const students = getData("students");
    const user = students.find((u) => u.email === email && u.password === password);
    if (!user) return alert("Invalid credentials");
    localStorage.setItem("currentStudent", JSON.stringify(user));
    window.location = "/student-dashboard";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e3a8a] p-6">
      <div className="w-full max-w-md glass-card">
        <h2 className="text-3xl font-bold text-white text-center mb-2">Student Login</h2>
        <p className="text-white/70 mb-6 text-center">Welcome back — sign in to continue</p>

        <div className="space-y-4">
          <input
            placeholder="Email"
            className="glass-input"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />
          <input
            placeholder="Password"
            type="password"
            className="glass-input"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
        </div>

        <button
          onClick={login}
          className="mt-6 w-full btn-primary text-lg font-semibold"
        >
          Login
        </button>

        <p className="text-center text-white/70 mt-4">
          Don’t have an account? <a href="/" className="text-blue-300 underline">Register</a>
        </p>
      </div>
    </div>
  );
}
