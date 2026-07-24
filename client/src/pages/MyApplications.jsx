import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  MapPin,
  Banknote,
  ClipboardList,
  CheckCircle2,
  Mic,
  Check,
  Briefcase,
  Calendar,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// MyApplications Page
//
// BUG FIXED: "Selected" status was not showing properly
//
// Old code only showed: Status: {app.status}  → plain text
// New code shows a color-coded badge per status:
//   Applied  → info
//   Reviewed → warning
//   Selected → success  (the missing one!)
//   Rejected → error
//
// Also added:
//   - Stats bar at top (click to filter by status)
//   - Full job details on each card
//   - "Congratulations" banner for Selected applications
//   - Empty state with Browse Jobs CTA
// ─────────────────────────────────────────────────────────────

// Status badge config — maps to CSS design system status classes
const STATUS_CONFIG = {
  Applied:  { className: "status-applied",  label: "Applied" },
  Reviewed: { className: "status-reviewed", label: "Reviewed" },
  Selected: { className: "status-selected", label: "Selected", icon: Check },
  Rejected: { className: "status-rejected", label: "Rejected" },
};

// Map job types to CSS classes
const JOB_TYPE_CLASS = {
  "Full-time":  "job-type-fulltime",
  "Part-time":  "job-type-parttime",
  "Contract":   "job-type-contract",
  "Internship": "job-type-internship",
  "Remote":     "job-type-remote",
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
        `${import.meta.env.VITE_API_URL}/api/applications/my-applications`,
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
    <div className="page-container-narrow">

      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">My Applications</h1>
        <p className="page-subtitle">
          Track your job applications and their status
        </p>
      </div>

      {/* ── Stat Cards (clickable filters) ── */}
      <div className="grid grid-cols-5 gap-3 mb-8">
        {["All", "Applied", "Reviewed", "Selected", "Rejected"].map(status => {
          const isActive = filter === status;
          return (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`stat-card flex-col items-center text-center cursor-pointer ${
                isActive ? "border-[var(--primary)]" : ""
              }`}
            >
              <p className={`stat-card-value ${isActive ? "text-[var(--primary)]" : ""}`}>
                {counts[status]}
              </p>
              <p className="stat-card-label">{status}</p>
            </button>
          );
        })}
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton h-28 rounded-xl" />
          ))}
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && filtered.length === 0 && (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <Briefcase size={28} />
            </div>
            <p className="empty-state-title">
              {filter === "All"
                ? "No applications yet"
                : `No ${filter} applications`}
            </p>
            <p className="empty-state-text">
              {filter === "All"
                ? "Start browsing jobs and apply to positions"
                : "Try selecting a different filter above"}
            </p>
            {filter === "All" && (
              <Link to="/jobs" className="btn btn-primary mt-4">
                Browse Jobs
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ── Application cards ── */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map(app => {
            const job = app.job;
            const s   = STATUS_CONFIG[app.status] || STATUS_CONFIG["Applied"];
            const StatusIcon = s.icon;

            return (
              <div key={app._id}>

                {/* Congratulations banner — only for Selected */}
                {app.status === "Selected" && (
                  <div className="flex items-center gap-2 px-5 py-3 rounded-t-xl bg-[var(--success-light)] border border-b-0 border-[var(--success-border)]">
                    <CheckCircle2 size={16} className="text-[var(--success)]" />
                    <span className="text-sm font-semibold text-[var(--success)]">
                      Congratulations! You have been selected for this role.
                    </span>
                  </div>
                )}

                {/* Main card */}
                <div className={`card card-body ${app.status === "Selected" ? "rounded-t-none" : ""}`}>
                  {/* Top row: title + status badge */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      {/* Company initial */}
                      <div className="avatar avatar-md">
                        {job?.company?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h2 className="font-bold text-lg leading-tight">{job?.title}</h2>
                        <p className="text-sm text-[var(--text-secondary)]">{job?.company}</p>
                      </div>
                    </div>

                    {/* Status badge — THIS was the bug, now shows correctly */}
                    <span className={`badge ${s.className}`}>
                      {StatusIcon && <StatusIcon size={12} />}
                      {s.label}
                    </span>
                  </div>

                  {/* Job meta info */}
                  <div className="flex flex-wrap gap-3 mb-4 text-xs text-[var(--text-secondary)]">
                    {job?.location && (
                      <span className="flex items-center gap-1">
                        <MapPin size={13} /> {job.location}
                      </span>
                    )}
                    {job?.salary && (
                      <span className="flex items-center gap-1">
                        <Banknote size={13} /> {job.salary}
                      </span>
                    )}
                    {job?.jobType && (
                      <span className={`badge ${JOB_TYPE_CLASS[job.jobType] || "badge-neutral"}`}>
                        {job.jobType}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar size={13} /> Applied {formatDate(app.createdAt)}
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <Link to={`/jobs/${job?._id}`} className="btn btn-secondary btn-sm">
                      View Job
                    </Link>

                    {/* If selected, show interview prep button */}
                    {app.status === "Selected" && (
                      <Link to={`/jobs/${job?._id}`} className="btn btn-primary btn-sm">
                        <Mic size={14} /> Prepare for Interview
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
  );
}

export default MyApplications;