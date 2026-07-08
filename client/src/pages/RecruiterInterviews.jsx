import { useEffect, useState } from "react";
import axios from "axios";

const STATUS_STYLES = {
  Scheduled: { bg: "#0d2f1a", color: "#4ade80", border: "#166534" },
  Rescheduled: { bg: "#0f1b2d", color: "#38bdf8", border: "#0369a1" },
  Cancelled: { bg: "#2a1a1a", color: "#f87171", border: "#991b1b" },
  Completed: { bg: "#1e1b4b", color: "#a5b4fc", border: "#4f46e5" },
};

function Avatar({ name }) {
  const initials = name ? name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "?";
  return (
    <div style={{
      width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
      background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 600, fontSize: 14, color: "white"
    }}>
      {initials}
    </div>
  );
}

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || { bg: "#1e2a4a", color: "#94a3b8", border: "#2a3a5a" };
  return (
    <span style={{
      padding: "3px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`, whiteSpace: "nowrap"
    }}>
      {status}
    </span>
  );
}

function Modal({ show, onClose, title, children }) {
  if (!show) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 50,
      background: "rgba(0,0,0,0.75)", display: "flex",
      alignItems: "center", justifyContent: "center", padding: 24
    }}>
      <div style={{
        background: "#0d1117", border: "1px solid #1e2a4a",
        borderRadius: 16, width: "100%", maxWidth: 480,
        boxShadow: "0 24px 64px rgba(0,0,0,0.5)"
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 24px", borderBottom: "1px solid #1e2a4a"
        }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "white" }}>{title}</h2>
          <button onClick={onClose} style={{
            background: "#1e2a4a", border: "none", borderRadius: 8,
            color: "#94a3b8", cursor: "pointer", padding: "6px 10px", fontSize: 18, lineHeight: 1
          }}>✕</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

function FormField({ label, icon, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 12, color: "#64748b", marginBottom: 6, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}>
        {icon} {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "10px 14px", borderRadius: 10,
  background: "#0a0e1a", border: "1px solid #1e2a4a", color: "white",
  fontSize: 14, outline: "none", boxSizing: "border-box",
  transition: "border-color 0.2s"
};

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
    <div style={{ background: "#070b18", minHeight: "100vh", color: "white" }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 24, right: 24, zIndex: 100,
          background: toast.type === "error" ? "#7f1d1d" : "#0d2f1a",
          border: `1px solid ${toast.type === "error" ? "#991b1b" : "#166534"}`,
          color: toast.type === "error" ? "#fca5a5" : "#4ade80",
          borderRadius: 12, padding: "12px 20px", fontSize: 14, fontWeight: 500,
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)", maxWidth: 360
        }}>
          {toast.type === "success" ? "✓" : "✕"} {toast.msg}
        </div>
      )}

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 6px", letterSpacing: "-0.5px" }}>
            Interview Schedule
          </h1>
          <p style={{ color: "#64748b", margin: 0, fontSize: 14 }}>
            Manage and track all scheduled interviews
          </p>
        </div>

        {/* Stats row */}
        {!loading && interviews.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28 }}>
            {[
              { label: "Total", count: interviews.length, color: "#a5b4fc" },
              { label: "Scheduled", count: counts["Scheduled"], color: "#4ade80" },
              { label: "Rescheduled", count: counts["Rescheduled"], color: "#38bdf8" },
              { label: "Cancelled", count: counts["Cancelled"], color: "#f87171" },
            ].map(s => (
              <div key={s.label} style={{
                background: "#0d1117", border: "1px solid #1e2a4a",
                borderRadius: 12, padding: "14px 16px"
              }}>
                <p style={{ color: s.color, fontSize: 24, fontWeight: 800, margin: "0 0 2px" }}>{s.count}</p>
                <p style={{ color: "#475569", fontSize: 12, margin: 0 }}>{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filter tabs */}
        {!loading && interviews.length > 0 && (
          <div style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
            {statuses.map(s => (
              <button key={s} onClick={() => setFilter(s)} style={{
                padding: "6px 14px", borderRadius: 999, fontSize: 13, fontWeight: 500,
                cursor: "pointer", transition: "all 0.2s",
                background: filter === s ? "#4f46e5" : "#0d1117",
                color: filter === s ? "white" : "#64748b",
                border: filter === s ? "1px solid #4f46e5" : "1px solid #1e2a4a"
              }}>
                {s} {counts[s] > 0 && <span style={{ opacity: 0.7, fontSize: 11 }}>({counts[s]})</span>}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: 120, borderRadius: 16, background: "#0d1117", animation: "pulse 1.5s ease-in-out infinite" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 0", color: "#475569" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📅</div>
            <p style={{ fontSize: 16, color: "white", fontWeight: 600, marginBottom: 6 }}>
              {filter === "All" ? "No interviews scheduled yet" : `No ${filter.toLowerCase()} interviews`}
            </p>
            <p style={{ fontSize: 13 }}>Interviews you schedule will appear here</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map((interview) => (
              <div key={interview._id} style={{
                background: "#0d1117", border: "1px solid #1e2a4a",
                borderRadius: 16, padding: 20, transition: "border-color 0.2s"
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#4f46e5"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#1e2a4a"}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
                  <Avatar name={interview.candidate?.name} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                      <p style={{ fontWeight: 700, fontSize: 16, margin: 0 }}>{interview.candidate?.name}</p>
                      <StatusBadge status={interview.status} />
                    </div>
                    <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 12px" }}>{interview.candidate?.email}</p>

                    <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 16 }}>💼</span>
                        <span style={{ fontSize: 13, color: "#94a3b8" }}>{interview.job?.title}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 16 }}>📅</span>
                        <span style={{ fontSize: 13, color: "#94a3b8" }}>{formatDate(interview.date)}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 16 }}>🕐</span>
                        <span style={{ fontSize: 13, color: "#94a3b8" }}>{formatTime(interview.time)}</span>
                      </div>
                      {interview.meetingLink && (
                        <a href={interview.meetingLink} target="_blank" rel="noreferrer" style={{
                          display: "flex", alignItems: "center", gap: 6,
                          fontSize: 13, color: "#818cf8", textDecoration: "none"
                        }}>
                          <span style={{ fontSize: 16 }}>🔗</span> Meeting link
                        </a>
                      )}
                    </div>
                  </div>

                  {interview.status !== "Cancelled" && (
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      <button onClick={() => openReschedule(interview)} style={{
                        padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                        cursor: "pointer", background: "#1e1b4b", color: "#a5b4fc",
                        border: "1px solid #4f46e5", transition: "all 0.2s"
                      }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#312e81"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "#1e1b4b"; }}
                      >
                        Reschedule
                      </button>
                      <button
                        onClick={() => cancelInterview(interview._id)}
                        disabled={cancellingId === interview._id}
                        style={{
                          padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                          cursor: "pointer", background: "#2a1a1a", color: "#f87171",
                          border: "1px solid #991b1b", transition: "all 0.2s",
                          opacity: cancellingId === interview._id ? 0.5 : 1
                        }}
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
      </div>

      {/* Reschedule Modal */}
      <Modal show={showModal} onClose={() => setShowModal(false)} title="Reschedule Interview">
        {selectedInterview && (
          <div style={{ marginBottom: 20, padding: "12px 14px", background: "#0a0e1a", borderRadius: 10, border: "1px solid #1e2a4a" }}>
            <p style={{ margin: 0, fontSize: 13, color: "#94a3b8" }}>Rescheduling interview for</p>
            <p style={{ margin: "4px 0 0", fontWeight: 700 }}>{selectedInterview.candidate?.name}</p>
          </div>
        )}

        <FormField label="Date" icon="📅">
          <input
            type="date" style={inputStyle}
            value={formData.date}
            onChange={e => setFormData({ ...formData, date: e.target.value })}
          />
        </FormField>

        <FormField label="Time" icon="🕐">
          <input
            type="time" style={inputStyle}
            value={formData.time}
            onChange={e => setFormData({ ...formData, time: e.target.value })}
          />
        </FormField>

        <FormField label="Meeting link" icon="🔗">
          <input
            type="url" placeholder="https://meet.google.com/..." style={inputStyle}
            value={formData.meetingLink}
            onChange={e => setFormData({ ...formData, meetingLink: e.target.value })}
          />
        </FormField>

        <div style={{ padding: "12px 14px", background: "#0d2f1a", border: "1px solid #166534", borderRadius: 10, marginBottom: 20 }}>
          <p style={{ margin: 0, fontSize: 12, color: "#4ade80" }}>
            📧 The candidate will automatically receive an email notification with the updated schedule.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={rescheduleInterview}
            disabled={saving || !formData.date || !formData.time}
            style={{
              flex: 1, padding: "11px 0", borderRadius: 10, fontSize: 14, fontWeight: 700,
              cursor: saving ? "wait" : "pointer",
              background: saving ? "#312e81" : "#4f46e5", color: "white", border: "none",
              opacity: !formData.date || !formData.time ? 0.5 : 1, transition: "all 0.2s"
            }}
          >
            {saving ? "Saving..." : "Save new schedule"}
          </button>
          <button onClick={() => setShowModal(false)} style={{
            padding: "11px 20px", borderRadius: 10, fontSize: 14, fontWeight: 600,
            cursor: "pointer", background: "#1e2a4a", color: "#94a3b8", border: "none"
          }}>
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default RecruiterInterviews;