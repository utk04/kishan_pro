// src/pages/StudentRegister.jsx
import React, { useState } from "react";
import { getData, saveData } from "../utils/storage";

export default function StudentRegister() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const register = () => {
    if (!form.name || !form.email || !form.password) {
      return alert("Please fill all fields");
    }
    const students = getData("students");
    const exists = students.find((s) => s.email === form.email);
    if (exists) return alert("Email already registered");
    students.push({ ...form, id: Date.now(), skills: "", cgpa: "", experience: "" });
    saveData("students", students);
    alert("Registered! You can login now.");
    window.location = "/student-login";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e3a8a] p-6">
      <div className="w-full max-w-lg glass-card">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 text-center">Student Registration</h1>
        <p className="text-white/70 mb-6 text-center">Create your account to apply for job postings</p>

        <div className="space-y-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Full Name"
            className="glass-input"
          />
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email Address"
            className="glass-input"
          />
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            className="glass-input"
          />
        </div>

        <button
          onClick={register}
          className="mt-6 w-full btn-primary text-lg font-semibold"
        >
          Register
        </button>

        <p className="text-center text-white/70 mt-4">
          Already have an account?{" "}
          <a href="/student-login" className="text-blue-300 underline">Login</a>
        </p>
      </div>
    </div>
  );
}
