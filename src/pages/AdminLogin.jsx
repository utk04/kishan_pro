import { useState } from "react";
import { admin } from "../data/dummyAdmin";
import React from "react";

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
    <div className="min-h-screen w-full flex items-center justify-center 
    bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e3a8a] px-4">

      {/* Glass Card */}
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl 
      border border-white/20 shadow-[0_8px_30px_rgba(0,0,0,0.4)]
      rounded-3xl p-10 animate-fadeIn">

        {/* Heading */}
        <h2 className="text-4xl font-bold text-white text-center mb-2 tracking-wide">
          Admin Login
        </h2>

        <p className="text-white/60 text-center mb-10 text-sm">
          Access your admin control panel
        </p>

        {/* Inputs */}
        <div className="space-y-6">

          {/* Email */}
          <div>
            <label className="text-white/80 text-sm mb-1 block">Admin Email</label>
            <input
              placeholder="admin@example.com"
              className="glass-input w-full"
              onChange={(e) => setE(e.target.value)}
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-white/80 text-sm mb-1 block">Password</label>
            <input
              placeholder="Enter password"
              type="password"
              className="glass-input w-full"
              onChange={(e) => setP(e.target.value)}
            />
          </div>
        </div>

        {/* Button */}
        <button
          className="w-full mt-8 bg-gradient-to-r from-blue-500/90 to-blue-700/90 
          hover:from-blue-400 hover:to-blue-600 transition-all text-white py-3 
          rounded-xl text-lg font-semibold shadow-lg hover:shadow-[0_10px_25px_rgba(0,0,0,0.4)]"
          onClick={login}
        >
          Login
        </button>

        {/* Footer */}
        <p className="text-center text-white/60 mt-6">
          Want to register a student?{" "}
          <a
            href="/register"
            className="text-blue-300 hover:text-blue-400 underline transition"
          >
            Register Here
          </a>
        </p>
      </div>
    </div>
  );
}
