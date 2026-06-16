import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

// ─────────────────────────────────────────────────────────────
// Profile Page
//
// BUG FIXED: Resume disappeared after logout/login
//
// Old code:  const [resumeUrl, setResumeUrl] = useState("")
//   → Always started as empty string
//   → Even if user had uploaded a resume before, it showed nothing
//
// Fix:       const [resumeUrl, setResumeUrl] = useState(user?.resume || "")
//   → Reads resume URL from localStorage user object on mount
//   → localStorage is updated by Login + by upload response
//   → So after login, resume is immediately visible
//
// Also fixed: After upload, we save the new resume URL back to
// localStorage so it persists when the user navigates away
// ─────────────────────────────────────────────────────────────

function Profile() {
  const navigate = useNavigate();

  // Read user from localStorage — includes resume URL if previously uploaded
  const user        = JSON.parse(localStorage.getItem("user"));
  const isCandidate = user?.role === "candidate";

  // BUG FIX: initialize from user.resume, not from ""
  // This means the resume link shows immediately after login
  const [resumeUrl,    setResumeUrl]    = useState(user?.resume || "");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading,    setUploading]    = useState(false);
  const [analyzing,    setAnalyzing]    = useState(false);
  const [message,      setMessage]      = useState({ text: "", isError: false });
  const [analysis,     setAnalysis]     = useState(null);

  // Load existing resume analysis from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("resumeAnalysis");
    if (saved) setAnalysis(JSON.parse(saved));
  }, []);

  const showMessage = (text, isError = false) => {
    setMessage({ text, isError });
    setTimeout(() => setMessage({ text: "", isError: false }), 3000);
  };

  // ── Upload resume ──────────────────────────────────────────
  const handleUpload = async () => {
    if (!selectedFile) return showMessage("Please select a PDF file first", true);
    if (!selectedFile.name.toLowerCase().endsWith(".pdf")) {
      return showMessage("Only PDF files are allowed", true);
    }

    setUploading(true);
    try {
      const token    = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("resume", selectedFile);

      const res = await axios.post(
        "http://localhost:5000/api/users/upload-resume",
        formData,
        {
          headers: {
            Authorization:  `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Update state so "View Resume" link appears immediately
      setResumeUrl(res.data.resume);

      // BUG FIX: Save new resume URL to localStorage
      // Without this, the URL disappears after navigating away
      const updatedUser = { ...user, resume: res.data.resume };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setSelectedFile(null);
      showMessage("Resume uploaded successfully!");

    } catch (err) {
      showMessage(err.response?.data?.message || "Upload failed. Please try again.", true);
    } finally {
      setUploading(false);
    }
  };

  // ── Analyze resume with Groq ───────────────────────────────
  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const token = localStorage.getItem("token");
      const res   = await axios.get(
        "http://localhost:5000/api/ai/analyze-resume",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Save result to localStorage for use on ResumeAnalysis page
      localStorage.setItem("resumeAnalysis", JSON.stringify(res.data));
      setAnalysis(res.data);
      showMessage("Analysis complete! Redirecting...");

      setTimeout(() => navigate("/resume-analysis"), 1000);

    } catch (err) {
      showMessage(err.response?.data?.message || "Analysis failed. Try again.", true);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div style={{ background: "#070b18", minHeight: "100vh", color: "white" }}>
      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* Header */}
        <h1 className="text-3xl font-bold mb-1">My Profile</h1>
        <p className="mb-8" style={{ color: "#64748b" }}>
          Manage your account and career tools
        </p>

        {/* Toast */}
        {message.text && (
          <div
            className="mb-6 px-4 py-3 rounded-xl text-sm"
            style={{
              background: message.isError ? "#2a1a1a" : "#1a1f3a",
              border:     `1px solid ${message.isError ? "#991b1b" : "#4f46e5"}`,
              color:      message.isError ? "#f87171" : "#a5b4fc",
            }}
          >
            {message.isError ? "⚠ " : "✓ "}{message.text}
          </div>
        )}

        {/* Account card */}
        <div
          className="rounded-2xl p-6 mb-5"
          style={{ background: "#0d1117", border: "1px solid #1e2a4a" }}
        >
          <h2 className="text-lg font-bold mb-5">Account Details</h2>

          {/* Avatar + name */}
          <div
            className="flex items-center gap-4 pb-5 mb-5"
            style={{ borderBottom: "1px solid #1e2a4a" }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold"
              style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)", color: "white" }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-bold text-lg">{user?.name}</p>
              <p className="text-sm" style={{ color: "#64748b" }}>{user?.email}</p>
            </div>
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold"
              style={{
                background: isCandidate ? "#1e1b4b" : "#0f2044",
                color:      isCandidate ? "#a5b4fc"  : "#38bdf8",
                border:     `1px solid ${isCandidate ? "#4f46e5" : "#0369a1"}`,
              }}
            >
              {isCandidate ? "Candidate" : "Recruiter"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs mb-1" style={{ color: "#64748b" }}>Name</p>
              <p className="text-sm font-medium">{user?.name}</p>
            </div>
            <div>
              <p className="text-xs mb-1" style={{ color: "#64748b" }}>Email</p>
              <p className="text-sm font-medium">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Resume section — candidates only */}
        {isCandidate && (
          <div
            className="rounded-2xl p-6 mb-5"
            style={{ background: "#0d1117", border: "1px solid #1e2a4a" }}
          >
            <h2 className="text-lg font-bold mb-5">Resume</h2>

            {/* Current resume — visible as soon as user logs in (BUG FIX) */}
            {resumeUrl && (
              <div
                className="flex items-center justify-between p-4 rounded-xl mb-5"
                style={{ background: "#1e1b4b", border: "1px solid #4f46e5" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{ background: "#2d1f3a", color: "#c084fc" }}
                  >
                    PDF
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Resume uploaded ✓</p>
                    <p className="text-xs" style={{ color: "#64748b" }}>
                      Click View to open · Upload new to replace
                    </p>
                  </div>
                </div>
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-lg text-sm font-semibold"
                  style={{ background: "#4f46e5", color: "white" }}
                >
                  View Resume
                </a>
              </div>
            )}

            {/* Upload area — clicking it opens the file picker */}
            <div
              className="rounded-xl p-6 text-center mb-4 cursor-pointer transition-all"
              style={{ background: "#070b18", border: "2px dashed #1e2a4a" }}
              onClick={() => document.getElementById("resume-input").click()}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#4f46e5"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#1e2a4a"}
            >
              <input
                id="resume-input"
                type="file"
                accept=".pdf"
                style={{ display: "none" }}
                onChange={e => setSelectedFile(e.target.files[0])}
              />
              <div className="text-3xl mb-2">📎</div>
              {selectedFile ? (
                <p className="text-sm font-medium" style={{ color: "#a5b4fc" }}>
                  {selectedFile.name}
                </p>
              ) : (
                <>
                  <p className="text-sm font-medium mb-1">
                    {resumeUrl ? "Click to upload a new resume" : "Click to upload your resume"}
                  </p>
                  <p className="text-xs" style={{ color: "#64748b" }}>
                    PDF only · Max 5MB
                  </p>
                </>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{
                  background: selectedFile && !uploading
                    ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                    : "#1e2a4a",
                  color:  selectedFile && !uploading ? "white" : "#475569",
                  cursor: selectedFile && !uploading ? "pointer" : "not-allowed",
                }}
              >
                {uploading ? "Uploading..." : resumeUrl ? "Update Resume" : "Upload Resume"}
              </button>

              {/* Analyze button — only show if resume exists */}
              {resumeUrl && (
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: "#1e1b4b",
                    color:      "#a5b4fc",
                    border:     "1px solid #4f46e5",
                    cursor:     analyzing ? "not-allowed" : "pointer",
                    opacity:    analyzing ? 0.6 : 1,
                  }}
                >
                  {analyzing ? "Analyzing..." : "✦ Analyze with AI"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Analysis mini-preview */}
        {isCandidate && analysis && (
          <div
            className="rounded-2xl p-6 mb-5"
            style={{ background: "#0d1117", border: "1px solid #4f46e5" }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold">Last Analysis</h2>
              <span className="text-2xl font-bold" style={{ color: "#818cf8" }}>
                {analysis.score}/100
              </span>
            </div>

            {/* Score bar */}
            <div className="h-2 rounded-full mb-4" style={{ background: "#1e2a4a" }}>
              <div
                className="h-2 rounded-full"
                style={{
                  width:      `${analysis.score}%`,
                  background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
                }}
              />
            </div>

            {/* Skills preview */}
            {analysis.skills?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {analysis.skills.slice(0, 5).map((skill, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{ background: "#1e1b4b", color: "#a5b4fc", border: "1px solid #4f46e5" }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}

            <Link
              to="/resume-analysis"
              className="text-sm font-semibold"
              style={{ color: "#6366f1" }}
            >
              View Full Analysis →
            </Link>
          </div>
        )}

        {/* Quick nav links */}
        <div className="grid grid-cols-2 gap-3">
          {isCandidate ? (
            <>
              <Link
                to="/jobs"
                className="p-4 rounded-2xl text-center transition-all"
                style={{ background: "#0d1117", border: "1px solid #1e2a4a" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#4f46e5"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#1e2a4a"}
              >
                <div className="text-xl mb-1">🔍</div>
                <p className="text-sm font-medium">Browse Jobs</p>
              </Link>
              <Link
                to="/my-applications"
                className="p-4 rounded-2xl text-center transition-all"
                style={{ background: "#0d1117", border: "1px solid #1e2a4a" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#4f46e5"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#1e2a4a"}
              >
                <div className="text-xl mb-1">📋</div>
                <p className="text-sm font-medium">My Applications</p>
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/create-job"
                className="p-4 rounded-2xl text-center transition-all"
                style={{ background: "#0d1117", border: "1px solid #1e2a4a" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#4f46e5"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#1e2a4a"}
              >
                <div className="text-xl mb-1">➕</div>
                <p className="text-sm font-medium">Post New Job</p>
              </Link>
              <Link
                to="/recruiter-dashboard"
                className="p-4 rounded-2xl text-center transition-all"
                style={{ background: "#0d1117", border: "1px solid #1e2a4a" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#4f46e5"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#1e2a4a"}
              >
                <div className="text-xl mb-1">📊</div>
                <p className="text-sm font-medium">My Jobs</p>
              </Link>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

export default Profile;