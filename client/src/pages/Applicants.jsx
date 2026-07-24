import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import {
  FileText,
  Calendar,
  Clock,
  ExternalLink,
  Mail,
  ArrowLeft,
  X,
  Users,
} from "lucide-react";

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

const STATUS_CONFIG = {
  Applied:  { className: "status-applied" },
  Reviewed: { className: "status-reviewed" },
  Selected: { className: "status-selected" },
  Rejected: { className: "status-rejected" },
};

function ScoreDisplay({ score }) {
  let level = "score-low";
  if (score >= 70) level = "score-high";
  else if (score >= 40) level = "score-medium";
  return (
    <div className="text-right">
      <span className={`score-circle ${level}`}>{score}%</span>
      <p className="text-xs text-[var(--text-muted)] mt-1">match</p>
    </div>
  );
}

function RankBadge({ rank }) {
  if (rank === 0) return <span className="badge rank-1 font-bold">1st</span>;
  if (rank === 1) return <span className="badge rank-2 font-bold">2nd</span>;
  if (rank === 2) return <span className="badge rank-3 font-bold">3rd</span>;
  return (
    <span className="badge badge-neutral font-bold">
      {rank + 1}th
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
        `${import.meta.env.VITE_API_URL}/api/applications/job/${jobId}`,
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
        `${import.meta.env.VITE_API_URL}/api/job-match/applicants-match/${jobId}`,
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
        `${import.meta.env.VITE_API_URL}/api/applications/status/${appId}`,
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

        `${import.meta.env.VITE_API_URL}/api/interview-schedule/schedule/${selectedApplication}`,

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
    <div className="page-container">

      {/* Header */}
      <div className="page-header">
        <Link
          to="/recruiter-dashboard"
          className="flex items-center gap-1.5 mb-4 text-sm text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <h1 className="page-title">Applicants</h1>
        <p className="page-subtitle">
          {applications.length} total applicant{applications.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Tabs */}
      <div className="tabs mb-8">
        {[
          { key: "ranking", label: "AI Ranking" },
          { key: "manage", label: `Manage (${applications.length})` },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`tab ${activeTab === t.key ? "tab-active" : ""}`}
          >
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
                <div key={i} className="skeleton h-24 rounded-xl" />
              ))}
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-icon">
                  <Users size={28} />
                </div>
                <p className="empty-state-title">No ranked candidates yet</p>
                <p className="empty-state-text">Candidates need to analyze their resumes to get a match score</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {leaderboard.map((c, idx) => (
                <div key={c.applicationId} className="card card-interactive card-body">

                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <RankBadge rank={idx} />
                      <div>
                        <p className="font-bold">{c.name}</p>
                        <p className="text-sm text-[var(--text-secondary)]">{c.email}</p>
                      </div>
                    </div>
                    <ScoreDisplay score={c.matchScore} />
                  </div>

                  {c.recommendation && (
                    <p className={`text-sm font-semibold mb-1 ${
                      c.matchScore >= 70 ? "text-[var(--primary)]"
                      : c.matchScore >= 40 ? "text-[var(--warning)]"
                      : "text-[var(--error)]"
                    }`}>
                      {c.recommendation}
                    </p>
                  )}
                  {c.aiInsight && (
                    <p className="text-sm text-[var(--text-secondary)] mb-3">{c.aiInsight}</p>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {c.matchedSkills?.map((s, i) => (
                      <span key={i} className="badge badge-success">{s}</span>
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
                <div key={i} className="skeleton h-28 rounded-xl" />
              ))}
            </div>
          ) : applications.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-icon">
                  <Users size={28} />
                </div>
                <p className="empty-state-title">No applications yet</p>
                <p className="empty-state-text">Candidates will appear here once they apply</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map(app => {
                const sc = STATUS_CONFIG[app.status] || STATUS_CONFIG["Applied"];
                return (
                  <div key={app._id} className="card card-interactive card-body">

                    {/* Top row */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="avatar avatar-md">
                          {app.candidate?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold">{app.candidate?.name}</p>
                          <p className="text-sm text-[var(--text-secondary)]">{app.candidate?.email}</p>
                        </div>
                      </div>
                      <span className={`badge ${sc.className}`}>
                        {app.status}
                      </span>
                    </div>

                    <p className="text-xs text-[var(--text-muted)] mb-4 flex items-center gap-1">
                      <Calendar size={12} /> Applied {formatDate(app.createdAt)}
                    </p>

                    {/* FIX #4: Resume link — shows only if candidate uploaded a resume */}
                    {app.candidate?.resume && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] mb-4">
                        <FileText size={16} className="text-[var(--text-secondary)]" />
                        <span className="text-sm font-medium">
                          Resume uploaded
                        </span>
                        <a
                          href={app.candidate.resume}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary btn-sm ml-auto"
                        >
                          <FileText size={14} /> View Resume
                        </a>
                      </div>
                    )}

                    {/* No resume message */}
                    {!app.candidate?.resume && (
                      <div className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] mb-4">
                        <p className="text-xs text-[var(--text-muted)]">
                          No resume uploaded by this candidate
                        </p>
                      </div>
                    )}

                    {/* Status update */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <label className="text-sm text-[var(--text-secondary)]">
                        Update status:
                      </label>
                      <select
                        value={app.status}
                        disabled={updatingId === app._id}
                        onChange={e => updateStatus(app._id, e.target.value)}
                        className="input-field"
                        style={{ width: 'auto' }}
                      >
                        <option value="Applied">Applied</option>
                        <option value="Reviewed">Reviewed</option>
                        <option value="Selected">Selected</option>
                        <option value="Rejected">Rejected</option>
                      </select>

                      <button
                        onClick={() =>
                          openInterviewModal(app._id)
                        }
                        className="btn btn-primary btn-sm"
                      >
                        <Calendar size={14} /> Schedule Interview
                      </button>

                      {updatingId === app._id && (
                        <span className="text-xs text-[var(--text-muted)]">Saving...</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Interview Schedule Modal */}
      {showInterviewModal && (
        <div className="modal-overlay">
          <div className="modal">
            {/* Modal header */}
            <div className="modal-header">
              <div>
                <h2 className="modal-title">Schedule Interview</h2>
                <p className="text-xs text-[var(--text-muted)] mt-1">Candidate will be notified by email</p>
              </div>
              <button onClick={() => setShowInterviewModal(false)} className="modal-close">
                <X size={18} />
              </button>
            </div>

            {/* Modal body */}
            <div className="modal-body">
              {/* Date field */}
              <div className="input-group">
                <label className="input-label flex items-center gap-1.5">
                  <Calendar size={14} /> Interview date
                </label>
                <input
                  type="date"
                  className="input-field"
                  value={interviewData.date}
                  onChange={(e) => setInterviewData({ ...interviewData, date: e.target.value })}
                />
              </div>

              {/* Time field */}
              <div className="input-group">
                <label className="input-label flex items-center gap-1.5">
                  <Clock size={14} /> Interview time
                </label>
                <input
                  type="time"
                  className="input-field"
                  value={interviewData.time}
                  onChange={(e) => setInterviewData({ ...interviewData, time: e.target.value })}
                />
              </div>

              {/* Meeting link field */}
              <div className="input-group">
                <label className="input-label flex items-center gap-1.5">
                  <ExternalLink size={14} /> Meeting link
                </label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/abc-defg-hij"
                  className="input-field"
                  value={interviewData.meetingLink}
                  onChange={(e) => setInterviewData({ ...interviewData, meetingLink: e.target.value })}
                />
              </div>

              {/* Email notice */}
              <div className="toast toast-success">
                <Mail size={14} />
                An email with the date, time, and meeting link will be automatically sent to the candidate.
              </div>
            </div>

            {/* Modal footer */}
            <div className="modal-footer">
              <button
                onClick={() => setShowInterviewModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={scheduleInterview}
                disabled={!interviewData.date || !interviewData.time}
                className="btn btn-primary"
              >
                Schedule & notify candidate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


export default Applicants;