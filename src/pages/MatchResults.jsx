// src/pages/MatchResults.jsx
import React from "react";
import { getData } from "../utils/storage";
import { parseSkillSet, skillOverlap } from "../utils/skills";

/*
  Expect jobs to have:
    { id, title, requiredSkills (string), requiredCGPA, requiredExperience }
  Expect students to have:
    { id, name, email, skills (string), cgpa, experience }
*/

export default function MatchResults() {
  const jobs = getData("jobs") || [];
  const students = getData("students") || [];

  // helper to compute matched students for a job
  function computeMatchesForJob(job) {
    const jobSkills = parseSkillSet(job.requiredSkills || "");
    if (jobSkills.length === 0) {
      // no skills -> no matches
      return [];
    }

    // map students to score + common skills
    const scored = students.map((s) => {
      const { common, score } = skillOverlap(job.requiredSkills || "", s.skills || "");
      // optional: enforce CGPA and experience minima
      const cgpaOk = job.requiredCGPA ? Number(s.cgpa || 0) >= Number(job.requiredCGPA) : true;
      const expOk = job.requiredExperience ? Number(s.experience || 0) >= Number(job.requiredExperience) : true;
      const passesHardFilters = cgpaOk && expOk;

      // percent match relative to job skills (useful)
      const percent = jobSkills.length ? Math.round((score / jobSkills.length) * 100) : 0;

      return {
        student: s,
        score,
        common,
        percent,
        passesHardFilters,
      };
    });

    // keep only students that pass hard filters and have at least one matched skill
    const filtered = scored.filter((r) => r.passesHardFilters && r.score > 0);

    // sort descending by score then percent then name
    filtered.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.percent !== a.percent) return b.percent - a.percent;
      return a.student.name.localeCompare(b.student.name);
    });

    return filtered;
  }

  return (
    <div style={{ minHeight: "100vh", padding: 40, background: "linear-gradient(135deg,#0f172a,#1e3a8a)", color: "#fff", fontFamily: "Inter, sans-serif" }}>
      <h1 style={{ fontSize: 38, marginBottom: 25, fontWeight: 700, textAlign: "center" }}>Matching Results</h1>

      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gap: 24 }}>
        {jobs.map((job) => {
          const matches = computeMatchesForJob(job);

          return (
            <div key={job.id} style={{
              padding: 24,
              borderRadius: 18,
              background: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
            }}>
              <h2 style={{ fontSize: 22, margin: "0 0 10px 0" }}>{job.title}</h2>
              <p style={{ margin: "6px 0" }}><strong>Required Skills:</strong> {job.requiredSkills || "-"}</p>
              <p style={{ margin: "6px 0" }}><strong>Required CGPA:</strong> {job.requiredCGPA || "—"}</p>
              <p style={{ margin: "6px 0 14px 0" }}><strong>Required Experience:</strong> {job.requiredExperience || "—"}</p>

              <h4 style={{ marginBottom: 8 }}>Matched Students ({matches.length}):</h4>

              {matches.length === 0 ? (
                <p style={{ color: "#ff8b8b" }}>✘ No matching students found for this job</p>
              ) : (
                <div style={{ display: "grid", gap: 8 }}>
                  {matches.map((m) => (
                    <div key={m.student.id} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.04)"
                    }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{m.student.name} — <span style={{ fontWeight: 400 }}>{m.student.email}</span></div>
                        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)" }}>
                          Matched Skills: {m.common.join(", ") || "-"}
                        </div>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>{m.score} pts</div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>{m.percent}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
