import { useState } from "react";
import { getData, saveData } from "../utils/storage";
import React from "react";

export default function AdminDashboard() {
  const [job, setJob] = useState({
    title: "",
    requiredSkill: "",
    requiredCGPA: "",
    requiredExperience: "",
  });

  const h = (e) => setJob({ ...job, [e.target.name]: e.target.value });

  const add = () => {
    const jobs = getData("jobs");
    jobs.push({ ...job, id: Date.now() });
    saveData("jobs", jobs);
    alert("Job Added!");
  };

  const students = getData("students");

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e3a8a] p-6">

      <div className="w-full max-w-4xl bg-white/10 backdrop-blur-2xl 
      border border-white/20 shadow-2xl rounded-3xl p-10 
      animate-fadeIn">

        {/* Header */}
        <h1 className="text-4xl font-bold text-white text-center mb-10 drop-shadow-lg">
          Admin Dashboard
        </h1>

        {/* Post Job Section */}
        <div className="mb-12">
          <h2 className="text-2xl text-white font-semibold mb-5">
            Post a New Job
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="title"
              placeholder="Job Title"
              className="glass-input"
              onChange={h}
            />
            <input
              name="requiredSkill"
              placeholder="Required Skill"
              className="glass-input"
              onChange={h}
            />
            <input
              name="requiredCGPA"
              placeholder="Required CGPA"
              className="glass-input"
              onChange={h}
            />
            <input
              name="requiredExperience"
              placeholder="Required Experience"
              className="glass-input"
              onChange={h}
            />
          </div>

          <button
            className="w-full mt-6 py-3 rounded-xl bg-blue-500/80 
            hover:bg-blue-600 transition-all text-white font-semibold 
            shadow-lg hover:shadow-[0_0_20px_rgba(0,128,255,0.6)]"
            onClick={add}
          >
            + Add Job Posting
          </button>
        </div>

        <hr className="border-white/20 my-10" />

        {/* Registered Students Section */}
        <div>
          <h2 className="text-2xl text-white font-semibold mb-5">
            Registered Students
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {students.length === 0 && (
              <p className="text-white/70">No students registered yet.</p>
            )}

            {students.map((s) => (
              <div
                key={s.id}
                className="bg-white/10 p-4 rounded-xl border border-white/20 
                hover:bg-white/20 transition-all shadow-md"
              >
                <p className="text-lg text-white font-medium">{s.name}</p>
                <p className="text-white/70 text-sm">{s.email}</p>
              </div>
            ))}
          </div>
        </div>

        {/* View Matches Button */}
        <a
          href="/matches"
          className="block w-full mt-12 py-3 text-center rounded-xl 
          bg-purple-500/80 hover:bg-purple-600 transition-all text-white
          font-semibold shadow-lg hover:shadow-[0_0_20px_rgba(128,0,255,0.6)]"
        >
          🔍 View Matching Results
        </a>
      </div>
    </div>
  );
}
