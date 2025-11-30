import React, { useState, useEffect } from "react";
import { getData, saveData } from "../utils/storage";

/**
 * Admin dashboard prototype:
 * - Post job with title, requiredSkill, requiredCGPA, requiredExperience, jobDescription (JD)
 * - Two main actions:
 *    1) View Matches -> compute algorithmic match score & show matched students
 *    2) View Students -> show full student profiles (resume name, video if present) + rating UI
 *
 * Ratings are stored on the job object as job.ratings = { [studentId]: Number(0-10) }
 */

// small vocabulary used to extract keywords from the JD (you can expand)
const SKILLS_VOCAB = [
  "react",
  "javascript",
  "node",
  "node.js",
  "html",
  "css",
  "tailwind",
  "figma",
  "java",
  "python",
  "c++",
  "c",
  "sql",
  "mongodb",
  "express",
  "typescript",
  "communication",
  "management",
];

export default function AdminDashboard() {
  const [job, setJob] = useState({
    title: "",
    requiredSkill: "",
    requiredCGPA: "",
    requiredExperience: "",
    jobDescription: "",
  });

  const [mode, setMode] = useState("post"); // "post" | "matches" | "students"
  const [jobs, setJobs] = useState([]);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    setJobs(getData("jobs") || []);
    setStudents(getData("students") || []);
  }, []);

  const handleChange = (e) => setJob({ ...job, [e.target.name]: e.target.value });

  const addJob = () => {
    const all = getData("jobs");
    const newJob = { ...job, id: Date.now(), ratings: {} };
    all.push(newJob);
    saveData("jobs", all);
    setJobs(all);
    setJob({
      title: "",
      requiredSkill: "",
      requiredCGPA: "",
      requiredExperience: "",
      jobDescription: "",
    });
    alert("Job Added!");
  };

  // ----- Helpers for algorithmic matching -----
  // extract keywords from jobDescription (limited to SKILLS_VOCAB)
  const extractKeywordsFromJD = (jd) => {
    if (!jd) return [];
    const text = jd.toLowerCase();
    const found = new Set();
    SKILLS_VOCAB.forEach((s) => {
      if (text.includes(s.toLowerCase())) found.add(s.toLowerCase());
    });
    return Array.from(found);
  };

  // normalize student.skills string to array of lowercase tokens
  const parseStudentSkills = (skillStr) =>
    (skillStr || "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

  // compute algorithmic score 0..100
  const computeAlgorithmScore = (jobItem, student) => {
    const jdKeywords = extractKeywordsFromJD(jobItem.jobDescription || "");
    const studentSkills = parseStudentSkills(student.skills || "");

    // skill score
    let skillScore = 0;
    if (jdKeywords.length > 0) {
      const matched = jdKeywords.filter((k) => studentSkills.includes(k));
      skillScore = (matched.length / jdKeywords.length) * 100;
    } else {
      // if JD has no keywords but job.requiredSkill exists, test that single skill
      if (jobItem.requiredSkill) {
        skillScore = studentSkills.includes(jobItem.requiredSkill.toLowerCase())
          ? 100
          : 0;
      } else {
        skillScore = 0;
      }
    }

    // CGPA score
    const requiredCgpa = Number(jobItem.requiredCGPA) || 0;
    let cgpaScore = 100;
    if (requiredCgpa > 0) {
      const studentCgpa = Number(student.cgpa) || 0;
      cgpaScore = Math.min((studentCgpa / requiredCgpa) * 100, 100);
    }

    // Experience score
    const requiredExp = Number(jobItem.requiredExperience) || 0;
    let expScore = 100;
    if (requiredExp > 0) {
      const studentExp = Number(student.experience) || 0;
      expScore = Math.min((studentExp / requiredExp) * 100, 100);
    }

    // weights: skill 60%, cgpa 25%, exp 15%
    const algorithmic =
      0.6 * skillScore + 0.25 * cgpaScore + 0.15 * expScore;

    return Math.round(algorithmic); // 0..100
  };

  // get admin rating for a job+student (0..10)
  const getAdminRating = (jobItem, studentId) =>
    (jobItem.ratings && jobItem.ratings[studentId]) || 0;

  // set admin rating and persist
  const setAdminRating = (jobId, studentId, rating) => {
    const allJobs = getData("jobs") || [];
    const updated = allJobs.map((j) => {
      if (j.id === jobId) {
        const r = { ...(j.ratings || {}) };
        r[studentId] = Number(rating);
        return { ...j, ratings: r };
      }
      return j;
    });
    saveData("jobs", updated);
    setJobs(updated);
  };

  // compute final combined score: 80% algorithm + 20% admin (admin rating 0-10 mapped to 0-100)
  const computeFinalScore = (jobItem, student) => {
    const alg = computeAlgorithmScore(jobItem, student);
    const adminR = getAdminRating(jobItem, student.id) || 0;
    const adminScaled = Math.min(Math.max(Number(adminR), 0), 10) * 10;
    const finalScore = 0.8 * alg + 0.2 * adminScaled;
    return Math.round(finalScore);
  };

  // UI small helper: toggle mode
  const showMode = (m) => {
    // refresh data from storage when switching
    setJobs(getData("jobs") || []);
    setStudents(getData("students") || []);
    setMode(m);
  };

  return (
    <div className="min-h-screen w-full flex items-start justify-center bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e3a8a] p-6">
      <div className="w-full max-w-5xl p-8">
        {/* Header + two main buttons */}
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <div className="flex gap-3">
            <button
              onClick={() => showMode("matches")}
              className={`px-4 py-2 rounded-xl font-semibold shadow-lg ${
                mode === "matches"
                  ? "bg-blue-600 text-white"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              Matches (Algorithm)
            </button>

            <button
              onClick={() => showMode("students")}
              className={`px-4 py-2 rounded-xl font-semibold shadow-lg ${
                mode === "students"
                  ? "bg-purple-600 text-white"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              All Students
            </button>

            <button
              onClick={() => showMode("post")}
              className={`px-4 py-2 rounded-xl font-semibold shadow-lg ${
                mode === "post"
                  ? "bg-green-600 text-white"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              Post Job
            </button>
          </div>
        </header>

        {/* ------------- POST JOB MODE ------------- */}
        {mode === "post" && (
          <div className="glass-card p-6">
            <h2 className="text-2xl text-white font-semibold mb-4">
              Post New Job
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                name="title"
                value={job.title}
                onChange={handleChange}
                placeholder="Job Title"
                className="glass-input"
              />
              <input
                name="requiredSkill"
                value={job.requiredSkill}
                onChange={handleChange}
                placeholder="Primary Skill (e.g. react)"
                className="glass-input"
              />
              <input
                name="requiredCGPA"
                value={job.requiredCGPA}
                onChange={handleChange}
                placeholder="Min CGPA (numeric)"
                className="glass-input"
              />
              <input
                name="requiredExperience"
                value={job.requiredExperience}
                onChange={handleChange}
                placeholder="Min Experience (years)"
                className="glass-input"
              />
            </div>

            <label className="block mt-4 text-white/80 mb-2">Job Description (JD)</label>
            <textarea
              name="jobDescription"
              value={job.jobDescription}
              onChange={handleChange}
              placeholder="Paste the JD / responsibilities / required tech stack..."
              className="glass-input h-28"
            />

            <button
              onClick={addJob}
              className="mt-4 w-full bg-blue-500/80 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold"
            >
              + Add Job Posting
            </button>
          </div>
        )}

        {/* ------------- MATCHES MODE ------------- */}
        {mode === "matches" && (
          <div className="mt-6 space-y-6">
            {jobs.length === 0 && (
              <div className="glass-card p-6">
                <p className="text-white/80">No jobs posted yet.</p>
              </div>
            )}

            {jobs.map((j) => {
              // compute algorithmic matches: include students with algorithmic score > threshold (say >30)
              const algMatches = students
                .map((s) => ({ s, algScore: computeAlgorithmScore(j, s) }))
                .filter((x) => x.algScore > 30) // threshold: tweakable
                .sort((a, b) => b.algScore - a.algScore);

              return (
                <div key={j.id} className="glass-card p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl text-white font-bold">{j.title}</h3>
                      <p className="text-white/80">
                        <strong>Primary Skill:</strong> {j.requiredSkill || "—"}
                      </p>
                      <p className="text-white/80">
                        <strong>CGPA:</strong> {j.requiredCGPA || "—"} &nbsp;{" "}
                        <strong>Exp:</strong> {j.requiredExperience || "—"}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-white/90 font-medium">Algorithm-based matches</p>
                      <p className="text-white/70 text-sm">Candidates: {algMatches.length}</p>
                    </div>
                  </div>

                  <hr className="border-white/20 my-4" />

                  {algMatches.length === 0 ? (
                    <p className="text-white/60">No algorithmic matches above threshold.</p>
                  ) : (
                    <div className="space-y-3">
                      {algMatches.map(({ s, algScore }) => {
                        const adminR = getAdminRating(j, s.id);
                        const final = computeFinalScore(j, s);
                        return (
                          <div key={s.id} className="bg-white/6 p-3 rounded-lg border border-white/10 flex items-center justify-between">
                            <div>
                              <p className="text-white font-medium">{s.name} <span className="text-white/70 text-sm">— {s.email}</span></p>
                              <p className="text-white/60 text-sm">Algorithm Score: {algScore}%</p>
                              <p className="text-white/60 text-sm">Admin Rating: {adminR} / 10</p>
                              <p className="text-white/80 mt-1 text-sm">Final Score: <span className="font-semibold">{final}%</span></p>
                            </div>

                            <div className="flex flex-col gap-2 items-end">
                              <a href={`/student-dashboard`} className="text-sm text-blue-300 underline">Open Profile</a>
                              <div className="flex gap-2 items-center">
                                <input
                                  type="number"
                                  min="0"
                                  max="10"
                                  step="1"
                                  defaultValue={adminR || 0}
                                  onBlur={(e) => {
                                    const val = Number(e.target.value);
                                    if (isNaN(val) || val < 0 || val > 10) {
                                      alert("Please enter rating 0–10");
                                      return;
                                    }
                                    setAdminRating(j.id, s.id, val);
                                  }}
                                  className="glass-input w-24 p-2 text-white text-center"
                                />
                                <span className="text-white/70 text-sm">/10</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ------------- STUDENTS MODE ------------- */}
        {mode === "students" && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {students.length === 0 && (
              <div className="glass-card p-6">
                <p className="text-white/80">No students registered yet.</p>
              </div>
            )}

            {students.map((s) => (
              <div key={s.id} className="glass-card p-5">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white">{s.name}</h3>
                    <p className="text-white/80 text-sm mb-2">{s.email}</p>

                    <p className="text-white/80 text-sm"><strong>Skills:</strong> {s.skills || "—"}</p>
                    <p className="text-white/80 text-sm"><strong>CGPA:</strong> {s.cgpa || "—"}</p>
                    <p className="text-white/80 text-sm"><strong>Experience:</strong> {s.experience || "—"} years</p>

                    <p className="text-white/80 text-sm mt-2"><strong>Resume:</strong> {s.resumeName || "No resume uploaded"}</p>

                    {/* If resume data URL exists (optional), provide download link */}
                    {s.resumeDataUrl ? (
                      <a className="inline-block mt-2 text-sm text-blue-300 underline" href={s.resumeDataUrl} download={`${s.name}_resume.pdf`} >
                        Download Resume
                      </a>
                    ) : null}
                  </div>

                  <div className="w-40">
                    {s.videoDataUrl ? (
                      <video controls src={s.videoDataUrl} className="w-full rounded-md border border-white/10" />
                    ) : (
                      <div className="w-full h-24 bg-white/5 rounded-md flex items-center justify-center text-white/60 text-sm">
                        No video
                      </div>
                    )}
                  </div>
                </div>

                {/* Admin quick actions */}
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => {
                      const confirmed = confirm(`Delete student ${s.name}? This will remove them from localStorage.`);
                      if (!confirmed) return;
                      const all = getData("students").filter((x) => x.id !== s.id);
                      saveData("students", all);
                      setStudents(all);
                      alert("Student deleted.");
                    }}
                    className="px-3 py-2 bg-red-600/80 hover:bg-red-700 rounded-md text-white text-sm"
                  >
                    Delete
                  </button>

                  <button
                    onClick={() => {
                      // open student profile or show more - for prototype simply navigate
                      localStorage.setItem("selectedStudentForAdmin", JSON.stringify(s));
                      window.location = "/student-dashboard"; // or a dedicated admin-student page
                    }}
                    className="px-3 py-2 bg-blue-500/70 hover:bg-blue-600 rounded-md text-white text-sm"
                  >
                    Open Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
