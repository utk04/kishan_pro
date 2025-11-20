import { getData } from "../utils/storage";
import React from "react";

export default function MatchResults() {
  const jobs = getData("jobs");
  const students = getData("students");

  const match = (job, s) => (
    s.skills?.toLowerCase().includes(job.requiredSkill.toLowerCase()) &&
    Number(s.cgpa) >= Number(job.requiredCGPA) &&
    Number(s.experience) >= Number(job.requiredExperience)
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        minWidth: "90vw" ,
        padding: "40px",
        background: "linear-gradient(135deg,#0f172a,#1e3a8a)",
        color: "#fff",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "38px", marginBottom: "25px", fontWeight: 700 }}>
        Matching Results
      </h1>

      {/* Card Grid */}
      <div
        style={{
          display: "grid",
          gap: "25px",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
        }}
      >
        {jobs.map((job) => {
          const matchedStudents = students.filter((s) => match(job, s));

          return (
            <div
              key={job.id}
              style={{
                padding: "25px",
                borderRadius: "20px",
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.2)",
                boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
                transition: "0.3s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.boxShadow =
                  "0 12px 25px rgba(0,0,0,0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 8px 20px rgba(0,0,0,0.3)";
              }}
            >
              {/* Job Title */}
              <h2 style={{ fontSize: "24px", marginBottom: "10px" }}>
                {job.title}
              </h2>

              <p style={{ fontSize: "15px" }}>
                <strong>Required Skill:</strong> {job.requiredSkill}
              </p>
              <p style={{ fontSize: "15px" }}>
                <strong>Required CGPA:</strong> {job.requiredCGPA}
              </p>
              <p style={{ fontSize: "15px", marginBottom: "15px" }}>
                <strong>Required Experience:</strong> {job.requiredExperience}
              </p>

              <h3 style={{ marginBottom: "10px", fontSize: "17px" }}>
                Matched Students:
              </h3>

              {matchedStudents.length === 0 ? (
                <p
                  style={{
                    color: "#ff6b6b",
                    fontWeight: 600,
                    fontSize: "14px",
                    marginTop: "10px",
                  }}
                >
                  ✘ No Matching Students Found
                </p>
              ) : (
                matchedStudents.map((s) => (
                  <p
                    key={s.id}
                    style={{
                      fontSize: "14px",
                      margin: "6px 0",
                      padding: "6px 10px",
                      background: "rgba(255,255,255,0.15)",
                      borderRadius: "10px",
                    }}
                  >
                    ✓ {s.name} — {s.email}
                  </p>
                ))
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
