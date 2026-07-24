import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Users,
  UserCheck,
  Building2,
  Briefcase,
  FileText,
  Trash2,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// AdminPanel Page
//
// What it does:
//   - Stats overview (users, jobs, applications)
//   - Users tab: list all candidates + recruiters, delete any
//   - Jobs tab: list all jobs across recruiters, delete any
//   - Applications tab: see every application with status
//
// Access: only users with role "admin" can reach this page.
// The RoleProtectedRoute in App.jsx enforces this on frontend.
// The admin.middleware.js enforces it on backend.
// ─────────────────────────────────────────────────────────────

// ── Reusable stat card ─────────────────────────────────────────
function StatCard({ label, value, icon, iconBg }) {
  return (
    <div className="stat-card">
      <div className="stat-card-icon" style={{ background: iconBg || 'var(--primary-50)', color: 'var(--primary)' }}>
        {icon}
      </div>
      <div>
        <p className="stat-card-value">{value ?? "—"}</p>
        <p className="stat-card-label">{label}</p>
      </div>
    </div>
  );
}

function AdminPanel() {
  const navigate = useNavigate();

  // Check admin access on mount
  const user = JSON.parse(localStorage.getItem("user"));
  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
    }
  }, []);

  const [tab,          setTab]          = useState("users");  // active tab
  const [stats,        setStats]        = useState(null);
  const [users,        setUsers]        = useState([]);
  const [jobs,         setJobs]         = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [deletingId,   setDeletingId]   = useState(null);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // Fetch all data on mount
  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchJobs();
    fetchApplications();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/stats`, { headers });
      setStats(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/users`, { headers });
      setUsers(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchJobs = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/jobs`, { headers });
      setJobs(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchApplications = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/applications`, { headers });
      setApplications(res.data);
    } catch (err) { console.error(err); }
  };

  // ── Delete user ──────────────────────────────────────────────
  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Delete user "${userName}"? This will also delete their applications.`)) return;
    setDeletingId(userId);
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/users/${userId}`, { headers });
      setUsers(users.filter(u => u._id !== userId));
      fetchStats(); // refresh stats
    } catch (err) {
      alert("Failed to delete user");
    } finally {
      setDeletingId(null);
    }
  };

  // ── Delete job ───────────────────────────────────────────────
  const handleDeleteJob = async (jobId, jobTitle) => {
    if (!window.confirm(`Delete job "${jobTitle}"? This will also delete all its applications.`)) return;
    setDeletingId(jobId);
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/jobs/${jobId}`, { headers });
      setJobs(jobs.filter(j => j._id !== jobId));
      fetchStats();
    } catch (err) {
      alert("Failed to delete job");
    } finally {
      setDeletingId(null);
    }
  };

  // ── Status badge ─────────────────────────────────────────────
  const StatusBadge = ({ status }) => {
    const classMap = {
      Applied:  "status-applied",
      Reviewed: "status-reviewed",
      Selected: "status-selected",
      Rejected: "status-rejected",
    };
    const statusClass = classMap[status] || classMap["Applied"];
    return (
      <span className={`badge ${statusClass}`}>
        {status}
      </span>
    );
  };

  // ── Role badge ───────────────────────────────────────────────
  const RoleBadge = ({ role }) => {
    const classMap = {
      candidate: "badge-primary",
      recruiter: "badge-info",
      admin:     "badge-warning",
    };
    const roleClass = classMap[role] || classMap["candidate"];
    return (
      <span className={`badge ${roleClass}`}>
        {role}
      </span>
    );
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="page-container">

      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-2 mb-2">
          <span className="badge badge-warning">
            <Shield size={12} />
            Admin Panel
          </span>
        </div>
        <h1 className="page-title">Platform Management</h1>
        <p className="page-subtitle">Manage users, jobs, and applications</p>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-10">
        <StatCard label="Total Users"   value={stats?.totalUsers}        icon={<Users size={20} />}    iconBg="var(--primary-50)" />
        <StatCard label="Candidates"    value={stats?.totalCandidates}   icon={<UserCheck size={20} />} iconBg="var(--primary-50)" />
        <StatCard label="Recruiters"    value={stats?.totalRecruiters}   icon={<Building2 size={20} />} iconBg="var(--info-light)" />
        <StatCard label="Jobs Posted"   value={stats?.totalJobs}         icon={<Briefcase size={20} />} iconBg="var(--warning-light)" />
        <StatCard label="Applications"  value={stats?.totalApplications} icon={<FileText size={20} />}  iconBg="var(--success-light)" />
      </div>

      {/* ── Tabs ── */}
      <div className="tabs mb-8">
        <button
          onClick={() => setTab("users")}
          className={`tab ${tab === "users" ? "tab-active" : ""}`}
        >
          Users
          <span className="badge badge-neutral ml-2">{users.length}</span>
        </button>
        <button
          onClick={() => setTab("jobs")}
          className={`tab ${tab === "jobs" ? "tab-active" : ""}`}
        >
          Jobs
          <span className="badge badge-neutral ml-2">{jobs.length}</span>
        </button>
        <button
          onClick={() => setTab("applications")}
          className={`tab ${tab === "applications" ? "tab-active" : ""}`}
        >
          Applications
          <span className="badge badge-neutral ml-2">{applications.length}</span>
        </button>
      </div>

      {/* ──────────────────────────────────────────────────── */}
      {/* USERS TAB                                           */}
      {/* ──────────────────────────────────────────────────── */}
      {tab === "users" && (
        <div>
          {users.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state-text">No users found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map(u => (
                <div key={u._id} className="card">
                  <div className="card-body-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="avatar avatar-sm">
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{u.name}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{u.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <RoleBadge role={u.role} />
                      <p className="text-xs hidden md:block" style={{ color: 'var(--text-muted)' }}>
                        Joined {formatDate(u.createdAt)}
                      </p>

                      {/* Don't allow deleting yourself */}
                      {u._id !== user?._id && u.role !== "admin" && (
                        <button
                          onClick={() => handleDeleteUser(u._id, u.name)}
                          disabled={deletingId === u._id}
                          className="btn btn-danger btn-sm"
                        >
                          <Trash2 size={14} />
                          {deletingId === u._id ? "Deleting..." : "Delete"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ──────────────────────────────────────────────────── */}
      {/* JOBS TAB                                            */}
      {/* ──────────────────────────────────────────────────── */}
      {tab === "jobs" && (
        <div>
          {jobs.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state-text">No jobs found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map(job => (
                <div key={job._id} className="card">
                  <div className="card-body-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="avatar avatar-sm">
                        {job.company?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{job.title}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {job.company} · by {job.recruiter?.name || "Unknown"} · {formatDate(job.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="badge badge-neutral hidden md:inline-flex">
                        {job.jobType}
                      </span>
                      <button
                        onClick={() => handleDeleteJob(job._id, job.title)}
                        disabled={deletingId === job._id}
                        className="btn btn-danger btn-sm"
                      >
                        <Trash2 size={14} />
                        {deletingId === job._id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ──────────────────────────────────────────────────── */}
      {/* APPLICATIONS TAB                                    */}
      {/* ──────────────────────────────────────────────────── */}
      {tab === "applications" && (
        <div>
          {applications.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state-text">No applications found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map(app => (
                <div key={app._id} className="card">
                  <div className="card-body-sm flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">
                        {app.candidate?.name}
                        <span style={{ color: 'var(--text-muted)' }}> applied to </span>
                        {app.job?.title}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {app.candidate?.email} · {app.job?.company} · {formatDate(app.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}

export default AdminPanel;