import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

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
function BulletSection({ title, items, accentColor = "#6366f1" }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
              style={{ background: accentColor }} />
            <span className="text-sm" style={{ color: "#cbd5e1" }}>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function JobDetails() {
  const { id } = useParams();
  const user   = JSON.parse(localStorage.getItem("user"));
  const isRecruiter = user?.role === "recruiter";

  const [job,            setJob]            = useState(null);
  const [activeTab,      setActiveTab]      = useState("overview");
  const [matchData,      setMatchData]      = useState(null);
  const [interviewData,  setInterviewData]  = useState(null);
  const [selectedQ,      setSelectedQ]      = useState("");
  const [answer,         setAnswer]         = useState("");
  const [evaluation,     setEvaluation]     = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [matchLoading,   setMatchLoading]   = useState(false);
  const [interviewLoad,  setInterviewLoad]  = useState(false);
  const [applied,        setApplied]        = useState(false);
  const [applyMsg,       setApplyMsg]       = useState("");

  useEffect(() => { fetchJob(); }, []);

  const fetchJob = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/jobs/${id}`);
      setJob(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleApply = async () => {
    try {
      const token = localStorage.getItem("token");
      const res   = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/applications/apply/${id}`, {},
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
      const res   = await axios.get(`${import.meta.env.VITE_API_URL}/api/job-match/${id}`,
        { headers: { Authorization: `Bearer ${token}` } });
      setMatchData(res.data);
      setActiveTab("match");
    } catch (err) { console.error(err); }
    finally { setMatchLoading(false); }
  };

  const generateInterviewQuestions = async () => {
    setInterviewLoad(true);
    try {
      const token = localStorage.getItem("token");
      const res   = await axios.get(`${import.meta.env.VITE_API_URL}/api/interview/${id}`,
        { headers: { Authorization: `Bearer ${token}` } });
      setInterviewData(res.data);
      setActiveTab("interview");
    } catch (err) { console.error(err); }
    finally { setInterviewLoad(false); }
  };

  const evaluateAnswer = async () => {
    try {
      const token = localStorage.getItem("token");
      const res   = await axios.post(`${import.meta.env.VITE_API_URL}/api/interview/evaluate`,
        { question: selectedQ, answer },
        { headers: { Authorization: `Bearer ${token}` } });
      setEvaluation(res.data);
    } catch (err) { console.error(err); }
  };

  if (loading) return (
    <div style={{ background: "#070b18", minHeight: "100vh", color: "white",
      display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#64748b" }}>Loading job...</p>
    </div>
  );

  if (!job) return (
    <div style={{ background: "#070b18", minHeight: "100vh", color: "white",
      display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p>Job not found</p>
    </div>
  );

  return (
    <div style={{ background: "#070b18", minHeight: "100vh", color: "white" }}>
      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)", color: "white" }}>
              {job.company?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{job.title}</h1>
              <p className="text-lg mt-1" style={{ color: "#94a3b8" }}>{job.company}</p>
            </div>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-3 mb-5 text-sm">
            <span className="flex items-center gap-1" style={{ color: "#64748b" }}>📍 {job.location}</span>
            {job.salary && <span className="flex items-center gap-1" style={{ color: "#64748b" }}>💰 {job.salary}</span>}
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium"
              style={{ background: "#1e1b4b", color: "#a5b4fc", border: "1px solid #4f46e5" }}>
              {job.jobType}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium"
              style={{ background: "#0f1b2d", color: "#38bdf8", border: "1px solid #0369a1" }}>
              {job.experienceLevel}
            </span>
          </div>

          {/* Action buttons — only for candidates */}
          {!isRecruiter && (
            <div className="flex flex-wrap gap-3 mb-4">
              <button onClick={handleApply} disabled={applied}
                className="px-6 py-2.5 rounded-xl font-semibold text-sm"
                style={{ background: applied ? "#0d2f1a" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  color: applied ? "#4ade80" : "white", cursor: applied ? "not-allowed" : "pointer" }}>
                {applied ? "✓ Applied" : "Apply Now"}
              </button>
              <button onClick={checkMatchScore} disabled={matchLoading}
                className="px-5 py-2.5 rounded-xl font-semibold text-sm"
                style={{ background: "#1e1b4b", color: "#a5b4fc", border: "1px solid #4f46e5" }}>
                {matchLoading ? "Checking..." : "Check Match"}
              </button>
              <button onClick={generateInterviewQuestions} disabled={interviewLoad}
                className="px-5 py-2.5 rounded-xl font-semibold text-sm"
                style={{ background: "#2a1a3a", color: "#c084fc", border: "1px solid #7c3aed" }}>
                {interviewLoad ? "Preparing..." : "Interview Prep"}
              </button>
            </div>
          )}

          {/* Apply message */}
          {applyMsg && (
            <div className="px-4 py-2 rounded-xl text-sm inline-block"
              style={{ background: "#1a1f3a", color: "#a5b4fc", border: "1px solid #4f46e5" }}>
              {applyMsg}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-6 mb-8 border-b" style={{ borderColor: "#1e2a4a" }}>
          {["overview", "match", "interview"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="pb-3 px-1 font-medium text-sm capitalize transition-colors"
              style={{
                color:        activeTab === tab ? "#818cf8" : "#64748b",
                borderBottom: activeTab === tab ? "2px solid #6366f1" : "2px solid transparent",
              }}>
              {tab === "overview" ? "Overview" : tab === "match" ? "Match Score" : "Interview Prep"}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <div>

            {/* About the role */}
            {job.description && (
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">About the role</h2>
                <p style={{ color: "#cbd5e1", lineHeight: "1.7", whiteSpace: "pre-wrap" }}>
                  {job.description}
                </p>
              </div>
            )}

            {/* FIX #3: These sections now render (were missing before) */}
            <BulletSection
              title="Key Responsibilities"
              items={job.responsibilities}
              accentColor="#6366f1"
            />

            <BulletSection
              title="Required Qualifications"
              items={job.requirements}
              accentColor="#8b5cf6"
            />

            <BulletSection
              title="Benefits"
              items={job.benefits}
              accentColor="#a855f7"
            />

            {/* Required Skills */}
            {job.requiredSkills?.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.requiredSkills.map((skill, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-full text-sm font-medium"
                      style={{ background: "#1e1b4b", color: "#a5b4fc", border: "1px solid #4f46e5" }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Posted by */}
            {job.recruiter && (
              <div className="pt-6 border-t" style={{ borderColor: "#1e2a4a" }}>
                <p className="text-sm" style={{ color: "#475569" }}>
                  Posted by <span style={{ color: "#a5b4fc" }}>{job.recruiter.name}</span>
                  {" · "}{job.recruiter.email}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── MATCH SCORE TAB ── */}
        {activeTab === "match" && (
          <div>
            {!matchData ? (
              <div className="text-center py-16" style={{ color: "#64748b" }}>
                <p className="mb-4">Click "Check Match" to see how well you match this job</p>
                <button onClick={checkMatchScore}
                  className="px-6 py-3 rounded-xl font-semibold text-sm"
                  style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white" }}>
                  {matchLoading ? "Checking..." : "Check Match Score"}
                </button>
              </div>
            ) : (
              <div className="rounded-2xl p-8" style={{ background: "#0d1117", border: "1px solid #1e2a4a" }}>
                <h2 className="text-2xl font-bold mb-6">Your Match Score</h2>

                {/* Score circle */}
                <div className="flex items-center gap-8 mb-8">
                  <div className="w-32 h-32 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: "#1e1b4b",
                      border: `4px solid ${matchData.matchScore >= 70 ? "#6366f1" : matchData.matchScore >= 40 ? "#f59e0b" : "#ef4444"}`,
                    }}>
                    <div className="text-center">
                      <p className="text-4xl font-bold" style={{ color: "#818cf8" }}>
                        {matchData.matchScore}%
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-lg mb-1" style={{ color: "#a5b4fc" }}>
                      {matchData.recommendation}
                    </p>
                    <p className="text-sm" style={{ color: "#64748b" }}>{matchData.aiInsight}</p>
                  </div>
                </div>

                {/* Matched */}
                {matchData.matchedSkills?.length > 0 && (
                  <div className="mb-5">
                    <p className="font-semibold mb-2 text-sm">✓ Matched Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {matchData.matchedSkills.map((s, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{ background: "#0d2f1a", color: "#4ade80", border: "1px solid #166534" }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing */}
                {matchData.missingSkills?.length > 0 && (
                  <div>
                    <p className="font-semibold mb-2 text-sm">✗ Missing Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {matchData.missingSkills.map((s, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{ background: "#2a1a1a", color: "#f87171", border: "1px solid #991b1b" }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── INTERVIEW PREP TAB ── */}
        {activeTab === "interview" && (
          <div>
            {!interviewData ? (
              <div className="text-center py-16" style={{ color: "#64748b" }}>
                <p className="mb-4">Generate AI interview questions for this role</p>
                <button onClick={generateInterviewQuestions}
                  className="px-6 py-3 rounded-xl font-semibold text-sm"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", color: "white" }}>
                  {interviewLoad ? "Preparing..." : "Generate Questions"}
                </button>
              </div>
            ) : (
              <div>
                {[
                  { label: "Technical Questions",  key: "technicalQuestions", color: "#818cf8" },
                  { label: "HR Questions",          key: "hrQuestions",        color: "#c084fc" },
                  { label: "Coding Questions",      key: "codingQuestions",    color: "#fbbf24" },
                ].map(section => (
                  interviewData[section.key]?.length > 0 && (
                    <div key={section.key} className="mb-8">
                      <h3 className="text-lg font-bold mb-3" style={{ color: section.color }}>
                        {section.label}
                      </h3>
                      <div className="space-y-2">
                        {interviewData[section.key].map((q, i) => (
                          <button key={i} onClick={() => setSelectedQ(q)}
                            className="w-full text-left px-4 py-3 rounded-xl text-sm transition-all"
                            style={{
                              background: selectedQ === q ? "#1e1b4b" : "#0d1117",
                              border:     `1px solid ${selectedQ === q ? "#4f46e5" : "#1e2a4a"}`,
                              color:      selectedQ === q ? "#a5b4fc" : "#cbd5e1",
                            }}>
                            {i + 1}. {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                ))}

                {selectedQ && (
                  <div className="pt-6 border-t" style={{ borderColor: "#1e2a4a" }}>
                    <h3 className="font-bold mb-3">Practice Answer</h3>
                    <p className="text-sm mb-4 px-4 py-3 rounded-xl"
                      style={{ background: "#1e1b4b", color: "#a5b4fc", borderLeft: "3px solid #6366f1" }}>
                      {selectedQ}
                    </p>
                    <textarea value={answer} onChange={e => setAnswer(e.target.value)}
                      placeholder="Type your answer here..." rows={5}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none mb-3"
                      style={{ background: "#0d1117", border: "1px solid #1e2a4a", color: "white" }}
                      onFocus={e => e.target.style.borderColor = "#6366f1"}
                      onBlur={e  => e.target.style.borderColor = "#1e2a4a"}
                    />
                    <button onClick={evaluateAnswer}
                      className="px-5 py-2.5 rounded-xl font-semibold text-sm"
                      style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white" }}>
                      Get AI Feedback
                    </button>
                  </div>
                )}

                {evaluation && (
                  <div className="mt-6 rounded-2xl p-6"
                    style={{ background: "#0d1117", border: "1px solid #4f46e5" }}>
                    <h3 className="font-bold text-lg mb-4">AI Feedback</h3>
                    <p className="text-3xl font-bold mb-4" style={{ color: "#818cf8" }}>
                      {evaluation.score}/10
                    </p>
                    {evaluation.strengths?.length > 0 && (
                      <div className="mb-4">
                        <p className="font-semibold text-sm mb-2" style={{ color: "#4ade80" }}>Strengths</p>
                        {evaluation.strengths.map((s, i) => (
                          <p key={i} className="text-sm mb-1" style={{ color: "#cbd5e1" }}>✓ {s}</p>
                        ))}
                      </div>
                    )}
                    {evaluation.weaknesses?.length > 0 && (
                      <div className="mb-4">
                        <p className="font-semibold text-sm mb-2" style={{ color: "#f87171" }}>Improve</p>
                        {evaluation.weaknesses.map((w, i) => (
                          <p key={i} className="text-sm mb-1" style={{ color: "#cbd5e1" }}>→ {w}</p>
                        ))}
                      </div>
                    )}
                    {evaluation.improvedAnswer && (
                      <div>
                        <p className="font-semibold text-sm mb-2">Better Answer</p>
                        <p className="text-sm" style={{ color: "#94a3b8", whiteSpace: "pre-wrap" }}>
                          {evaluation.improvedAnswer}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default JobDetails;