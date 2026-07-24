import { useEffect, useState } from "react";
import axios from "axios";
import {
  X,
  Check,
  Briefcase,
  Calendar,
  Clock,
  ExternalLink,
  Mail,
  Users,
  RefreshCw,
  XCircle,
} from "lucide-react";

const STATUS_CONFIG = {
  Scheduled:   { className: "status-scheduled" },
  Rescheduled: { className: "status-rescheduled" },
  Cancelled:   { className: "status-cancelled" },
  Completed:   { className: "status-completed" },
};

function Avatar({ name }) {
  const initials = name ? name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "?";
  return (
    <div className="avatar avatar-md">
      {initials}
    </div>
  );
}

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { className: "badge-neutral" };
  return (
    <span className={`badge ${config.className}`}>
      {status}
    </span>
  );
}

function RecruiterInterviews() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [filter, setFilter] = useState("All");
  const [formData, setFormData] = useState({ date: "", time: "", meetingLink: "" });

  useEffect(() => { fetchInterviews(); }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchInterviews = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/interview-management/recruiter`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInterviews(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const openReschedule = (interview) => {
    setSelectedInterview(interview);
    setFormData({ date: interview.date, time: interview.time, meetingLink: interview.meetingLink });
    setShowModal(true);
  };

  const rescheduleInterview = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/interview-management/reschedule/${selectedInterview._id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast("Interview rescheduled — candidate notified by email");
      setShowModal(false);
      fetchInterviews();
    } catch (error) {
      showToast("Failed to reschedule. Try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const cancelInterview = async (id) => {
    if (!window.confirm("Cancel this interview? The candidate will be notified.")) return;
    setCancellingId(id);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/interview-management/cancel/${id}`, {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast("Interview cancelled — candidate notified");
      fetchInterviews();
    } catch (error) {
      showToast("Failed to cancel. Try again.", "error");
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (d) => {
    if (!d) return "—";
    const date = new Date(d);
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  };

  const formatTime = (t) => {
    if (!t) return "—";
    const [h, m] = t.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    const h12 = hour % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  };

  const statuses = ["All", "Scheduled", "Rescheduled", "Cancelled", "Completed"];
  const filtered = filter === "All" ? interviews : interviews.filter(i => i.status === filter);

  const counts = statuses.reduce((acc, s) => {
    acc[s] = s === "All" ? interviews.length : interviews.filter(i => i.status === s).length;
    return acc;
  }, {});

  return (
    <div className="page-container">
      {/* Toast */}
      {toast && (
        <div className={`toast fixed top-6 right-6 z-[100] shadow-lg max-w-[360px] ${
          toast.type === "error" ? "toast-error" : "toast-success"
        }`}>
          {toast.type === "success" ? <Check size={16} /> : <XCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Interview Schedule</h1>
        <p className="page-subtitle">
          Manage and track all scheduled interviews
        </p>
      </div>

      {/* Stats row */}
      {!loading && interviews.length > 0 && (
        <div className="grid grid-cols-4 gap-3 mb-7">
          {[
            { label: "Total", count: interviews.length, Icon: Users },
            { label: "Scheduled", count: counts["Scheduled"], Icon: Check },
            { label: "Rescheduled", count: counts["Rescheduled"], Icon: RefreshCw },
            { label: "Cancelled", count: counts["Cancelled"], Icon: XCircle },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div>
                <p className="stat-card-value">{s.count}</p>
                <p className="stat-card-label">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter tabs */}
      {!loading && interviews.length > 0 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`badge cursor-pointer ${filter === s ? "badge-primary" : "badge-neutral"}`}
            >
              {s} {counts[s] > 0 && <span className="opacity-70 text-[11px]">({counts[s]})</span>}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton h-32 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <Calendar size={28} />
            </div>
            <p className="empty-state-title">
              {filter === "All" ? "No interviews scheduled yet" : `No ${filter.toLowerCase()} interviews`}
            </p>
            <p className="empty-state-text">Interviews you schedule will appear here</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((interview) => (
            <div key={interview._id} className="card card-interactive card-body">
              <div className="flex items-start gap-4 flex-wrap">
                <Avatar name={interview.candidate?.name} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-bold text-[16px]">{interview.candidate?.name}</p>
                    <StatusBadge status={interview.status} />
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] mb-3">{interview.candidate?.email}</p>

                  <div className="flex gap-5 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <Briefcase size={14} className="text-[var(--text-muted)]" />
                      <span className="text-sm text-[var(--text-secondary)]">{interview.job?.title}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-[var(--text-muted)]" />
                      <span className="text-sm text-[var(--text-secondary)]">{formatDate(interview.date)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-[var(--text-muted)]" />
                      <span className="text-sm text-[var(--text-secondary)]">{formatTime(interview.time)}</span>
                    </div>
                    {interview.meetingLink && (
                      <a
                        href={interview.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-sm text-[var(--primary)] hover:underline"
                      >
                        <ExternalLink size={14} /> Meeting link
                      </a>
                    )}
                  </div>
                </div>

                {interview.status !== "Cancelled" && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => openReschedule(interview)} className="btn btn-secondary btn-sm">
                      Reschedule
                    </button>
                    <button
                      onClick={() => cancelInterview(interview._id)}
                      disabled={cancellingId === interview._id}
                      className="btn btn-danger btn-sm"
                    >
                      {cancellingId === interview._id ? "Cancelling..." : "Cancel"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reschedule Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Reschedule Interview</h2>
              <button onClick={() => setShowModal(false)} className="modal-close">
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {selectedInterview && (
                <div className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] mb-5">
                  <p className="text-sm text-[var(--text-secondary)]">Rescheduling interview for</p>
                  <p className="font-bold mt-1">{selectedInterview.candidate?.name}</p>
                </div>
              )}

              <div className="input-group">
                <label className="input-label flex items-center gap-1.5">
                  <Calendar size={14} /> Date
                </label>
                <input
                  type="date"
                  className="input-field"
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label className="input-label flex items-center gap-1.5">
                  <Clock size={14} /> Time
                </label>
                <input
                  type="time"
                  className="input-field"
                  value={formData.time}
                  onChange={e => setFormData({ ...formData, time: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label className="input-label flex items-center gap-1.5">
                  <ExternalLink size={14} /> Meeting link
                </label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/..."
                  className="input-field"
                  value={formData.meetingLink}
                  onChange={e => setFormData({ ...formData, meetingLink: e.target.value })}
                />
              </div>

              <div className="toast toast-success mb-5">
                <Mail size={14} />
                The candidate will automatically receive an email notification with the updated schedule.
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setShowModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button
                onClick={rescheduleInterview}
                disabled={saving || !formData.date || !formData.time}
                className="btn btn-primary"
              >
                {saving ? "Saving..." : "Save new schedule"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecruiterInterviews;