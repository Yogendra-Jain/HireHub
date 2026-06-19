import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

// ─────────────────────────────────────────────────────────────
// Applicants Page — Recruiter view
//
// BUG FIX #4: Recruiter couldn't see applicant resume
//
// Root cause: getApplicants only populated "name email"
// Fix in backend: now populates "name email resume resumeAnalysis"
//
// Fix in frontend: "Manage Applications" tab now shows a
// "View Resume" button for each applicant that has uploaded one.
// ─────────────────────────────────────────────────────────────

const STATUS_COLORS = {
  Applied: { bg: "#1e1b4b", color: "#a5b4fc", border: "#4f46e5" },
  Reviewed: { bg: "#0f1b2d", color: "#38bdf8", border: "#0369a1" },
  Selected: { bg: "#0d2f1a", color: "#4ade80", border: "#166534" },
  Rejected: { bg: "#2a1a1a", color: "#f87171", border: "#991b1b" },
};

const scoreColor = (s) =>
  s >= 70 ? "#818cf8" : s >= 40 ? "#fbbf24" : "#f87171";

function RankMedal({ rank }) {
  if (rank === 0) return <span className="text-xl">🥇</span>;
  if (rank === 1) return <span className="text-xl">🥈</span>;
  if (rank === 2) return <span className="text-xl">🥉</span>;
  return (
    <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
      style={{ background: "#1e2a4a", color: "#64748b" }}>
      {rank + 1}
    </span>
  );
}

function Applicants() {
  const { jobId } = useParams();

  const [applications, setApplications] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [loadingBoard, setLoadingBoard] = useState(true);
  const [activeTab, setActiveTab] = useState("ranking");
  const [updatingId, setUpdatingId] = useState(null);

  const [showInterviewModal, setShowInterviewModal] = useState(false);

  const [selectedApplication, setSelectedApplication] = useState(null);

  const [interviewData, setInterviewData] = useState({
    date: "",
    time: "",
    meetingLink: "",
  });


  useEffect(() => {
    fetchApplicants();
    fetchLeaderboard();
  }, []);

  const fetchApplicants = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:5000/api/applications/job/${jobId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setApplications(res.data);
    } catch (err) { console.error(err); }
    finally { setLoadingApps(false); }
  };

  const fetchLeaderboard = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:5000/api/job-match/applicants-match/${jobId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLeaderboard(res.data);
    } catch (err) { console.error(err); }
    finally { setLoadingBoard(false); }
  };

  const updateStatus = async (appId, newStatus) => {
    setUpdatingId(appId);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/applications/status/${appId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchApplicants(); // refresh
    } catch (err) { alert("Failed to update status"); }
    finally { setUpdatingId(null); }
  };

  const openInterviewModal = (applicationId) => {

    setSelectedApplication(applicationId);

    setShowInterviewModal(true);

  };

  const scheduleInterview = async () => {

    try {

      const token =
        localStorage.getItem("token");

      await axios.post(

        `http://localhost:5000/api/interview-schedule/schedule/${selectedApplication}`,

        interviewData,

        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

      alert(
        "Interview Scheduled Successfully"
      );

      setShowInterviewModal(false);

      setInterviewData({
        date: "",
        time: "",
        meetingLink: "",
      });

    } catch (error) {

      console.log(error);

      alert(
        "Failed to Schedule Interview"
      );

    }

  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div style={{ background: "#070b18", minHeight: "100vh", color: "white" }}>
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <Link to="/recruiter-dashboard"
            className="flex items-center gap-2 mb-4 text-sm transition-colors"
            style={{ color: "#64748b" }}
            onMouseEnter={e => e.currentTarget.style.color = "#a5b4fc"}
            onMouseLeave={e => e.currentTarget.style.color = "#64748b"}>
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold mb-1">Applicants</h1>
          <p style={{ color: "#64748b" }}>
            {applications.length} total applicant{applications.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 mb-8 border-b" style={{ borderColor: "#1e2a4a" }}>
          {[
            { key: "ranking", label: "AI Ranking" },
            { key: "manage", label: `Manage (${applications.length})` },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className="pb-3 px-1 font-medium text-sm transition-colors"
              style={{
                color: activeTab === t.key ? "#818cf8" : "#64748b",
                borderBottom: activeTab === t.key ? "2px solid #6366f1" : "2px solid transparent",
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── AI RANKING TAB ── */}
        {activeTab === "ranking" && (
          <div>
            {loadingBoard ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: "#0d1117" }} />
                ))}
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-16" style={{ color: "#64748b" }}>
                <p className="text-lg font-semibold text-white mb-2">No ranked candidates yet</p>
                <p className="text-sm">Candidates need to analyze their resumes to get a match score</p>
              </div>
            ) : (
              <div className="space-y-4">
                {leaderboard.map((c, idx) => (
                  <div key={c.applicationId}
                    className="rounded-2xl p-6 transition-all"
                    style={{ background: "#0d1117", border: "1px solid #1e2a4a" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "#4f46e5"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "#1e2a4a"}>

                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <RankMedal rank={idx} />
                        <div>
                          <p className="font-bold">{c.name}</p>
                          <p className="text-sm" style={{ color: "#64748b" }}>{c.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold" style={{ color: scoreColor(c.matchScore) }}>
                          {c.matchScore}%
                        </p>
                        <p className="text-xs" style={{ color: "#64748b" }}>match</p>
                      </div>
                    </div>

                    {c.recommendation && (
                      <p className="text-sm font-semibold mb-1" style={{ color: scoreColor(c.matchScore) }}>
                        {c.recommendation}
                      </p>
                    )}
                    {c.aiInsight && (
                      <p className="text-sm mb-3" style={{ color: "#94a3b8" }}>{c.aiInsight}</p>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {c.matchedSkills?.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full text-xs"
                          style={{ background: "#0d2f1a", color: "#4ade80" }}>{s}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── MANAGE TAB ── */}
        {activeTab === "manage" && (
          <div>
            {loadingApps ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: "#0d1117" }} />
                ))}
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-16" style={{ color: "#64748b" }}>
                <p className="text-lg font-semibold text-white mb-2">No applications yet</p>
                <p className="text-sm">Candidates will appear here once they apply</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map(app => {
                  const sc = STATUS_COLORS[app.status] || STATUS_COLORS["Applied"];
                  return (
                    <div key={app._id}
                      className="rounded-2xl p-6 transition-all"
                      style={{ background: "#0d1117", border: "1px solid #1e2a4a" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = "#4f46e5"}
                      onMouseLeave={e => e.currentTarget.style.borderColor = "#1e2a4a"}>

                      {/* Top row */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
                            style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)", color: "white" }}>
                            {app.candidate?.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold">{app.candidate?.name}</p>
                            <p className="text-sm" style={{ color: "#64748b" }}>{app.candidate?.email}</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold"
                          style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                          {app.status}
                        </span>
                      </div>

                      <p className="text-xs mb-4" style={{ color: "#475569" }}>
                        Applied {formatDate(app.createdAt)}
                      </p>

                      {/* FIX #4: Resume link — shows only if candidate uploaded a resume */}
                      {app.candidate?.resume && (
                        <div className="flex items-center gap-3 p-3 rounded-xl mb-4"
                          style={{ background: "#1e1b4b", border: "1px solid #4f46e5" }}>
                          <span className="text-sm font-medium" style={{ color: "#a5b4fc" }}>
                            📄 Resume uploaded
                          </span>
                          <a href={app.candidate.resume} target="_blank" rel="noreferrer"
                            className="ml-auto px-3 py-1.5 rounded-lg text-xs font-semibold"
                            style={{ background: "#4f46e5", color: "white" }}>
                            View Resume
                          </a>
                        </div>
                      )}

                      {/* No resume message */}
                      {!app.candidate?.resume && (
                        <div className="p-3 rounded-xl mb-4"
                          style={{ background: "#1a1a2e", border: "1px solid #1e2a4a" }}>
                          <p className="text-xs" style={{ color: "#475569" }}>
                            No resume uploaded by this candidate
                          </p>
                        </div>
                      )}

                      {/* Status update */}
                      <div className="flex items-center gap-3">
                        <label className="text-sm" style={{ color: "#94a3b8" }}>
                          Update status:
                        </label>
                        <select
                          value={app.status}
                          disabled={updatingId === app._id}
                          onChange={e => updateStatus(app._id, e.target.value)}
                          className="px-3 py-2 rounded-lg text-sm outline-none"
                          style={{
                            background: "#1e2a4a", color: "white", border: "1px solid #2a3a5a",
                            opacity: updatingId === app._id ? 0.5 : 1
                          }}>
                          <option value="Applied">Applied</option>
                          <option value="Reviewed">Reviewed</option>
                          <option value="Selected">Selected</option>
                          <option value="Rejected">Rejected</option>
                        </select>

                        <button
                          onClick={() =>
                            openInterviewModal(app._id)
                          }
                          className="px-4 py-2 rounded-lg text-sm font-semibold"
                          style={{
                            background: "#4f46e5",
                            color: "white"
                          }}
                        >
                          Schedule Interview
                        </button>

                        {updatingId === app._id && (
                          <span className="text-xs" style={{ color: "#64748b" }}>Saving...</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {showInterviewModal && (
          <div style={{
            position: "fixed", inset: 0, zIndex: 50,
            background: "rgba(0,0,0,0.8)", display: "flex",
            alignItems: "center", justifyContent: "center", padding: 24
          }}>
            <div style={{
              background: "#0d1117", border: "1px solid #1e2a4a",
              borderRadius: 20, width: "100%", maxWidth: 500,
              boxShadow: "0 32px 80px rgba(0,0,0,0.6)"
            }}>
              {/* Modal header */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "20px 24px", borderBottom: "1px solid #1e2a4a"
              }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "white" }}>Schedule Interview</h2>
                  <p style={{ margin: "3px 0 0", fontSize: 12, color: "#64748b" }}>Candidate will be notified by email</p>
                </div>
                <button onClick={() => setShowInterviewModal(false)} style={{
                  background: "#1e2a4a", border: "none", borderRadius: 8,
                  color: "#94a3b8", cursor: "pointer", padding: "6px 10px", fontSize: 18, lineHeight: 1
                }}>✕</button>
              </div>

              {/* Modal body */}
              <div style={{ padding: 24 }}>
                {/* Date field */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 12, color: "#64748b", marginBottom: 6, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    📅 Interview date
                  </label>
                  <input
                    type="date"
                    style={{
                      width: "100%", padding: "11px 14px", borderRadius: 10,
                      background: "#0a0e1a", border: "1px solid #1e2a4a", color: "white",
                      fontSize: 14, outline: "none", boxSizing: "border-box"
                    }}
                    value={interviewData.date}
                    onChange={(e) => setInterviewData({ ...interviewData, date: e.target.value })}
                  />
                </div>

                {/* Time field */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 12, color: "#64748b", marginBottom: 6, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    🕐 Interview time
                  </label>
                  <input
                    type="time"
                    style={{
                      width: "100%", padding: "11px 14px", borderRadius: 10,
                      background: "#0a0e1a", border: "1px solid #1e2a4a", color: "white",
                      fontSize: 14, outline: "none", boxSizing: "border-box"
                    }}
                    value={interviewData.time}
                    onChange={(e) => setInterviewData({ ...interviewData, time: e.target.value })}
                  />
                </div>

                {/* Meeting link field */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", fontSize: 12, color: "#64748b", marginBottom: 6, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    🔗 Meeting link
                  </label>
                  <input
                    type="url"
                    placeholder="https://meet.google.com/abc-defg-hij"
                    style={{
                      width: "100%", padding: "11px 14px", borderRadius: 10,
                      background: "#0a0e1a", border: "1px solid #1e2a4a", color: "white",
                      fontSize: 14, outline: "none", boxSizing: "border-box"
                    }}
                    value={interviewData.meetingLink}
                    onChange={(e) => setInterviewData({ ...interviewData, meetingLink: e.target.value })}
                  />
                </div>

                {/* Email notice */}
                <div style={{
                  padding: "12px 14px", background: "#0d2f1a", border: "1px solid #166534",
                  borderRadius: 10, marginBottom: 20
                }}>
                  <p style={{ margin: 0, fontSize: 12, color: "#4ade80" }}>
                    📧 An email with the date, time, and meeting link will be automatically sent to the candidate.
                  </p>
                </div>

                {/* Action buttons */}
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={scheduleInterview}
                    disabled={!interviewData.date || !interviewData.time}
                    style={{
                      flex: 1, padding: "12px 0", borderRadius: 10, fontSize: 14, fontWeight: 700,
                      cursor: "pointer", background: "#4f46e5", color: "white", border: "none",
                      opacity: !interviewData.date || !interviewData.time ? 0.5 : 1,
                      transition: "all 0.2s"
                    }}
                  >
                    Schedule & notify candidate
                  </button>
                  <button
                    onClick={() => setShowInterviewModal(false)}
                    style={{
                      padding: "12px 20px", borderRadius: 10, fontSize: 14, fontWeight: 600,
                      cursor: "pointer", background: "#1e2a4a", color: "#94a3b8", border: "none"
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


export default Applicants;