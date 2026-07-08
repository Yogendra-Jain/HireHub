import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
function StatCard({ label, value, color }) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: "#0d1117", border: "1px solid #1e2a4a" }}
    >
      <p className="text-sm mb-1" style={{ color: "#64748b" }}>{label}</p>
      <p className="text-4xl font-bold" style={{ color: color || "white" }}>
        {value ?? "—"}
      </p>
    </div>
  );
}

// ── Tab button ─────────────────────────────────────────────────
function TabBtn({ label, active, onClick, count }) {
  return (
    <button
      onClick={onClick}
      className="pb-3 px-1 text-sm font-medium transition-colors flex items-center gap-2"
      style={{
        color:        active ? "#818cf8" : "#64748b",
        borderBottom: active ? "2px solid #6366f1" : "2px solid transparent",
      }}
    >
      {label}
      {count !== undefined && (
        <span
          className="px-2 py-0.5 rounded-full text-xs"
          style={{ background: active ? "#1e1b4b" : "#1e2a4a", color: active ? "#a5b4fc" : "#64748b" }}
        >
          {count}
        </span>
      )}
    </button>
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
    const map = {
      Applied:  { bg: "#1e1b4b", color: "#a5b4fc" },
      Reviewed: { bg: "#0f2044", color: "#38bdf8" },
      Selected: { bg: "#0d2f1a", color: "#4ade80" },
      Rejected: { bg: "#2a1a1a", color: "#f87171" },
    };
    const s = map[status] || map["Applied"];
    return (
      <span
        className="px-2.5 py-1 rounded-full text-xs font-semibold"
        style={{ background: s.bg, color: s.color }}
      >
        {status}
      </span>
    );
  };

  // ── Role badge ───────────────────────────────────────────────
  const RoleBadge = ({ role }) => {
    const map = {
      candidate: { bg: "#1e1b4b", color: "#a5b4fc" },
      recruiter: { bg: "#0f2044", color: "#38bdf8" },
      admin:     { bg: "#2a1a3a", color: "#c084fc" },
    };
    const s = map[role] || map["candidate"];
    return (
      <span
        className="px-2.5 py-1 rounded-full text-xs font-semibold"
        style={{ background: s.bg, color: s.color }}
      >
        {role}
      </span>
    );
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div style={{ background: "#070b18", minHeight: "100vh", color: "white" }}>
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-2"
              style={{ background: "#2a1a3a", color: "#c084fc", border: "1px solid #7c3aed" }}
            >
              🛡 Admin Panel
            </div>
            <h1 className="text-3xl font-bold">Platform Management</h1>
            <p className="mt-1" style={{ color: "#64748b" }}>
              Manage users, jobs, and applications
            </p>
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-10">
          <StatCard label="Total Users"        value={stats?.totalUsers}        color="white"    />
          <StatCard label="Candidates"         value={stats?.totalCandidates}   color="#a5b4fc"  />
          <StatCard label="Recruiters"         value={stats?.totalRecruiters}   color="#38bdf8"  />
          <StatCard label="Jobs Posted"        value={stats?.totalJobs}         color="#c084fc"  />
          <StatCard label="Applications"       value={stats?.totalApplications} color="#4ade80"  />
        </div>

        {/* ── Tabs ── */}
        <div
          className="flex gap-6 mb-8 border-b"
          style={{ borderColor: "#1e2a4a" }}
        >
          <TabBtn label="Users"        active={tab === "users"}        onClick={() => setTab("users")}        count={users.length}        />
          <TabBtn label="Jobs"         active={tab === "jobs"}         onClick={() => setTab("jobs")}         count={jobs.length}         />
          <TabBtn label="Applications" active={tab === "applications"} onClick={() => setTab("applications")} count={applications.length} />
        </div>

        {/* ──────────────────────────────────────────────────── */}
        {/* USERS TAB                                           */}
        {/* ──────────────────────────────────────────────────── */}
        {tab === "users" && (
          <div>
            {users.length === 0 ? (
              <p style={{ color: "#64748b" }}>No users found.</p>
            ) : (
              <div className="space-y-3">
                {users.map(u => (
                  <div
                    key={u._id}
                    className="flex items-center justify-between p-4 rounded-2xl"
                    style={{ background: "#0d1117", border: "1px solid #1e2a4a" }}
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                        style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)", color: "white" }}
                      >
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{u.name}</p>
                        <p className="text-xs" style={{ color: "#64748b" }}>{u.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <RoleBadge role={u.role} />
                      <p className="text-xs hidden md:block" style={{ color: "#475569" }}>
                        Joined {formatDate(u.createdAt)}
                      </p>

                      {/* Don't allow deleting yourself */}
                      {u._id !== user?._id && u.role !== "admin" && (
                        <button
                          onClick={() => handleDeleteUser(u._id, u.name)}
                          disabled={deletingId === u._id}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                          style={{
                            background: "#2a1a1a",
                            color:      "#f87171",
                            border:     "1px solid #991b1b",
                            opacity:    deletingId === u._id ? 0.5 : 1,
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = "#3a1a1a"}
                          onMouseLeave={e => e.currentTarget.style.background = "#2a1a1a"}
                        >
                          {deletingId === u._id ? "Deleting..." : "Delete"}
                        </button>
                      )}
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
              <p style={{ color: "#64748b" }}>No jobs found.</p>
            ) : (
              <div className="space-y-3">
                {jobs.map(job => (
                  <div
                    key={job._id}
                    className="flex items-center justify-between p-4 rounded-2xl"
                    style={{ background: "#0d1117", border: "1px solid #1e2a4a" }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                        style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)", color: "white" }}
                      >
                        {job.company?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{job.title}</p>
                        <p className="text-xs" style={{ color: "#64748b" }}>
                          {job.company} · by {job.recruiter?.name || "Unknown"} · {formatDate(job.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className="px-2 py-0.5 rounded-full text-xs hidden md:block"
                        style={{ background: "#1e1b4b", color: "#a5b4fc" }}
                      >
                        {job.jobType}
                      </span>
                      <button
                        onClick={() => handleDeleteJob(job._id, job.title)}
                        disabled={deletingId === job._id}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        style={{
                          background: "#2a1a1a",
                          color:      "#f87171",
                          border:     "1px solid #991b1b",
                          opacity:    deletingId === job._id ? 0.5 : 1,
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "#3a1a1a"}
                        onMouseLeave={e => e.currentTarget.style.background = "#2a1a1a"}
                      >
                        {deletingId === job._id ? "Deleting..." : "Delete"}
                      </button>
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
              <p style={{ color: "#64748b" }}>No applications found.</p>
            ) : (
              <div className="space-y-3">
                {applications.map(app => (
                  <div
                    key={app._id}
                    className="flex items-center justify-between p-4 rounded-2xl"
                    style={{ background: "#0d1117", border: "1px solid #1e2a4a" }}
                  >
                    <div>
                      <p className="font-semibold text-sm">
                        {app.candidate?.name}
                        <span style={{ color: "#64748b" }}> applied to </span>
                        {app.job?.title}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>
                        {app.candidate?.email} · {app.job?.company} · {formatDate(app.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default AdminPanel;