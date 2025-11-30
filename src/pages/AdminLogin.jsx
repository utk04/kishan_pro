// src/pages/AdminLogin.jsx
import React, { useState } from "react";
import { admin } from "../data/dummyAdmin";

export default function AdminLogin() {
  const [email, setE] = useState("");
  const [password, setP] = useState("");

  const login = () => {
    if (email === admin.email && password === admin.password) {
      localStorage.setItem("admin", "true");
      window.location = "/admin-dashboard";
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e3a8a] p-6">
      <div className="w-full max-w-md glass-card">
        <h2 className="text-3xl font-bold text-white text-center mb-2">Admin Login</h2>
        <p className="text-white/70 mb-6 text-center">Enter admin credentials to manage the platform</p>

        <div className="space-y-4">
          <input placeholder="Admin Email" className="glass-input" onChange={(e) => setE(e.target.value)} value={email} />
          <input placeholder="Password" type="password" className="glass-input" onChange={(e) => setP(e.target.value)} value={password} />
        </div>

        <button onClick={login} className="mt-6 w-full btn-primary text-lg font-semibold">Login</button>
        <p className="text-center text-white/70 mt-4">
          Go to <a href="/" className="underline text-blue-300">Home</a>
        </p>
      </div>
    </div>
  );
}
