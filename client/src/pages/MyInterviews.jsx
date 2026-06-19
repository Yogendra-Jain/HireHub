import { useEffect, useState } from "react";
import axios from "axios";

const STATUS_STYLES = {
  Scheduled: { bg: "#0d2f1a", color: "#4ade80", border: "#166534", icon: "✅" },
  Rescheduled: { bg: "#0f1b2d", color: "#38bdf8", border: "#0369a1", icon: "🔄" },
  Cancelled: { bg: "#2a1a1a", color: "#f87171", border: "#991b1b", icon: "❌" },
  Completed: { bg: "#1e1b4b", color: "#a5b4fc", border: "#4f46e5", icon: "🎯" },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || { bg: "#1e2a4a", color: "#94a3b8", border: "#2a3a5a", icon: "⏳" };
  return (
    <span style={{
      padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap"
    }}>
      <span>{s.icon}</span> {status}
    </span>
  );
}

function CountdownTimer({ dateStr, timeStr }) {
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    if (!dateStr || !timeStr) return;
    const update = () => {
      const interviewDate = new Date(`${dateStr}T${timeStr}`);
      const now = new Date();
      const diff = interviewDate - now;
      if (diff <= 0) { setCountdown("Interview time passed"); return; }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      if (days > 0) setCountdown(`in ${days}d ${hours}h`);
      else if (hours > 0) setCountdown(`in ${hours}h ${mins}m`);
      else setCountdown(`in ${mins} minutes`);
    };
    update();
    const t = setInterval(update, 60000);
    return () => clearInterval(t);
  }, [dateStr, timeStr]);

  if (!countdown) return null;
  return <span style={{ fontSize: 12, color: "#fbbf24", fontWeight: 600 }}>⏰ {countdown}</span>;
}

function MyInterviews() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => { fetchInterviews(); }, []);

  const fetchInterviews = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/interview-schedule/my-interviews", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInterviews(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  };

  const formatTime = (t) => {
    if (!t) return "—";
    const [h, m] = t.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    const h12 = hour % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  };

  const isUpcoming = (interview) => {
    if (!interview.date || !interview.time) return false;
    return new Date(`${interview.date}T${interview.time}`) > new Date();
  };

  const statuses = ["All", "Scheduled", "Rescheduled", "Cancelled"];
  const filtered = filter === "All" ? interviews : interviews.filter(i => i.status === filter);

  const upcoming = interviews.filter(i => isUpcoming(i) && i.status !== "Cancelled");
  const nextInterview = upcoming[upcoming.length - 1] || upcoming[0];

  return (
    <div style={{ background: "#070b18", minHeight: "100vh", color: "white" }}>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "40px 24px" }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 6px", letterSpacing: "-0.5px" }}>
            My Interviews
          </h1>
          <p style={{ color: "#64748b", margin: 0, fontSize: 14 }}>
            {interviews.length > 0
              ? `${upcoming.length} upcoming · ${interviews.length} total`
              : "Your scheduled interviews will appear here"}
          </p>
        </div>

        {/* Next interview spotlight */}
        {!loading && nextInterview && (
          <div style={{
            background: "linear-gradient(135deg, #1e1b4b 0%, #0d2f1a 100%)",
            border: "1px solid #4f46e5", borderRadius: 16, padding: 24, marginBottom: 28
          }}>
            <p style={{ fontSize: 11, color: "#818cf8", fontWeight: 700, letterSpacing: "0.1em", margin: "0 0 12px", textTransform: "uppercase" }}>
              Next interview
            </p>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div>
                <p style={{ fontSize: 20, fontWeight: 800, margin: "0 0 4px" }}>{nextInterview.job?.title}</p>
                <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 14px" }}>
                  {formatDate(nextInterview.date)} · {formatTime(nextInterview.time)}
                </p>
                <CountdownTimer dateStr={nextInterview.date} timeStr={nextInterview.time} />
              </div>
              {nextInterview.meetingLink && (
                <a href={nextInterview.meetingLink} target="_blank" rel="noreferrer" style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "10px 20px", borderRadius: 10, fontSize: 14, fontWeight: 700,
                  background: "#4f46e5", color: "white", textDecoration: "none",
                  transition: "background 0.2s", flexShrink: 0
                }}>
                  🎥 Join interview
                </a>
              )}
            </div>
          </div>
        )}

        {/* Filter tabs */}
        {!loading && interviews.length > 0 && (
          <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
            {statuses.map(s => {
              const count = s === "All" ? interviews.length : interviews.filter(i => i.status === s).length;
              return (
                <button key={s} onClick={() => setFilter(s)} style={{
                  padding: "6px 14px", borderRadius: 999, fontSize: 13, fontWeight: 500,
                  cursor: "pointer", transition: "all 0.2s",
                  background: filter === s ? "#4f46e5" : "#0d1117",
                  color: filter === s ? "white" : "#64748b",
                  border: filter === s ? "1px solid #4f46e5" : "1px solid #1e2a4a"
                }}>
                  {s} {count > 0 && <span style={{ opacity: 0.7, fontSize: 11 }}>({count})</span>}
                </button>
              );
            })}
          </div>
        )}

        {/* Interview list */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: 140, borderRadius: 16, background: "#0d1117", opacity: 0.6 }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
            <p style={{ fontSize: 16, color: "white", fontWeight: 600, margin: "0 0 6px" }}>
              {filter === "All" ? "No interviews yet" : `No ${filter.toLowerCase()} interviews`}
            </p>
            <p style={{ fontSize: 13, color: "#475569", margin: 0 }}>
              When a recruiter schedules an interview with you, it'll appear here
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map((interview) => {
              const isNext = isUpcoming(interview) && interview.status !== "Cancelled";
              return (
                <div key={interview._id} style={{
                  background: "#0d1117", borderRadius: 16, padding: 20,
                  border: isNext ? "1px solid #312e81" : "1px solid #1e2a4a",
                  transition: "border-color 0.2s", position: "relative", overflow: "hidden"
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = isNext ? "#4f46e5" : "#2a3a6a"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = isNext ? "#312e81" : "#1e2a4a"}
                >
                  {/* Upcoming accent bar */}
                  {isNext && (
                    <div style={{
                      position: "absolute", left: 0, top: 0, bottom: 0, width: 4,
                      background: "linear-gradient(to bottom, #4f46e5, #7c3aed)"
                    }} />
                  )}

                  <div style={{ paddingLeft: isNext ? 12 : 0 }}>
                    {/* Top row */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                          <p style={{ fontWeight: 700, fontSize: 17, margin: 0 }}>{interview.job?.title}</p>
                          <StatusBadge status={interview.status} />
                        </div>
                        {isNext && <CountdownTimer dateStr={interview.date} timeStr={interview.time} />}
                      </div>
                    </div>

                    {/* Details grid */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 16 }}>
                      <div style={{
                        background: "#0a0e1a", border: "1px solid #1e2a4a",
                        borderRadius: 10, padding: "10px 14px", flex: "1 1 160px"
                      }}>
                        <p style={{ color: "#475569", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", margin: "0 0 4px" }}>📅 Date</p>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{formatDate(interview.date)}</p>
                      </div>
                      <div style={{
                        background: "#0a0e1a", border: "1px solid #1e2a4a",
                        borderRadius: 10, padding: "10px 14px", flex: "1 1 120px"
                      }}>
                        <p style={{ color: "#475569", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", margin: "0 0 4px" }}>🕐 Time</p>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{formatTime(interview.time)}</p>
                      </div>
                    </div>

                    {/* Tips / action row */}
                    {interview.status === "Cancelled" ? (
                      <div style={{ padding: "10px 14px", background: "#2a1a1a", border: "1px solid #991b1b", borderRadius: 10 }}>
                        <p style={{ margin: 0, fontSize: 13, color: "#f87171" }}>This interview has been cancelled. Contact your recruiter for more information.</p>
                      </div>
                    ) : interview.meetingLink ? (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                        <p style={{ margin: 0, fontSize: 12, color: "#475569" }}>
                          💡 Tip: Join 5–10 minutes early and test your camera/mic beforehand
                        </p>
                        <a href={interview.meetingLink} target="_blank" rel="noreferrer" style={{
                          display: "inline-flex", alignItems: "center", gap: 6,
                          padding: "8px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                          background: "#4f46e5", color: "white", textDecoration: "none", flexShrink: 0
                        }}>
                          🎥 Join interview
                        </a>
                      </div>
                    ) : (
                      <div style={{ padding: "10px 14px", background: "#1a1a2e", border: "1px solid #1e2a4a", borderRadius: 10 }}>
                        <p style={{ margin: 0, fontSize: 13, color: "#475569" }}>Meeting link not added yet — check back closer to the interview date.</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyInterviews;