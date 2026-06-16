import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

// ─────────────────────────────────────────────────────────────
// Dashboard Page
//
// What this page does:
//   - Reads the logged-in user from localStorage
//   - If RECRUITER → shows their posted jobs + quick actions
//   - If CANDIDATE → shows their applications + quick actions
//
// Why one component for both?
//   Because they share the same layout. We just show different
//   data based on user.role.
// ─────────────────────────────────────────────────────────────

function Dashboard() {
  const user        = JSON.parse(localStorage.getItem("user"));
  const isRecruiter = user?.role === "recruiter";

  // Jobs list (used if recruiter)
  const [jobs, setJobs] = useState([]);

  // Applications list (used if candidate)
  const [applications, setApplications] = useState([]);

  // True while fetching data from backend
  const [loading, setLoading] = useState(true);

  // On mount, fetch the right data based on role
  useEffect(() => {
    if (isRecruiter) {
      fetchMyJobs();
    } else {
      fetchMyApplications();
    }
  }, []);

  // ── Fetch recruiter's jobs ─────────────────────────────────
  const fetchMyJobs = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/jobs/my-jobs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobs(res.data);
    } catch (err) {
      console.error("Failed to load jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  // ── Fetch candidate's applications ─────────────────────────
  const fetchMyApplications = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
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

  // ── Render ──────────────────────────────────────────────────
  return (
    <div style={{ background: "#0f1117", minHeight: "100vh", color: "white" }}>
      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Welcome message — shows first name only */}
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="mb-10" style={{ color: "#94a3b8" }}>
          {isRecruiter
            ? "Manage your job postings and find talent"
            : "Track your applications and find new jobs"}
        </p>

        {/* ── Recruiter Section ── */}
        {isRecruiter && (
          <>
            {/* Quick actions */}
            <div className="flex gap-3 mb-10">
              <Link
                to="/create-job"
                className="px-5 py-3 rounded-lg font-semibold text-sm"
                style={{ background: "#22c55e", color: "#0f1117" }}
              >
                + Post New Job
              </Link>
              <Link
                to="/recruiter-dashboard"
                className="px-5 py-3 rounded-lg font-semibold text-sm"
                style={{ background: "#1e2130", color: "white" }}
              >
                All My Jobs
              </Link>
            </div>

            {/* Job count stat */}
            <div
              className="rounded-xl p-6 mb-6"
              style={{ background: "#13151c", border: "1px solid #1e2130" }}
            >
              <p className="text-sm mb-1" style={{ color: "#94a3b8" }}>
                Total Jobs Posted
              </p>
              <p className="text-4xl font-bold">
                {loading ? "—" : jobs.length}
              </p>
            </div>

            {/* Recent jobs list */}
            <h2 className="text-xl font-bold mb-4">Recent Jobs</h2>

            {loading && (
              <p style={{ color: "#64748b" }}>Loading...</p>
            )}

            {!loading && jobs.length === 0 && (
              <div
                className="rounded-xl p-8 text-center"
                style={{ background: "#13151c", border: "1px dashed #1e2130" }}
              >
                <p className="mb-4" style={{ color: "#64748b" }}>
                  No jobs posted yet
                </p>
                <Link
                  to="/create-job"
                  className="px-4 py-2 rounded-lg text-sm font-semibold"
                  style={{ background: "#22c55e", color: "#0f1117" }}
                >
                  Post Your First Job
                </Link>
              </div>
            )}

            {/* Show latest 3 jobs */}
            {!loading && jobs.slice(0, 3).map(job => (
              <div
                key={job._id}
                className="rounded-xl p-5 mb-3 flex items-center justify-between"
                style={{ background: "#13151c", border: "1px solid #1e2130" }}
              >
                <div>
                  <p className="font-semibold">{job.title}</p>
                  <p className="text-sm" style={{ color: "#94a3b8" }}>
                    {job.company} · {job.location}
                  </p>
                </div>
                <Link
                  to={`/applicants/${job._id}`}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{ background: "#22c55e", color: "#0f1117" }}
                >
                  View Applicants
                </Link>
              </div>
            ))}

            {/* Link to see all jobs */}
            {jobs.length > 3 && (
              <Link
                to="/recruiter-dashboard"
                className="block text-center text-sm mt-3"
                style={{ color: "#22c55e" }}
              >
                View all {jobs.length} jobs →
              </Link>
            )}
          </>
        )}

        {/* ── Candidate Section ── */}
        {!isRecruiter && (
          <>
            {/* Quick actions */}
            <div className="flex gap-3 mb-10">
              <Link
                to="/jobs"
                className="px-5 py-3 rounded-lg font-semibold text-sm"
                style={{ background: "#22c55e", color: "#0f1117" }}
              >
                Browse Jobs
              </Link>
              <Link
                to="/profile"
                className="px-5 py-3 rounded-lg font-semibold text-sm"
                style={{ background: "#1d4ed8", color: "white" }}
              >
                Upload Resume
              </Link>
              <Link
                to="/ai-chat"
                className="px-5 py-3 rounded-lg font-semibold text-sm"
                style={{ background: "#7c3aed", color: "white" }}
              >
                AI Chat
              </Link>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {/* Total applied */}
              <div
                className="rounded-xl p-5"
                style={{ background: "#13151c", border: "1px solid #1e2130" }}
              >
                <p className="text-sm mb-1" style={{ color: "#94a3b8" }}>
                  Applied
                </p>
                <p className="text-3xl font-bold">
                  {loading ? "—" : applications.length}
                </p>
              </div>

              {/* In review */}
              <div
                className="rounded-xl p-5"
                style={{ background: "#13151c", border: "1px solid #1e2130" }}
              >
                <p className="text-sm mb-1" style={{ color: "#94a3b8" }}>
                  In Review
                </p>
                <p className="text-3xl font-bold" style={{ color: "#38bdf8" }}>
                  {loading
                    ? "—"
                    : applications.filter(
                        a => a.status === "Reviewing" || a.status === "Reviewed"
                      ).length}
                </p>
              </div>

              {/* Accepted */}
              <div
                className="rounded-xl p-5"
                style={{ background: "#13151c", border: "1px solid #1e2130" }}
              >
                <p className="text-sm mb-1" style={{ color: "#94a3b8" }}>
                  Accepted
                </p>
                <p className="text-3xl font-bold" style={{ color: "#22c55e" }}>
                  {loading
                    ? "—"
                    : applications.filter(
                        a => a.status === "Accepted" || a.status === "Selected"
                      ).length}
                </p>
              </div>
            </div>

            {/* Recent applications */}
            <h2 className="text-xl font-bold mb-4">Recent Applications</h2>

            {loading && (
              <p style={{ color: "#64748b" }}>Loading...</p>
            )}

            {!loading && applications.length === 0 && (
              <div
                className="rounded-xl p-8 text-center"
                style={{ background: "#13151c", border: "1px dashed #1e2130" }}
              >
                <p className="mb-4" style={{ color: "#64748b" }}>
                  No applications yet
                </p>
                <Link
                  to="/jobs"
                  className="px-4 py-2 rounded-lg text-sm font-semibold"
                  style={{ background: "#22c55e", color: "#0f1117" }}
                >
                  Browse Jobs
                </Link>
              </div>
            )}

            {/* Show latest 3 applications */}
            {!loading && applications.slice(0, 3).map(app => (
              <div
                key={app._id}
                className="rounded-xl p-5 mb-3 flex items-center justify-between"
                style={{ background: "#13151c", border: "1px solid #1e2130" }}
              >
                <div>
                  <p className="font-semibold">{app.job?.title}</p>
                  <p className="text-sm" style={{ color: "#94a3b8" }}>
                    {app.job?.company}
                  </p>
                </div>

                {/* Status badge */}
                <span
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    background: app.status === "Rejected" ? "#3a1a1a" : "#1a2f1a",
                    color:      app.status === "Rejected" ? "#f87171" : "#4ade80",
                  }}
                >
                  {app.status}
                </span>
              </div>
            ))}

            {/* Link to see all applications */}
            {applications.length > 3 && (
              <Link
                to="/my-applications"
                className="block text-center text-sm mt-3"
                style={{ color: "#22c55e" }}
              >
                View all {applications.length} applications →
              </Link>
            )}
          </>
        )}

      </div>
    </div>
  );
}

export default Dashboard;