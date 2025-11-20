import { useState } from "react";
import { getData } from "../utils/storage";
import React from "react";

export default function StudentLogin() {
  const [email, setE] = useState("");
  const [password, setP] = useState("");

  const login = () => {
    const students = getData("students");
    const user = students.find(
      (u) => u.email === email && u.password === password
    );
    if (!user) return alert("Invalid credentials");

    localStorage.setItem("currentStudent", JSON.stringify(user));
    window.location = "/student-dashboard";
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#1e3a8a] px-4">

      {/* Login Card */}
      <div className="w-full max-w-md glass-card p-10 animate-fadeIn">

        <h2 className="text-4xl font-extrabold text-white text-center mb-6 tracking-wide">
          Student Login
        </h2>

        <p className="text-white/70 text-center mb-8 text-sm">
          Welcome back! Enter your details to continue.
        </p>

        {/* Input Fields */}
        <div className="space-y-5">
          <div>
            <label className="text-white/80 text-sm pl-1">Email Address</label>
            <input
              placeholder="Enter your email"
              className="glass-input mt-1"
              onChange={(e) => setE(e.target.value)}
            />
          </div>

          <div>
            <label className="text-white/80 text-sm pl-1">Password</label>
            <input
              placeholder="Enter your password"
              type="password"
              className="glass-input mt-1"
              onChange={(e) => setP(e.target.value)}
            />
          </div>
        </div>

        {/* Button */}
        <button
          className="w-full mt-7 btn-primary text-lg font-semibold py-3 rounded-xl shadow-xl"
          onClick={login}
        >
          Login
        </button>

        {/* Register Link */}
        <p className="text-center text-white/70 mt-6 text-sm">
          Don't have an account?{" "}
          <a
            href="/"
            className="text-blue-300 hover:text-blue-400 transition font-semibold"
          >
            Register Now
          </a>
        </p>
      </div>
    </div>
  );
}
