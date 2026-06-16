import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// ─────────────────────────────────────────────────────────────
// ResumeAnalysis Page
//
// What it shows:
//   1. Resume score (0-100) with animated progress bar
//   2. Skills identified — as colored chips
//   3. Missing skills — what to learn
//   4. Strengths — what the candidate is good at
//   5. Suggestions — how to improve the resume
//   6. Quick action buttons — browse jobs, re-analyze
//
// Data source: localStorage.getItem("resumeAnalysis")
// This was saved by Profile.jsx after calling Groq
// ─────────────────────────────────────────────────────────────

// ── Score color — changes based on score value ────────────────
// Good score = indigo, medium = amber, low = red
function getScoreColor(score) {
  if (score >= 70) return { color: "#818cf8", bg: "#1e1b4b", border: "#4f46e5" };
  if (score >= 40) return { color: "#fbbf24", bg: "#2a1f0a", border: "#d97706" };
  return            { color: "#f87171", bg: "#2a1a1a", border: "#991b1b" };
}

// ── Section card component — reused for each section ──────────
function Section({ title, icon, children, accentColor = "#4f46e5" }) {
  return (
    <div
      className="rounded-2xl p-6 mb-5"
      style={{ background: "#0d1117", border: "1px solid #1e2a4a" }}
    >
      <div className="flex items-center gap-2 mb-5">
        <span className="text-lg">{icon}</span>
        <h2 className="text-lg font-bold">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function ResumeAnalysis() {
  const navigate  = useNavigate();
  const [analysis, setAnalysis] = useState(null);

  // Read analysis from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("resumeAnalysis");
    if (saved) {
      setAnalysis(JSON.parse(saved));
    }
  }, []);

  // ── No analysis state ──────────────────────────────────────
  if (!analysis) {
    return (
      <div
        style={{ background: "#070b18", minHeight: "100vh", color: "white" }}
        className="flex items-center justify-center"
      >
        <div className="text-center max-w-sm px-6">
          {/* Icon */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "#1e1b4b" }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>

          <h2 className="text-2xl font-bold mb-2">No analysis yet</h2>
          <p className="text-sm mb-6" style={{ color: "#64748b" }}>
            Upload your resume and click "Analyze with AI" to get your resume score,
            skill analysis, and improvement tips.
          </p>
          <Link
            to="/profile"
            className="inline-block px-6 py-3 rounded-xl font-semibold text-sm"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white" }}
          >
            Go to Profile → Upload Resume
          </Link>
        </div>
      </div>
    );
  }

  const scoreStyle = getScoreColor(analysis.score);

  // ── Score label based on value ─────────────────────────────
  const scoreLabel =
    analysis.score >= 80 ? "Excellent Resume" :
    analysis.score >= 60 ? "Good Resume"      :
    analysis.score >= 40 ? "Needs Improvement" :
    "Weak Resume — Let's fix this";

  return (
    <div style={{ background: "#070b18", minHeight: "100vh", color: "white" }}>
      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Resume Analysis</h1>
            <p style={{ color: "#64748b" }}>AI-powered feedback by Groq</p>
          </div>
          <button
            onClick={() => navigate("/profile")}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{ background: "#1e2a4a", color: "#a5b4fc", border: "1px solid #4f46e5" }}
            onMouseEnter={e => e.currentTarget.style.background = "#1e1b4b"}
            onMouseLeave={e => e.currentTarget.style.background = "#1e2a4a"}
          >
            Re-analyze
          </button>
        </div>

        {/* ── Score Card ── */}
        <div
          className="rounded-2xl p-8 mb-6"
          style={{
            background: "linear-gradient(135deg, #0d1117 0%, #1e1b4b 100%)",
            border:     "1px solid #4f46e5",
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm mb-1" style={{ color: "#94a3b8" }}>Resume Score</p>
              <p
                className="text-6xl font-bold"
                style={{ color: scoreStyle.color }}
              >
                {analysis.score}
                <span className="text-2xl" style={{ color: "#64748b" }}>/100</span>
              </p>
              <p className="text-sm mt-2 font-medium" style={{ color: scoreStyle.color }}>
                {scoreLabel}
              </p>
            </div>

            {/* Circular score visual */}
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{
                background: scoreStyle.bg,
                border:     `3px solid ${scoreStyle.color}`,
              }}
            >
              <p className="text-2xl font-bold" style={{ color: scoreStyle.color }}>
                {analysis.score}%
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div
            className="h-2.5 rounded-full overflow-hidden"
            style={{ background: "#1e2a4a" }}
          >
            <div
              className="h-2.5 rounded-full"
              style={{
                width:      `${analysis.score}%`,
                background: `linear-gradient(90deg, #6366f1, #8b5cf6)`,
                transition: "width 1s ease",
              }}
            />
          </div>
        </div>

        {/* ── Skills Section ── */}
        {analysis.skills?.length > 0 && (
          <Section title="Skills Found" icon="✅">
            <div className="flex flex-wrap gap-2">
              {analysis.skills.map((skill, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-full text-sm font-medium"
                  style={{
                    background: "#1e1b4b",
                    color:      "#a5b4fc",
                    border:     "1px solid #4f46e5",
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* ── Missing Skills Section ── */}
        {analysis.missingSkills?.length > 0 && (
          <Section title="Skills to Learn" icon="📚">
            <p className="text-sm mb-4" style={{ color: "#64748b" }}>
              Adding these skills could significantly improve your match scores:
            </p>
            <div className="flex flex-wrap gap-2">
              {analysis.missingSkills.map((skill, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-full text-sm font-medium"
                  style={{
                    background: "#2a1a3a",
                    color:      "#c084fc",
                    border:     "1px solid #7c3aed",
                  }}
                >
                  + {skill}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* ── Strengths Section ── */}
        {analysis.strengths?.length > 0 && (
          <Section title="Your Strengths" icon="⭐">
            <div className="space-y-3">
              {analysis.strengths.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-xl"
                  style={{ background: "#0a1628" }}
                >
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5"
                    style={{ background: "#1e1b4b", color: "#818cf8" }}
                  >
                    ✓
                  </span>
                  <p className="text-sm" style={{ color: "#cbd5e1" }}>{item}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── Suggestions Section ── */}
        {analysis.suggestions?.length > 0 && (
          <Section title="How to Improve" icon="💡">
            <div className="space-y-3">
              {analysis.suggestions.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-xl"
                  style={{ background: "#0a1628" }}
                >
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                    style={{ background: "#2d1f3a", color: "#c084fc" }}
                  >
                    {i + 1}
                  </span>
                  <p className="text-sm" style={{ color: "#cbd5e1" }}>{item}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── Action Buttons ── */}
        <div className="grid grid-cols-2 gap-3 mt-8">
          <Link
            to="/jobs"
            className="py-3 rounded-xl font-semibold text-sm text-center transition-all"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white" }}
          >
            Find Matching Jobs
          </Link>
          <Link
            to="/ai-chat"
            className="py-3 rounded-xl font-semibold text-sm text-center transition-all"
            style={{ background: "#1e1b4b", color: "#a5b4fc", border: "1px solid #4f46e5" }}
          >
            Ask AI for Advice
          </Link>
        </div>

      </div>
    </div>
  );
}

export default ResumeAnalysis;