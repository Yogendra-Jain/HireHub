import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  FileText,
  Clock,
  CheckCircle,
  Calendar,
  Briefcase,
  Search,
  Upload,
  MessageSquare,
  PlusCircle,
  List,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

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
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/jobs/my-jobs`, {
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

  // ── Helper: map application status to badge class ──────────
  const getStatusBadgeClass = (status) => {
    const s = status?.toLowerCase();
    if (s === "applied")                         return "badge status-applied";
    if (s === "reviewing" || s === "reviewed")    return "badge status-reviewedq";
    if (s === "accepted" || s === "selected")     return "badge status-selected";
    if (s === "rejected")                         return "badge status-rejected";
    return "badge badge-neutral";
  };

  // ── Candidate stat counts ─────────────────────────────────
  const totalApplied   = applications.length;
  const inReviewCount  = applications.filter(
    a => a.status === "Reviewing" || a.status === "Reviewed"
  ).length;
  const acceptedCount  = applications.filter(
    a => a.status === "Accepted" || a.status === "Selected"
  ).length;
  const interviewCount = applications.filter(
    a => a.status === "Interview" || a.status === "Scheduled"
  ).length;

  // ── Render ──────────────────────────────────────────────────
  return (
    <div className="page-container">

      {/* Welcome message — shows first name only */}
      <div className="page-header">
        <h1 className="page-title">
          Welcome back, {user?.name?.split(" ")[0]}
        </h1>
        <p className="page-subtitle">
          {isRecruiter
            ? "Manage your job postings and find talent"
            : "Track your applications and find new jobs"}
        </p>
      </div>

      {/* ── Recruiter Section ── */}
      {isRecruiter && (
        <>
          {/* Quick actions */}
          <div className="flex gap-3 mb-8">
            <Link to="/create-job" className="btn btn-primary">
              <PlusCircle size={16} />
              Post New Job
            </Link>
            <Link to="/recruiter-dashboard" className="btn btn-secondary">
              <List size={16} />
              All My Jobs
            </Link>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: "var(--primary-50)", color: "var(--primary)" }}>
                <FileText size={20} />
              </div>
              <div className="stat-card-value">
                {loading ? "—" : jobs.length}
              </div>
              <div className="stat-card-label">Total Jobs Posted</div>
            </div>
          </div>

          {/* Recent jobs list */}
          <h2 className="text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
            Recent Jobs
          </h2>

          {/* Loading skeletons */}
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="card">
                  <div className="card-body">
                    <div className="skeleton" style={{ width: "60%", height: "20px" }} />
                    <div className="skeleton mt-2" style={{ width: "40%", height: "16px" }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && jobs.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Briefcase size={32} />
              </div>
              <p className="empty-state-title">No jobs posted yet</p>
              <p className="empty-state-text">
                Create your first job listing to start finding candidates.
              </p>
              <Link to="/create-job" className="btn btn-primary mt-4">
                Post Your First Job
              </Link>
            </div>
          )}

          {/* Show latest 3 jobs */}
          {!loading && jobs.slice(0, 3).map(job => (
            <div key={job._id} className="card card-interactive mb-3">
              <div className="card-body flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="avatar avatar-md flex-center" style={{ background: "var(--primary-50)", color: "var(--primary)" }}>
                    <Briefcase size={20} />
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{job.title}</p>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      {job.company} · {job.location}
                    </p>
                  </div>
                </div>
                <Link to={`/applicants/${job._id}`} className="btn btn-primary btn-sm">
                  View Applicants
                </Link>
              </div>
            </div>
          ))}

          {/* Link to see all jobs */}
          {jobs.length > 3 && (
            <Link
              to="/recruiter-dashboard"
              className="flex items-center justify-center gap-1 text-sm mt-4 font-medium"
              style={{ color: "var(--primary)" }}
            >
              View all {jobs.length} jobs
              <ArrowRight size={14} />
            </Link>
          )}
        </>
      )}

      {/* ── Candidate Section ── */}
      {!isRecruiter && (
        <>
          {/* Quick actions */}
          <div className="flex flex-wrap gap-3 mb-8">
            <Link to="/jobs" className="btn btn-primary">
              <Search size={16} />
              Browse Jobs
            </Link>
            <Link to="/profile" className="btn btn-secondary">
              <Upload size={16} />
              Upload Resume
            </Link>
            <Link to="/ai-chat" className="btn btn-accent">
              <MessageSquare size={16} />
              AI Chat
            </Link>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {/* Total applied */}
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: "var(--primary-50)", color: "var(--primary)" }}>
                <FileText size={20} />
              </div>
              <div className="stat-card-value">
                {loading ? "—" : totalApplied}
              </div>
              <div className="stat-card-label">Applied</div>
            </div>

            {/* In review */}
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: "var(--warning-light)", color: "var(--warning)" }}>
                <Clock size={20} />
              </div>
              <div className="stat-card-value">
                {loading ? "—" : inReviewCount}
              </div>
              <div className="stat-card-label">In Review</div>
            </div>

            {/* Accepted */}
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: "var(--success-light)", color: "var(--success)" }}>
                <CheckCircle size={20} />
              </div>
              <div className="stat-card-value">
                {loading ? "—" : acceptedCount}
              </div>
              <div className="stat-card-label">Accepted</div>
            </div>

            {/* Interviews */}
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: "var(--info-light)", color: "var(--info)" }}>
                <Calendar size={20} />
              </div>
              <div className="stat-card-value">
                {loading ? "—" : interviewCount}
              </div>
              <div className="stat-card-label">Interviews</div>
            </div>
          </div>

          {/* Recent applications */}
          <h2 className="text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
            Recent Applications
          </h2>

          {/* Loading skeletons */}
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="card">
                  <div className="card-body">
                    <div className="skeleton" style={{ width: "60%", height: "20px" }} />
                    <div className="skeleton mt-2" style={{ width: "40%", height: "16px" }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && applications.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Search size={32} />
              </div>
              <p className="empty-state-title">No applications yet</p>
              <p className="empty-state-text">
                Start exploring open positions and submit your first application.
              </p>
              <Link to="/jobs" className="btn btn-primary mt-4">
                Browse Jobs
              </Link>
            </div>
          )}

          {/* Show latest 3 applications */}
          {!loading && applications.slice(0, 3).map(app => (
            <div key={app._id} className="card card-interactive mb-3">
              <div className="card-body flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="avatar avatar-md flex-center" style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)" }}>
                    <Briefcase size={20} />
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{app.job?.title}</p>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      {app.job?.company}
                    </p>
                  </div>
                </div>

                {/* Status badge */}
                <span className={getStatusBadgeClass(app.status)}>
                  {app.status}
                </span>
              </div>
            </div>
          ))}

          {/* Link to see all applications */}
          {applications.length > 3 && (
            <Link
              to="/my-applications"
              className="flex items-center justify-center gap-1 text-sm mt-4 font-medium"
              style={{ color: "var(--primary)" }}
            >
              View all {applications.length} applications
              <ArrowRight size={14} />
            </Link>
          )}
        </>
      )}

    </div>
  );
}

export default Dashboard;