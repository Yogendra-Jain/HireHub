import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  Upload,
  Search,
  ClipboardList,
  Plus,
  BarChart3,
  Sparkles,
  AlertTriangle,
  Check,
  FileText,
  ExternalLink,
} from "lucide-react";

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
        `${import.meta.env.VITE_API_URL}/api/users/upload-resume`,
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
        `${import.meta.env.VITE_API_URL}/api/ai/analyze-resume`,
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
    <div className="page-container-narrow">

      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Manage your account and career tools</p>
      </div>

      {/* Toast */}
      {message.text && (
        <div className={`toast mb-6 ${message.isError ? "toast-error" : "toast-success"}`}>
          {message.isError ? (
            <AlertTriangle size={16} />
          ) : (
            <Check size={16} />
          )}
          {message.text}
        </div>
      )}

      {/* Account card */}
      <div className="card mb-5">
        <div className="card-body">
          <h2 className="text-lg font-bold mb-5">Account Details</h2>

          {/* Avatar + name */}
          <div className="flex items-center gap-4 pb-5 mb-5 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="avatar avatar-xl">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-bold text-lg">{user?.name}</p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{user?.email}</p>
            </div>
            <span className={`badge ${isCandidate ? "badge-primary" : "badge-info"}`}>
              {isCandidate ? "Candidate" : "Recruiter"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="input-label">Name</p>
              <p className="text-sm font-medium">{user?.name}</p>
            </div>
            <div>
              <p className="input-label">Email</p>
              <p className="text-sm font-medium">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Resume section — candidates only */}
      {isCandidate && (
        <div className="card mb-5">
          <div className="card-body">
            <h2 className="text-lg font-bold mb-5">Resume</h2>

            {/* Current resume — visible as soon as user logs in (BUG FIX) */}
            {resumeUrl && (
              <div className="flex items-center justify-between p-4 rounded-lg mb-5"
                style={{ background: 'var(--primary-50)', border: '1px solid var(--primary)' }}>
                <div className="flex items-center gap-3">
                  <div className="flex-center w-10 h-10 rounded-lg"
                    style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                    <FileText size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold flex items-center gap-1">
                      Resume uploaded <Check size={14} className="text-green-600" />
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Click View to open · Upload new to replace
                    </p>
                  </div>
                </div>
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary btn-sm"
                >
                  <ExternalLink size={14} />
                  View Resume
                </a>
              </div>
            )}

            {/* Upload area — clicking it opens the file picker */}
            <div
              className="rounded-lg p-6 text-center mb-4 cursor-pointer"
              style={{ border: '2px dashed var(--border)', background: 'var(--bg-secondary)' }}
              onClick={() => document.getElementById("resume-input").click()}
            >
              <input
                id="resume-input"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={e => setSelectedFile(e.target.files[0])}
              />
              <Upload size={28} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
              {selectedFile ? (
                <p className="text-sm font-medium" style={{ color: 'var(--primary)' }}>
                  {selectedFile.name}
                </p>
              ) : (
                <>
                  <p className="text-sm font-medium mb-1">
                    {resumeUrl ? "Click to upload a new resume" : "Click to upload your resume"}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
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
                className="btn btn-primary flex-1"
              >
                <Upload size={16} />
                {uploading ? "Uploading..." : resumeUrl ? "Update Resume" : "Upload Resume"}
              </button>

              {/* Analyze button — only show if resume exists */}
              {resumeUrl && (
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="btn btn-secondary flex-1"
                >
                  <Sparkles size={16} />
                  {analyzing ? "Analyzing..." : "Analyze with AI"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Analysis mini-preview */}
      {isCandidate && analysis && (
        <div className="card mb-5" style={{ borderColor: 'var(--primary)' }}>
          <div className="card-body">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold">Last Analysis</h2>
              <span className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>
                {analysis.score}/100
              </span>
            </div>

            {/* Score bar */}
            <div className="progress-bar mb-4">
              <div
                className="progress-fill"
                style={{ width: `${analysis.score}%` }}
              />
            </div>

            {/* Skills preview */}
            {analysis.skills?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {analysis.skills.slice(0, 5).map((skill, i) => (
                  <span key={i} className="badge badge-primary">
                    {skill}
                  </span>
                ))}
              </div>
            )}

            <Link
              to="/resume-analysis"
              className="btn btn-ghost btn-sm"
              style={{ color: 'var(--primary)' }}
            >
              View Full Analysis →
            </Link>
          </div>
        </div>
      )}

      {/* Quick nav links */}
      <div className="grid grid-cols-2 gap-3">
        {isCandidate ? (
          <>
            <Link to="/jobs" className="quick-action">
              <div className="quick-action-icon">
                <Search size={20} />
              </div>
              <div>
                <p className="quick-action-label">Browse Jobs</p>
                <p className="quick-action-desc">Find opportunities</p>
              </div>
            </Link>
            <Link to="/my-applications" className="quick-action">
              <div className="quick-action-icon">
                <ClipboardList size={20} />
              </div>
              <div>
                <p className="quick-action-label">My Applications</p>
                <p className="quick-action-desc">Track your progress</p>
              </div>
            </Link>
          </>
        ) : (
          <>
            <Link to="/create-job" className="quick-action">
              <div className="quick-action-icon">
                <Plus size={20} />
              </div>
              <div>
                <p className="quick-action-label">Post New Job</p>
                <p className="quick-action-desc">Create a listing</p>
              </div>
            </Link>
            <Link to="/recruiter-dashboard" className="quick-action">
              <div className="quick-action-icon">
                <BarChart3 size={20} />
              </div>
              <div>
                <p className="quick-action-label">My Jobs</p>
                <p className="quick-action-desc">Manage postings</p>
              </div>
            </Link>
          </>
        )}
      </div>

    </div>
  );
}

export default Profile;