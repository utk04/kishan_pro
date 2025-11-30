import React, { useState, useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

import { getData, saveData } from "../utils/storage";

/* small skills vocab kept same as before */
const SKILLS_VOCAB = [
  "react", "javascript", "node", "node.js", "html", "css", "tailwind",
  "figma", "java", "python", "c++", "c", "sql", "mongodb",
  "express", "typescript"
];

/* ---------- Simple IndexedDB helpers for video blobs ---------- */
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("jobportal-db", 1);
    req.onupgradeneeded = (ev) => {
      const db = ev.target.result;
      if (!db.objectStoreNames.contains("videos")) {
        db.createObjectStore("videos");
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveVideoBlob(studentId, blob) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction("videos", "readwrite");
    tx.objectStore("videos").put(blob, String(studentId));
    tx.oncomplete = () => {
      db.close();
      res();
    };
    tx.onerror = () => rej(tx.error);
  });
}

async function getVideoBlob(studentId) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction("videos", "readonly");
    const r = tx.objectStore("videos").get(String(studentId));
    r.onsuccess = () => {
      db.close();
      res(r.result || null);
    };
    r.onerror = () => rej(r.error);
  });
}

async function deleteVideoBlob(studentId) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction("videos", "readwrite");
    tx.objectStore("videos").delete(String(studentId));
    tx.oncomplete = () => {
      db.close();
      res();
    };
    tx.onerror = () => rej(tx.error);
  });
}

/* ------------------ StudentDashboard component ------------------ */

export default function StudentDashboard() {
  const student = JSON.parse(localStorage.getItem("currentStudent"));

  /* profile info */
  const [info, setInfo] = useState({
    skills: student?.skills || "",
    cgpa: student?.cgpa || "",
    experience: student?.experience || "",
  });

  /* resume & matching (existing) */
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeName, setResumeName] = useState(student?.resumeName || "No file uploaded");
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [extractedSkills, setExtractedSkills] = useState([]);

  /* video recording states */
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null); // in-memory until saved to DB
  const [videoUrl, setVideoUrl] = useState(null); // preview URL (from DB or recorded)
  const [hasSavedVideo, setHasSavedVideo] = useState(Boolean(student?.hasVideo));
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const recordedChunksRef = useRef([]);

  /* small input handler */
  const h = (e) => setInfo({ ...info, [e.target.name]: e.target.value });

  /* ------------- PDF extraction (same idea as before) ------------- */
  const extractSkillsFromPdf = async (file) => {
    if (!file) return [];
    try {
      const pdfData = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;

      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((it) => it.str).join(" ");
      }
      const textLower = text.toLowerCase();
      const extracted = SKILLS_VOCAB.filter((skill) => textLower.includes(skill.toLowerCase()));
      return extracted;
    } catch (err) {
      console.error("Failed to read resume:", err);
      alert("Failed to read resume. Ensure it's a valid PDF.");
      return [];
    }
  };

  /* ---------------- Save profile (resume+skills+video) ---------------- */
  const saveProfile = async () => {
    // parse resume if provided
    let resumeSkills = [];
    if (resumeFile) {
      resumeSkills = await extractSkillsFromPdf(resumeFile);
      setExtractedSkills(resumeSkills);
      setResumeName(resumeFile.name);
    }

    // combine skills
    const combinedSkills = [
      ...new Set([
        ...info.skills.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean),
        ...resumeSkills,
      ]),
    ].join(", ");

    // update local students array
    const all = getData("students");
    const updated = all.map((s) =>
      s.id === student.id ? { ...s, ...info, skills: combinedSkills, resumeName: resumeFile ? resumeFile.name : s.resumeName || null } : s
    );
    saveData("students", updated);

    // save to currentStudent in localStorage
    const newCurrent = { ...(student || {}), ...info, skills: combinedSkills, resumeName: resumeFile ? resumeFile.name : student?.resumeName };
    localStorage.setItem("currentStudent", JSON.stringify(newCurrent));

    // if we have a recorded blob (unsaved), save it to IndexedDB and mark student
    if (recordedBlob) {
      try {
        await saveVideoBlob(student.id, recordedBlob);
        // update student metadata
        const updated2 = all.map((s) =>
          s.id === student.id ? { ...s, hasVideo: true } : s
        );
        saveData("students", updated2);
        localStorage.setItem("currentStudent", JSON.stringify({ ...newCurrent, hasVideo: true }));
        setHasSavedVideo(true);
      } catch (err) {
        console.error("Saving video failed:", err);
        alert("Failed to save video. Try again.");
      }
    }

    alert("Profile updated!");
  };

  /* ---------------- Matching logic (recomputes when info.skills/cgpa/experience changes) ---------------- */
  useEffect(() => {
    const jobs = getData("jobs") || [];
    const skillsLower = (info.skills || "").toLowerCase();
    const matches = jobs.filter((job) => {
      if (!job.requiredSkill) return false;
      const skillMatch = skillsLower.includes(job.requiredSkill.toLowerCase());
      const cgpaOk = Number(info.cgpa || 0) >= Number(job.requiredCGPA || 0);
      const expOk = Number(info.experience || 0) >= Number(job.requiredExperience || 0);
      return skillMatch && cgpaOk && expOk;
    });
    setMatchedJobs(matches);
  }, [info]);

  /* ---------------- Video recording functions ---------------- */

  async function startCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Camera not supported in this browser.");
      return;
    }
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = s;
      return s;
    } catch (err) {
      console.error("Camera access denied:", err);
      alert("Allow camera access to record video.");
      return null;
    }
  }

  async function handleStartRecording() {
    const s = await startCamera();
    if (!s) return;

    recordedChunksRef.current = [];
    const options = { mimeType: "video/webm; codecs=vp9,opus" };
    try {
      const mr = new MediaRecorder(s, options);
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) recordedChunksRef.current.push(ev.data);
      };

      mr.onstop = async () => {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        setRecordedBlob(blob);
        // preview
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);

        // stop camera tracks
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        mediaRecorderRef.current = null;
        setIsRecording(false);
      };

      mr.start();
      setIsRecording(true);
    } catch (err) {
      console.error("MediaRecorder error:", err);
      alert("Recording not supported in this browser or options.");
    }
  }

  function handleStopRecording() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }

  async function loadSavedVideoPreview() {
    const blob = await getVideoBlob(student.id);
    if (blob) {
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      setHasSavedVideo(true);
    } else {
      setVideoUrl(null);
      setHasSavedVideo(false);
    }
  }

  async function handleDeleteSavedVideo() {
    if (!confirm("Delete saved video from this profile?")) return;
    await deleteVideoBlob(student.id);
    setVideoUrl(null);
    setHasSavedVideo(false);
    // update metadata
    const all = getData("students");
    const updated = all.map((s) => (s.id === student.id ? { ...s, hasVideo: false } : s));
    saveData("students", updated);
    alert("Deleted saved video.");
  }

  useEffect(() => {
    // on mount, load saved video preview if any
    loadSavedVideoPreview();

    // clean up objectURL when unmount or when videoUrl changes
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e3a8a] px-4 py-10">
      <div className="w-full max-w-3xl bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-10">
        <h2 className="text-4xl font-bold text-white text-center mb-8">Student Dashboard</h2>

        {/* Profile Overview */}
        <div className="glass-card mb-8">
          <h3 className="text-2xl font-semibold text-white mb-4">Your Profile</h3>
          <p className="text-white/80 mb-1"><strong>Name:</strong> {student?.name}</p>
          <p className="text-white/80 mb-1"><strong>Email:</strong> {student?.email}</p>
          <p className="text-white/80 mb-1"><strong>Resume:</strong> {resumeName}</p>
          <p className="text-white/80 mb-1"><strong>Skills:</strong> {info.skills || "Not Added"}</p>
          <p className="text-white/80 mb-1"><strong>CGPA:</strong> {info.cgpa || "N/A"}</p>
          <p className="text-white/80 mb-1"><strong>Experience:</strong> {info.experience || "N/A"} years</p>
          <p className="text-white/80 mt-3"><strong>Extracted Resume Skills:</strong> {extractedSkills.length ? extractedSkills.join(", ") : "No skills extracted yet"}</p>
        </div>

        {/* Editable form & resume */}
        <div className="glass-card mb-8">
          <h3 className="text-2xl font-semibold text-white mb-4">Update Your Profile</h3>

          <input name="skills" placeholder="Skills (comma separated)" className="glass-input" value={info.skills} onChange={h} />
          <input name="cgpa" placeholder="CGPA" className="glass-input" value={info.cgpa} onChange={h} />
          <input name="experience" placeholder="Experience (years)" className="glass-input" value={info.experience} onChange={h} />

          <label className="text-white/80 block mt-4 mb-2">Upload Resume (PDF)</label>
          <input type="file" accept="application/pdf" className="glass-input" onChange={(e) => setResumeFile(e.target.files?.[0] || null)} />

          <button className="w-full mt-5 bg-green-500/80 hover:bg-green-600 text-white py-3 rounded-xl text-lg font-semibold" onClick={saveProfile}>Save Profile</button>
        </div>

        {/* Video recording area */}
        <div className="glass-card mb-8">
          <h3 className="text-2xl font-semibold text-white mb-4">Record / Upload Your Video</h3>

          {/* preview area */}
          <div className="mb-3">
            {videoUrl ? (
              <video controls src={videoUrl} className="w-full rounded-xl border border-white/20" />
            ) : (
              <div className="w-full rounded-xl border border-white/20 bg-white/5 text-white/60 py-16 text-center">
                No video recorded yet
              </div>
            )}
          </div>

          {/* recording controls */}
          <div className="flex gap-3">
            {!isRecording ? (
              <button className="btn-primary px-4 py-2 rounded-xl" onClick={handleStartRecording}>Start Recording</button>
            ) : (
              <button className="btn-glass px-4 py-2 rounded-xl" onClick={handleStopRecording}>Stop Recording</button>
            )}

            <button
              className="btn-glass px-4 py-2 rounded-xl"
              onClick={() => {
                // allow user to choose file to upload as video instead of recording
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "video/*";
                input.onchange = async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  setRecordedBlob(f);
                  const url = URL.createObjectURL(f);
                  setVideoUrl(url);
                };
                input.click();
              }}
            >
              Upload Video File
            </button>

            <button
              className="btn-glass px-4 py-2 rounded-xl ml-auto"
              onClick={() => {
                // discard recorded in-memory blob
                if (recordedBlob) {
                  setRecordedBlob(null);
                  setVideoUrl(null);
                } else {
                  alert("No unsaved recording to discard.");
                }
              }}
            >
              Discard Unsaved Recording
            </button>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              className="w-1/2 bg-blue-500/80 hover:bg-blue-600 text-white py-2 rounded-xl"
              onClick={async () => {
                // Save recordedBlob to DB (if any) immediately without saving other profile data
                if (!recordedBlob) return alert("No recorded video to save. Record or upload first.");
                try {
                  await saveVideoBlob(student.id, recordedBlob);
                  // update student metadata
                  const all = getData("students");
                  const updated = all.map((s) => (s.id === student.id ? { ...s, hasVideo: true } : s));
                  saveData("students", updated);
                  localStorage.setItem("currentStudent", JSON.stringify({ ...(student || {}), hasVideo: true }));
                  setHasSavedVideo(true);
                  alert("Video saved to profile (local).");
                } catch (err) {
                  console.error(err);
                  alert("Failed to save video.");
                }
              }}
            >
              Save Video to Profile
            </button>

            {hasSavedVideo && (
              <button className="w-1/2 bg-red-500/80 hover:bg-red-600 text-white py-2 rounded-xl" onClick={handleDeleteSavedVideo}>
                Delete Saved Video
              </button>
            )}
          </div>
        </div>

        {/* Matched Jobs */}
        <div className="glass-card">
          <h3 className="text-2xl font-semibold text-white mb-4">Matched Companies</h3>

          {matchedJobs.length === 0 ? (
            <p className="text-white/60 text-center">No matching jobs yet.</p>
          ) : (
            matchedJobs.map((job) => (
              <div key={job.id} className="p-4 bg-white/10 rounded-xl border border-white/20 mb-3">
                <h4 className="text-xl text-white font-bold">{job.title}</h4>
                <p className="text-white/70">Required Skill: {job.requiredSkill}</p>
                <p className="text-white/70">CGPA ≥ {job.requiredCGPA}</p>
                <p className="text-white/70">Experience ≥ {job.requiredExperience} years</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
