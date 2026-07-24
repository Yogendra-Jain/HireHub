import { useEffect, useState } from "react";
import axios from "axios";
import {
  CheckCircle,
  RefreshCw,
  XCircle,
  Target,
  Hourglass,
  Timer,
  Calendar,
  Clock,
  Video,
  Inbox,
  Lightbulb,
  ExternalLink,
} from "lucide-react";

const STATUS_CONFIG = {
  Scheduled:   { className: "status-scheduled",   Icon: CheckCircle },
  Rescheduled: { className: "status-rescheduled", Icon: RefreshCw },
  Cancelled:   { className: "status-cancelled",   Icon: XCircle },
  Completed:   { className: "status-completed",   Icon: Target },
};

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { className: "badge-neutral", Icon: Hourglass };
  const { className, Icon } = config;
  return (
    <span className={`badge ${className}`}>
      <Icon size={12} /> {status}
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
  return (
    <span className="flex items-center gap-1 text-xs font-semibold text-[var(--warning)]">
      <Timer size={13} /> {countdown}
    </span>
  );
}

function MyInterviews() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => { fetchInterviews(); }, []);

  const fetchInterviews = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/interview-schedule/my-interviews`, {
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
    <div className="page-container-narrow">

      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">My Interviews</h1>
        <p className="page-subtitle">
          {interviews.length > 0
            ? `${upcoming.length} upcoming · ${interviews.length} total`
            : "Your scheduled interviews will appear here"}
        </p>
      </div>

      {/* Next interview spotlight */}
      {!loading && nextInterview && (
        <div
          className="card card-body mb-7"
          style={{ borderLeft: '3px solid var(--primary)' }}
        >
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--primary)] mb-3">
            Next interview
          </p>
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <p className="text-xl font-bold mb-1">{nextInterview.job?.title}</p>
              <p className="text-sm text-[var(--text-secondary)] mb-3">
                {formatDate(nextInterview.date)} · {formatTime(nextInterview.time)}
              </p>
              <CountdownTimer dateStr={nextInterview.date} timeStr={nextInterview.time} />
            </div>
            {nextInterview.meetingLink && (
              <a
                href={nextInterview.meetingLink}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary"
              >
                <Video size={16} /> Join interview
              </a>
            )}
          </div>
        </div>
      )}

      {/* Filter tabs */}
      {!loading && interviews.length > 0 && (
        <div className="flex gap-2 mb-5 flex-wrap">
          {statuses.map(s => {
            const count = s === "All" ? interviews.length : interviews.filter(i => i.status === s).length;
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`badge cursor-pointer ${filter === s ? "badge-primary" : "badge-neutral"}`}
              >
                {s} {count > 0 && <span className="opacity-70 text-[11px]">({count})</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* Interview list */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton h-36 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <Inbox size={28} />
            </div>
            <p className="empty-state-title">
              {filter === "All" ? "No interviews yet" : `No ${filter.toLowerCase()} interviews`}
            </p>
            <p className="empty-state-text">
              When a recruiter schedules an interview with you, it will appear here
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((interview) => {
            const isNext = isUpcoming(interview) && interview.status !== "Cancelled";
            return (
              <div
                key={interview._id}
                className="card card-body relative overflow-hidden"
                style={isNext ? { borderLeft: '3px solid var(--primary)' } : undefined}
              >
                <div className={isNext ? "pl-2" : ""}>
                  {/* Top row */}
                  <div className="flex items-start justify-between flex-wrap gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-bold text-[17px]">{interview.job?.title}</p>
                        <StatusBadge status={interview.status} />
                      </div>
                      {isNext && <CountdownTimer dateStr={interview.date} timeStr={interview.time} />}
                    </div>
                  </div>

                  {/* Details grid */}
                  <div className="flex flex-wrap gap-4 mb-4">
                    <div className="flex-1 min-w-[160px] p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]">
                      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)] mb-1">
                        <Calendar size={12} /> Date
                      </p>
                      <p className="text-sm font-semibold">{formatDate(interview.date)}</p>
                    </div>
                    <div className="flex-1 min-w-[120px] p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]">
                      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)] mb-1">
                        <Clock size={12} /> Time
                      </p>
                      <p className="text-sm font-semibold">{formatTime(interview.time)}</p>
                    </div>
                  </div>

                  {/* Tips / action row */}
                  {interview.status === "Cancelled" ? (
                    <div className="toast toast-error">
                      <XCircle size={16} />
                      This interview has been cancelled. Contact your recruiter for more information.
                    </div>
                  ) : interview.meetingLink ? (
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <p className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                        <Lightbulb size={13} /> Tip: Join 5–10 minutes early and test your camera/mic beforehand
                      </p>
                      <a
                        href={interview.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-primary btn-sm"
                      >
                        <ExternalLink size={14} /> Join interview
                      </a>
                    </div>
                  ) : (
                    <div className="toast toast-info">
                      <Clock size={16} />
                      Meeting link not added yet — check back closer to the interview date.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyInterviews;