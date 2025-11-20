import { useState, useEffect } from "react";
import { getData, saveData } from "../utils/storage";
import React from "react";

export default function StudentDashboard() {
  const student = JSON.parse(localStorage.getItem("currentStudent"));

  const [info, setInfo] = useState({
    skills: student?.skills || "",
    cgpa: student?.cgpa || "",
    experience: student?.experience || "",
  });

  const [matchedJobs, setMatchedJobs] = useState([]);

  const h = (e) => setInfo({ ...info, [e.target.name]: e.target.value });

  const save = () => {
    const all = getData("students");
    const updated = all.map((s) =>
      s.id === student.id ? { ...s, ...info } : s
    );
    saveData("students", updated);
    localStorage.setItem(
      "currentStudent",
      JSON.stringify({ ...student, ...info })
    );
    alert("Profile Updated!");
  };

  // Matching Logic (same as admin page)
  useEffect(() => {
    const jobs = getData("jobs") || [];
    const matches = jobs.filter((job) => {
      const skillMatch = info.skills
        ?.toLowerCase()
        .includes(job.requiredSkill.toLowerCase());

      return (
        skillMatch &&
        Number(info.cgpa) >= Number(job.requiredCGPA) &&
        Number(info.experience) >= Number(job.requiredExperience)
      );
    });

    setMatchedJobs(matches);
  }, [info]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e3a8a] px-4 py-10">

      <div className="w-full max-w-3xl bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-10 animate-fadeIn">

        {/* Header */}
        <h2 className="text-4xl font-bold text-white text-center mb-8">
          Student Dashboard
        </h2>

        {/* Profile Overview */}
        <div className="glass-card mb-10">
          <h3 className="text-2xl font-semibold text-white mb-4">Your Profile</h3>

          <p className="text-white/80 mb-2">
            <strong>Name:</strong> {student.name}
          </p>
          <p className="text-white/80 mb-2">
            <strong>Email:</strong> {student.email}
          </p>
          <p className="text-white/80 mb-2">
            <strong>Skills:</strong> {info.skills || "Not Added"}
          </p>
          <p className="text-white/80 mb-2">
            <strong>CGPA:</strong> {info.cgpa || "Not Added"}
          </p>
          <p className="text-white/80 mb-2">
            <strong>Experience:</strong> {info.experience || "Not Added"} years
          </p>
        </div>

        {/* Editable Form */}
        <div className="glass-card mb-10">
          <h3 className="text-2xl font-semibold text-white mb-5">
            Update Your Profile
          </h3>

          <input
            name="skills"
            placeholder="Skills (react, node...)"
            className="glass-input"
            value={info.skills}
            onChange={h}
          />

          <input
            name="cgpa"
            placeholder="CGPA"
            className="glass-input"
            value={info.cgpa}
            onChange={h}
          />

          <input
            name="experience"
            placeholder="Experience (Years)"
            className="glass-input"
            value={info.experience}
            onChange={h}
          />

          <button
            onClick={save}
            className="w-full mt-4 bg-green-500/80 hover:bg-green-600 text-white py-3 rounded-xl text-lg font-semibold transition shadow-lg"
          >
            Save Profile
          </button>
        </div>

        {/* Matched Jobs */}
        <div className="glass-card">
          <h3 className="text-2xl font-semibold text-white mb-5">
            Matched Companies
          </h3>

          {matchedJobs.length === 0 ? (
            <p className="text-white/60 text-center">No matching jobs found yet.</p>
          ) : (
            matchedJobs.map((job) => (
              <div key={job.id} className="p-4 bg-white/10 rounded-xl mb-4 border border-white/20">
                <h4 className="text-xl text-white font-bold mb-1">{job.title}</h4>
                <p className="text-white/70">
                  Required Skill: {job.requiredSkill}
                </p>
                <p className="text-white/70">
                  CGPA ≥ {job.requiredCGPA}
                </p>
                <p className="text-white/70">
                  Experience ≥ {job.requiredExperience} years
                </p>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
