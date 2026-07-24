import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  ClipboardList,
  MapPin,
  Users,
  PlusCircle,
  Briefcase,
  Eye,
  Sparkles,
  Trash2,
  Calendar,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// RecruiterDashboard
//
// Shows all jobs posted by the recruiter.
// Each job card shows:
//   - Title, company, location, job type
//   - Applicant count (from backend fix in job.controller.js)
//   - Buttons: View Job, Manage Applicants, AI Ranking, Delete
//
// Stats at top:
//   - Total jobs posted
//   - Total applications across all jobs
// ─────────────────────────────────────────────────────────────

function RecruiterDashboard() {
  const [jobs,       setJobs]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    try {
      const token = localStorage.getItem("token");
      const res   = await axios.get(`${import.meta.env.VITE_API_URL}/api/jobs/my-jobs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobs(res.data);
    } catch (err) {
      console.error("Failed to load jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm("Delete this job? All its applications will also be removed.")) return;
    setDeletingId(jobId);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Remove from list without refetching
      setJobs(jobs.filter(j => j._id !== jobId));
    } catch (err) {
      alert("Failed to delete job. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  // Sum all applicant counts for the total stat
  // applicantCount comes from backend fix in job.controller.js
  const totalApplications = jobs.reduce(
    (sum, job) => sum + (job.applicantCount || 0), 0
  );

  // ── Helper: map job type to badge class ─────────────────────
  const getJobTypeBadgeClass = (type) => {
    const t = type?.toLowerCase();
    if (t === "full-time" || t === "full time") return "badge job-type-fulltime";
    if (t === "part-time" || t === "part time") return "badge job-type-parttime";
    if (t === "contract")                       return "badge job-type-contract";
    if (t === "internship")                     return "badge job-type-internship";
    if (t === "remote")                         return "badge job-type-remote";
    return "badge badge-neutral";
  };

  return (
    <div className="page-container">

      {/* Header */}
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Recruiter Dashboard</h1>
          <p className="page-subtitle">Manage your job postings and applicants</p>
        </div>
        <Link to="/create-job" className="btn btn-primary">
          <PlusCircle size={16} />
          Post New Job
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: "var(--primary-50)", color: "var(--primary)" }}>
            <ClipboardList size={20} />
          </div>
          <div className="stat-card-value">{loading ? "—" : jobs.length}</div>
          <div className="stat-card-label">Jobs Posted</div>
        </div>

        {/* Total applications — now works because backend sends applicantCount */}
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: "var(--info-light)", color: "var(--info)" }}>
            <Users size={20} />
          </div>
          <div className="stat-card-value">{loading ? "—" : totalApplications}</div>
          <div className="stat-card-label">Total Applications</div>
        </div>
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="card">
              <div className="card-body">
                <div className="skeleton" style={{ width: "50%", height: "22px" }} />
                <div className="skeleton mt-2" style={{ width: "35%", height: "16px" }} />
                <div className="flex gap-2 mt-4">
                  <div className="skeleton" style={{ width: "80px", height: "24px", borderRadius: "var(--radius-full)" }} />
                  <div className="skeleton" style={{ width: "80px", height: "24px", borderRadius: "var(--radius-full)" }} />
                </div>
                <div className="skeleton mt-4" style={{ width: "100%", height: "14px" }} />
                <div className="skeleton mt-1" style={{ width: "70%", height: "14px" }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && jobs.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">
            <ClipboardList size={32} />
          </div>
          <p className="empty-state-title">No jobs posted yet</p>
          <p className="empty-state-text">
            Post your first job to start finding candidates
          </p>
          <Link to="/create-job" className="btn btn-primary mt-4">
            Post First Job
          </Link>
        </div>
      )}

      {/* Job cards */}
      {!loading && jobs.map(job => (
        <div key={job._id} className="card card-interactive mb-4">
          <div className="card-body">
            {/* Top row: title + posted date */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                  {job.title}
                </h2>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {job.company}
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
                <Calendar size={12} />
                {new Date(job.createdAt).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric",
                })}
              </div>
            </div>

            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {/* Job type */}
              <span className={getJobTypeBadgeClass(job.jobType)}>
                {job.jobType}
              </span>

              {/* Experience level */}
              <span className="badge badge-info">
                {job.experienceLevel}
              </span>

              {/* Location */}
              <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                <MapPin size={12} />
                {job.location}
              </span>

              {/* Applicant count — the main fix */}
              <span className="badge badge-success flex items-center gap-1">
                <Users size={12} />
                {job.applicantCount || 0} applicant{job.applicantCount !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Description preview */}
            <p className="text-sm text-clamp-2 mb-4" style={{ color: "var(--text-secondary)" }}>
              {job.description}
            </p>

            {/* Action buttons */}
            <div className="divider" />
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {/* View full job */}
              <Link to={`/jobs/${job._id}`} className="btn btn-ghost btn-sm">
                <Eye size={14} />
                View Job
              </Link>

              {/* Manage applicants */}
              <Link to={`/applicants/${job._id}`} className="btn btn-primary btn-sm">
                <Users size={14} />
                Manage Applicants
              </Link>

              {/* AI ranking */}
              <Link to={`/applicants-dashboard/${job._id}`} className="btn btn-ghost btn-sm">
                <Sparkles size={14} />
                AI Ranking
              </Link>

              {/* Delete — pushed to right */}
              <button
                onClick={() => handleDelete(job._id)}
                disabled={deletingId === job._id}
                className={`btn btn-danger btn-sm ml-auto ${deletingId === job._id ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <Trash2 size={14} />
                {deletingId === job._id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ))}

    </div>
  );
}

export default RecruiterDashboard;