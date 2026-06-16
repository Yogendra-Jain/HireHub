import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

// ─────────────────────────────────────────────────────────────
// MyApplications Page
//
// BUG FIXED: "Selected" status was not showing properly
//
// Old code only showed: Status: {app.status}  → plain text
// New code shows a color-coded badge per status:
//   Applied  → indigo
//   Reviewed → blue
//   Selected → green  (the missing one!)
//   Rejected → red
//
// Also added:
//   - Stats bar at top (click to filter by status)
//   - Full job details on each card
//   - "Congratulations" banner for Selected applications
//   - Empty state with Browse Jobs CTA
// ─────────────────────────────────────────────────────────────

// Status badge colors — each status has its own look
const STATUS_STYLES = {
  Applied:  { bg: "#1e1b4b", color: "#a5b4fc", border: "#4f46e5", label: "Applied"  },
  Reviewed: { bg: "#0f2044", color: "#38bdf8", border: "#0369a1", label: "Reviewed" },
  Selected: { bg: "#0d2f1a", color: "#4ade80", border: "#166534", label: "✓ Selected" },
  Rejected: { bg: "#2a1a1a", color: "#f87171", border: "#991b1b", label: "Rejected" },
};

function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filter,       setFilter]       = useState("All"); // status filter

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem("token");
      const res   = await axios.get(
        "http://localhost:5000/api/applications/my-applications",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setApplications(res.data);
    } catch (err) {
      console.error("Failed to load applications:", err);
    } finally {
      setLoading(false);
    }
  };

  // Count how many apps per status — for the stat cards
  const counts = {
    All:      applications.length,
    Applied:  applications.filter(a => a.status === "Applied").length,
    Reviewed: applications.filter(a => a.status === "Reviewed").length,
    Selected: applications.filter(a => a.status === "Selected").length,
    Rejected: applications.filter(a => a.status === "Rejected").length,
  };

  // Apply filter — show all or only matching status
  const filtered = filter === "All"
    ? applications
    : applications.filter(a => a.status === filter);

  // Format date: "Jun 12, 2025"
  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });

  return (
    <div style={{ background: "#070b18", minHeight: "100vh", color: "white" }}>
      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Header */}
        <h1 className="text-3xl font-bold mb-1">My Applications</h1>
        <p className="mb-8" style={{ color: "#64748b" }}>
          Track your job applications and their status
        </p>

        {/* ── Stat Cards (clickable filters) ── */}
        <div className="grid grid-cols-5 gap-3 mb-8">
          {["All", "Applied", "Reviewed", "Selected", "Rejected"].map(status => {
            const isActive = filter === status;
            const s = STATUS_STYLES[status] || {};
            return (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className="p-4 rounded-2xl text-center transition-all"
                style={{
                  background: isActive
                    ? (s.bg || "#1e1b4b")
                    : "#0d1117",
                  border: `1px solid ${isActive
                    ? (s.border || "#4f46e5")
                    : "#1e2a4a"}`,
                  cursor: "pointer",
                }}
              >
                <p
                  className="text-2xl font-bold"
                  style={{ color: isActive ? (s.color || "#a5b4fc") : "white" }}
                >
                  {counts[status]}
                </p>
                <p className="text-xs mt-1" style={{ color: "#64748b" }}>
                  {status}
                </p>
              </button>
            );
          })}
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="h-28 rounded-2xl animate-pulse"
                style={{ background: "#0d1117" }}
              />
            ))}
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && filtered.length === 0 && (
          <div
            className="text-center py-16 rounded-2xl"
            style={{ background: "#0d1117", border: "1px dashed #1e2a4a" }}
          >
            <p className="text-4xl mb-3">📋</p>
            <p className="font-semibold text-lg mb-2">
              {filter === "All"
                ? "No applications yet"
                : `No ${filter} applications`}
            </p>
            <p className="text-sm mb-6" style={{ color: "#64748b" }}>
              {filter === "All"
                ? "Start browsing jobs and apply to positions"
                : "Try selecting a different filter above"}
            </p>
            {filter === "All" && (
              <Link
                to="/jobs"
                className="inline-block px-5 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white" }}
              >
                Browse Jobs
              </Link>
            )}
          </div>
        )}

        {/* ── Application cards ── */}
        {!loading && filtered.length > 0 && (
          <div className="space-y-4">
            {filtered.map(app => {
              const job = app.job;
              const s   = STATUS_STYLES[app.status] || STATUS_STYLES["Applied"];

              return (
                <div key={app._id}>

                  {/* 🎉 Congratulations banner — only for Selected */}
                  {app.status === "Selected" && (
                    <div
                      className="px-4 py-3 rounded-t-2xl text-sm font-semibold flex items-center gap-2"
                      style={{ background: "#0d2f1a", color: "#4ade80", border: "1px solid #166534", borderBottom: "none" }}
                    >
                      🎉 Congratulations! You have been selected for this role.
                    </div>
                  )}

                  {/* Main card */}
                  <div
                    className={`p-5 transition-all ${app.status === "Selected" ? "rounded-b-2xl" : "rounded-2xl"}`}
                    style={{
                      background: "#0d1117",
                      border:     `1px solid ${app.status === "Selected" ? "#166534" : "#1e2a4a"}`,
                    }}
                  >
                    {/* Top row: title + status badge */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        {/* Company initial */}
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                          style={{
                            background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                            color:      "white",
                          }}
                        >
                          {job?.company?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h2 className="font-bold text-lg leading-tight">{job?.title}</h2>
                          <p className="text-sm" style={{ color: "#94a3b8" }}>{job?.company}</p>
                        </div>
                      </div>

                      {/* Status badge — THIS was the bug, now shows correctly */}
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0"
                        style={{
                          background: s.bg,
                          color:      s.color,
                          border:     `1px solid ${s.border}`,
                        }}
                      >
                        {s.label}
                      </span>
                    </div>

                    {/* Job meta info */}
                    <div className="flex flex-wrap gap-3 mb-4 text-xs" style={{ color: "#64748b" }}>
                      {job?.location && (
                        <span className="flex items-center gap-1">
                          📍 {job.location}
                        </span>
                      )}
                      {job?.salary && (
                        <span className="flex items-center gap-1">
                          💰 {job.salary}
                        </span>
                      )}
                      {job?.jobType && (
                        <span
                          className="px-2 py-0.5 rounded-full"
                          style={{ background: "#1e1b4b", color: "#a5b4fc" }}
                        >
                          {job.jobType}
                        </span>
                      )}
                      <span>Applied {formatDate(app.createdAt)}</span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <Link
                        to={`/jobs/${job?._id}`}
                        className="px-4 py-2 rounded-lg text-xs font-semibold transition-all"
                        style={{ background: "#1e1b4b", color: "#a5b4fc", border: "1px solid #4f46e5" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#2d2a6e"}
                        onMouseLeave={e => e.currentTarget.style.background = "#1e1b4b"}
                      >
                        View Job
                      </Link>

                      {/* If selected, show interview prep button */}
                      {app.status === "Selected" && (
                        <Link
                          to={`/jobs/${job?._id}`}
                          className="px-4 py-2 rounded-lg text-xs font-semibold"
                          style={{
                            background: "linear-gradient(135deg, #166534, #14532d)",
                            color:      "#4ade80",
                          }}
                        >
                          🎤 Prepare for Interview
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyApplications;