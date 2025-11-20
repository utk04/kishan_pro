import { useState } from "react";
import { saveData, getData } from "../utils/storage";
import React from "react";

export default function StudentRegister() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const h = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const reg = () => {
    const s = getData("students");
    s.push({ ...form, id: Date.now() });
    saveData("students", s);
    alert("Registered!");
  };

  return (
    <div className="glass-card">
      <h2 className="text-3xl font-bold text-center mb-3">Student Registration</h2>
      <p className="text-center text-white/70 mb-8">
        Create your student account to apply for jobs.
      </p>

      <input
        name="name"
        placeholder="Full Name"
        className="glass-input"
        onChange={h}
      />

      <input
        name="email"
        placeholder="Email Address"
        className="glass-input"
        onChange={h}
      />

      <input
        name="password"
        type="password"
        placeholder="Password"
        className="glass-input"
        onChange={h}
      />

      <button onClick={reg} className="btn-primary">
        Register
      </button>

      <p className="text-center mt-3">
        Already have an account?{" "}
        <a href="/student-login" className="text-blue-300 underline">
          Login
        </a>
      </p>
    </div>
  );
}
