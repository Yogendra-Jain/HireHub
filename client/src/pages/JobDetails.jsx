import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import {
  MapPin,
  Banknote,
  CheckCircle2,
  XCircle,
  ArrowRight,
  BookOpen,
  Code,
  Users,
  Briefcase,
  Send,
  BarChart3,
  MessageSquare,
  Lightbulb,
  ThumbsUp,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// JobDetails Page
//
// BUG FIX #3: Responsibilities, requirements, benefits not showing
//
// Root cause: The old JobDetails displayed only:
//   job.title, job.company, job.location, job.salary, job.description
//   It never rendered job.responsibilities, job.requirements, job.benefits
//
// Fix: Added structured sections for all fields using a
// reusable BulletSection component.
// ─────────────────────────────────────────────────────────────

// Reusable bullet list section
function BulletSection({ title, items, icon: Icon }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mb-8">
      <h2 className="flex items-center gap-2 text-xl font-bold mb-4">
        {Icon && <Icon size={20} className="flex-shrink-0" style={{ color: "var(--primary)" }} />}
        {title}
      </h2>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <span
              className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
              style={{ background: "var(--primary)" }}
            />
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Helper: get job-type CSS class
function getJobTypeClass(jobType) {
  if (!jobType) return "badge badge-neutral";
  const normalized = jobType.toLowerCase().replace(/[\s-]/g, "");
  const map = {
    fulltime: "job-type-fulltime",
    parttime: "job-type-parttime",
    contract: "job-type-contract",
    internship: "job-type-internship",
    remote: "job-type-remote",
  };
  return `badge ${map[normalized] || "badge-neutral"}`;
}

// Helper: score level class
function getScoreClass(score) {
  if (score >= 70) return "score-high";
  if (score >= 40) return "score-medium";
  return "score-low";
}

function JobDetails() {
  const { id } = useParams();
  const user = JSON.parse(localStorage.getItem("user"));
  const isRecruiter = user?.role === "recruiter";

  const [job, setJob] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [matchData, setMatchData] = useState(null);
  const [interviewData, setInterviewData] = useState(null);
  const [selectedQ, setSelectedQ] = useState("");
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [matchLoading, setMatchLoading] = useState(false);
  const [interviewLoad, setInterviewLoad] = useState(false);
  const [applied, setApplied] = useState(false);
  const [applyMsg, setApplyMsg] = useState("");

  useEffect(() => {
    fetchJob();
  }, []);

  const fetchJob = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/jobs/${id}`);
      setJob(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/applications/apply/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setApplied(true);
      setApplyMsg(res.data.message);
      setTimeout(() => setApplyMsg(""), 3000);
    } catch (err) {
      setApplyMsg(err.response?.data?.message || "Failed to apply");
      setTimeout(() => setApplyMsg(""), 3000);
    }
  };

  const checkMatchScore = async () => {
    setMatchLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/job-match/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMatchData(res.data);
      setActiveTab("match");
    } catch (err) {
      console.error(err);
    } finally {
      setMatchLoading(false);
    }
  };

  const generateInterviewQuestions = async () => {
    setInterviewLoad(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/interview/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInterviewData(res.data);
      setActiveTab("interview");
    } catch (err) {
      console.error(err);
    } finally {
      setInterviewLoad(false);
    }
  };

  const evaluateAnswer = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/interview/evaluate`,
        { question: selectedQ, answer },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEvaluation(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading)
    return (
      <div className="page-container-narrow flex-center" style={{ minHeight: "60vh" }}>
        <p style={{ color: "var(--text-muted)" }}>Loading job...</p>
      </div>
    );

  if (!job)
    return (
      <div className="page-container-narrow flex-center" style={{ minHeight: "60vh" }}>
        <div className="empty-state">
          <div className="empty-state-icon">
            <Briefcase size={28} />
          </div>
          <p className="empty-state-title">Job not found</p>
          <p className="empty-state-text">
            This job may have been removed or the link is incorrect.
          </p>
        </div>
      </div>
    );

  const tabLabels = {
    overview: "Overview",
    match: "Match Score",
    interview: "Interview Prep",
  };

  return (
    <div className="page-container-narrow">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-start gap-4 mb-4">
          <div className="avatar avatar-lg">{job.company?.charAt(0).toUpperCase()}</div>
          <div>
            <h1 className="page-title">{job.title}</h1>
            <p className="page-subtitle">{job.company}</p>
          </div>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span className="flex items-center gap-1.5 text-sm" style={{ color: "var(--text-secondary)" }}>
            <MapPin size={15} />
            {job.location}
          </span>
          {job.salary && (
            <span className="flex items-center gap-1.5 text-sm" style={{ color: "var(--text-secondary)" }}>
              <Banknote size={15} />
              {job.salary}
            </span>
          )}
          <span className={getJobTypeClass(job.jobType)}>{job.jobType}</span>
          <span className="badge badge-info">{job.experienceLevel}</span>
        </div>

        {/* Action buttons — only for candidates */}
        {!isRecruiter && (
          <div className="flex flex-wrap gap-3 mb-4">
            <button onClick={handleApply} disabled={applied} className={`btn ${applied ? "btn-secondary" : "btn-accent btn-lg"}`}>
              {applied ? (
                <>
                  <CheckCircle2 size={16} />
                  Applied
                </>
              ) : (
                <>
                  <Send size={16} />
                  Apply Now
                </>
              )}
            </button>
            <button onClick={checkMatchScore} disabled={matchLoading} className="btn btn-secondary">
              <BarChart3 size={16} />
              {matchLoading ? "Checking..." : "Check Match"}
            </button>
            <button onClick={generateInterviewQuestions} disabled={interviewLoad} className="btn btn-secondary">
              <MessageSquare size={16} />
              {interviewLoad ? "Preparing..." : "Interview Prep"}
            </button>
          </div>
        )}

        {/* Apply message */}
        {applyMsg && (
          <div className={`toast ${applied ? "toast-success" : "toast-info"}`}>
            {applied ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            {applyMsg}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs mb-8">
        {["overview", "match", "interview"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`tab ${activeTab === tab ? "tab-active" : ""}`}
          >
            {tabLabels[tab]}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === "overview" && (
        <div>
          {/* About the role */}
          {job.description && (
            <div className="card mb-6">
              <div className="card-body">
                <h2 className="text-xl font-bold mb-4">About the role</h2>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)", whiteSpace: "pre-wrap" }}>
                  {job.description}
                </p>
              </div>
            </div>
          )}

          {/* FIX #3: These sections now render (were missing before) */}
          <div className="card mb-6">
            <div className="card-body">
              <BulletSection title="Key Responsibilities" items={job.responsibilities} icon={Briefcase} />
              <BulletSection title="Required Qualifications" items={job.requirements} icon={BookOpen} />
              <BulletSection title="Benefits" items={job.benefits} icon={ThumbsUp} />
            </div>
          </div>

          {/* Required Skills */}
          {job.requiredSkills?.length > 0 && (
            <div className="card mb-6">
              <div className="card-body">
                <h2 className="text-xl font-bold mb-4">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.requiredSkills.map((skill, i) => (
                    <span key={i} className="tag">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Posted by */}
          {job.recruiter && (
            <div className="card">
              <div className="card-body">
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Posted by{" "}
                  <span className="font-semibold" style={{ color: "var(--primary)" }}>
                    {job.recruiter.name}
                  </span>
                  {" · "}
                  {job.recruiter.email}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── MATCH SCORE TAB ── */}
      {activeTab === "match" && (
        <div>
          {!matchData ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-icon">
                  <BarChart3 size={28} />
                </div>
                <p className="empty-state-title">Check your match</p>
                <p className="empty-state-text mb-6">
                  Click the button below to see how well you match this job.
                </p>
                <button onClick={checkMatchScore} className="btn btn-primary btn-lg">
                  {matchLoading ? "Checking..." : "Check Match Score"}
                </button>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-body">
                <h2 className="text-xl font-bold mb-6">Your Match Score</h2>

                {/* Score circle */}
                <div className="flex items-center gap-6 mb-8">
                  <div className={`score-circle ${getScoreClass(matchData.matchScore)}`} style={{ width: "80px", height: "80px", fontSize: "1.5rem" }}>
                    {matchData.matchScore}%
                  </div>
                  <div>
                    <p className="font-bold text-lg mb-1" style={{ color: "var(--text-primary)" }}>
                      {matchData.recommendation}
                    </p>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      {matchData.aiInsight}
                    </p>
                  </div>
                </div>

                {/* Matched skills */}
                {matchData.matchedSkills?.length > 0 && (
                  <div className="mb-5">
                    <p className="font-semibold mb-2 text-sm flex items-center gap-1.5" style={{ color: "var(--success)" }}>
                      <CheckCircle2 size={15} />
                      Matched Skills
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {matchData.matchedSkills.map((s, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{ background: "var(--success-light)", color: "var(--success)" }}
                        >
                          <CheckCircle2 size={12} />
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing skills */}
                {matchData.missingSkills?.length > 0 && (
                  <div>
                    <p className="font-semibold mb-2 text-sm flex items-center gap-1.5" style={{ color: "var(--error)" }}>
                      <XCircle size={15} />
                      Missing Skills
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {matchData.missingSkills.map((s, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{ background: "var(--error-light)", color: "var(--error)" }}
                        >
                          <XCircle size={12} />
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── INTERVIEW PREP TAB ── */}
      {activeTab === "interview" && (
        <div>
          {!interviewData ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-icon">
                  <MessageSquare size={28} />
                </div>
                <p className="empty-state-title">Prepare for your interview</p>
                <p className="empty-state-text mb-6">
                  Generate AI-powered interview questions tailored to this role.
                </p>
                <button onClick={generateInterviewQuestions} className="btn btn-primary btn-lg">
                  {interviewLoad ? "Preparing..." : "Generate Questions"}
                </button>
              </div>
            </div>
          ) : (
            <div>
              {[
                { label: "Technical Questions", key: "technicalQuestions", icon: BookOpen },
                { label: "HR Questions", key: "hrQuestions", icon: Users },
                { label: "Coding Questions", key: "codingQuestions", icon: Code },
              ].map(
                (section) =>
                  interviewData[section.key]?.length > 0 && (
                    <div key={section.key} className="card mb-6">
                      <div className="card-body">
                        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                          <section.icon size={18} style={{ color: "var(--primary)" }} />
                          {section.label}
                        </h3>
                        <div className="space-y-2">
                          {interviewData[section.key].map((q, i) => (
                            <button
                              key={i}
                              onClick={() => setSelectedQ(q)}
                              className={`card-interactive w-full text-left px-4 py-3 rounded-lg text-sm ${
                                selectedQ === q ? "card" : ""
                              }`}
                              style={{
                                background: selectedQ === q ? "var(--primary-50)" : "var(--bg-secondary)",
                                border: `1px solid ${selectedQ === q ? "var(--primary)" : "var(--border)"}`,
                                color: "var(--text-primary)",
                              }}
                            >
                              {i + 1}. {q}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
              )}

              {selectedQ && (
                <div className="card mb-6">
                  <div className="card-body">
                    <h3 className="font-bold mb-3">Practice Answer</h3>
                    <div
                      className="text-sm mb-4 px-4 py-3 rounded-lg"
                      style={{
                        background: "var(--primary-50)",
                        color: "var(--primary)",
                        borderLeft: "3px solid var(--primary)",
                      }}
                    >
                      {selectedQ}
                    </div>
                    <textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Type your answer here..."
                      rows={5}
                      className="input-field mb-3"
                    />
                    <button onClick={evaluateAnswer} className="btn btn-primary">
                      <Sparkles size={16} />
                      Get AI Feedback
                    </button>
                  </div>
                </div>
              )}

              {evaluation && (
                <div className="card">
                  <div className="card-body">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Lightbulb size={18} style={{ color: "var(--primary)" }} />
                      AI Feedback
                    </h3>
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={`score-circle ${getScoreClass(evaluation.score * 10)}`}
                        style={{ width: "64px", height: "64px" }}
                      >
                        {evaluation.score}/10
                      </div>
                    </div>

                    {evaluation.strengths?.length > 0 && (
                      <div className="mb-4">
                        <p className="font-semibold text-sm mb-2 flex items-center gap-1.5" style={{ color: "var(--success)" }}>
                          <CheckCircle2 size={15} />
                          Strengths
                        </p>
                        {evaluation.strengths.map((s, i) => (
                          <p key={i} className="text-sm mb-1 flex items-start gap-2" style={{ color: "var(--text-secondary)" }}>
                            <CheckCircle2 size={14} className="flex-shrink-0 mt-0.5" style={{ color: "var(--success)" }} />
                            {s}
                          </p>
                        ))}
                      </div>
                    )}

                    {evaluation.weaknesses?.length > 0 && (
                      <div className="mb-4">
                        <p className="font-semibold text-sm mb-2 flex items-center gap-1.5" style={{ color: "var(--error)" }}>
                          <AlertTriangle size={15} />
                          Areas to Improve
                        </p>
                        {evaluation.weaknesses.map((w, i) => (
                          <p key={i} className="text-sm mb-1 flex items-start gap-2" style={{ color: "var(--text-secondary)" }}>
                            <ArrowRight size={14} className="flex-shrink-0 mt-0.5" style={{ color: "var(--error)" }} />
                            {w}
                          </p>
                        ))}
                      </div>
                    )}

                    {evaluation.improvedAnswer && (
                      <div>
                        <hr className="divider" />
                        <p className="font-semibold text-sm mb-2">Suggested Answer</p>
                        <p className="text-sm" style={{ color: "var(--text-secondary)", whiteSpace: "pre-wrap" }}>
                          {evaluation.improvedAnswer}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default JobDetails;