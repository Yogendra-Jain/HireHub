import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

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
      const res   = await axios.get("${import.meta.env.VITE_API_URL}/api/jobs/my-jobs", {
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

  return (
    <div style={{ background: "#070b18", minHeight: "100vh", color: "white" }}>
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Recruiter Dashboard</h1>
            <p style={{ color: "#64748b" }}>Manage your job postings and applicants</p>
          </div>
          <Link
            to="/create-job"
            className="px-5 py-2.5 rounded-xl font-semibold text-sm"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white" }}
          >
            + Post New Job
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div
            className="rounded-2xl p-6"
            style={{ background: "#0d1117", border: "1px solid #1e2a4a" }}
          >
            <p className="text-sm mb-1" style={{ color: "#64748b" }}>Jobs Posted</p>
            <p className="text-4xl font-bold">{loading ? "—" : jobs.length}</p>
          </div>

          {/* Total applications — now works because backend sends applicantCount */}
          <div
            className="rounded-2xl p-6"
            style={{ background: "#0d1117", border: "1px solid #1e2a4a" }}
          >
            <p className="text-sm mb-1" style={{ color: "#64748b" }}>Total Applications</p>
            <p className="text-4xl font-bold" style={{ color: "#a5b4fc" }}>
              {loading ? "—" : totalApplications}
            </p>
          </div>
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="h-40 rounded-2xl animate-pulse"
                style={{ background: "#0d1117" }}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && jobs.length === 0 && (
          <div
            className="text-center py-16 rounded-2xl"
            style={{ background: "#0d1117", border: "1px dashed #1e2a4a" }}
          >
            <p className="text-4xl mb-3">📋</p>
            <p className="font-semibold text-lg mb-2">No jobs posted yet</p>
            <p className="text-sm mb-6" style={{ color: "#64748b" }}>
              Post your first job to start finding candidates
            </p>
            <Link
              to="/create-job"
              className="inline-block px-5 py-2.5 rounded-xl font-semibold text-sm"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white" }}
            >
              Post First Job
            </Link>
          </div>
        )}

        {/* Job cards */}
        {!loading && jobs.map(job => (
          <div
            key={job._id}
            className="rounded-2xl p-6 mb-4 transition-all"
            style={{ background: "#0d1117", border: "1px solid #1e2a4a" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "#4f46e5"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "#1e2a4a"}
          >
            {/* Top row: title + posted date */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="text-xl font-bold mb-0.5">{job.title}</h2>
                <p style={{ color: "#94a3b8" }}>{job.company}</p>
              </div>
              <p className="text-xs" style={{ color: "#475569" }}>
                {new Date(job.createdAt).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric",
                })}
              </p>
            </div>

            {/* Badges row */}
            <div className="flex flex-wrap gap-2 mb-5">
              {/* Job type */}
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                style={{ background: "#1e1b4b", color: "#a5b4fc", border: "1px solid #4f46e5" }}
              >
                {job.jobType}
              </span>

              {/* Experience level */}
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                style={{ background: "#0f1b2d", color: "#38bdf8", border: "1px solid #0369a1" }}
              >
                {job.experienceLevel}
              </span>

              {/* Location */}
              <span className="text-xs flex items-center gap-1" style={{ color: "#64748b" }}>
                📍 {job.location}
              </span>

              {/* Applicant count — the main fix */}
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                style={{ background: "#0d2f1a", color: "#4ade80", border: "1px solid #166534" }}
              >
                👥 {job.applicantCount || 0} applicant{job.applicantCount !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Description preview */}
            <p
              className="text-sm mb-5 line-clamp-2"
              style={{ color: "#64748b" }}
            >
              {job.description}
            </p>

            {/* Action buttons */}
            <div
              className="flex flex-wrap gap-2 pt-4"
              style={{ borderTop: "1px solid #1e2a4a" }}
            >
              {/* View full job */}
              <Link
                to={`/jobs/${job._id}`}
                className="px-4 py-2 rounded-lg text-xs font-semibold transition-all"
                style={{ background: "#1e1b4b", color: "#a5b4fc", border: "1px solid #4f46e5" }}
              >
                View Job
              </Link>

              {/* Manage applicants */}
              <Link
                to={`/applicants/${job._id}`}
                className="px-4 py-2 rounded-lg text-xs font-semibold"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white" }}
              >
                Manage Applicants
              </Link>

              {/* AI ranking */}
              <Link
                to={`/applicants-dashboard/${job._id}`}
                className="px-4 py-2 rounded-lg text-xs font-semibold"
                style={{ background: "#2a1a3a", color: "#c084fc", border: "1px solid #7c3aed" }}
              >
                AI Ranking
              </Link>

              {/* Delete — pushed to right */}
              <button
                onClick={() => handleDelete(job._id)}
                disabled={deletingId === job._id}
                className="px-4 py-2 rounded-lg text-xs font-semibold ml-auto transition-all"
                style={{
                  background: "#2a1a1a",
                  color:      "#f87171",
                  border:     "1px solid #991b1b",
                  opacity:    deletingId === job._id ? 0.5 : 1,
                  cursor:     deletingId === job._id ? "not-allowed" : "pointer",
                }}
              >
                {deletingId === job._id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}

export default RecruiterDashboard;