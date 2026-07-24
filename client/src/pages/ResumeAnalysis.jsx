import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  BookOpen,
  Star,
  Lightbulb,
  Check,
  FileSearch,
  ArrowRight,
  MessageSquare,
  RefreshCw,
} from "lucide-react";

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

// ── Score class — changes based on score value ────────────────
function getScoreClass(score) {
  if (score >= 70) return "score-high";
  if (score >= 40) return "score-medium";
  return "score-low";
}

// ── Section card component — reused for each section ──────────
function Section({ title, icon, children }) {
  return (
    <div className="card mb-5">
      <div className="card-body">
        <div className="flex items-center gap-2 mb-5">
          <span className="flex-center w-8 h-8 rounded-lg" style={{ background: 'var(--primary-50)', color: 'var(--primary)' }}>
            {icon}
          </span>
          <h2 className="text-lg font-bold">{title}</h2>
        </div>
        {children}
      </div>
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
      <div className="page-container-narrow flex items-center justify-center" style={{ minHeight: 'calc(100vh - var(--navbar-height))' }}>
        <div className="empty-state">
          <div className="empty-state-icon">
            <FileSearch size={28} />
          </div>
          <h2 className="empty-state-title">No analysis yet</h2>
          <p className="empty-state-text mb-6">
            Upload your resume and click "Analyze with AI" to get your resume score,
            skill analysis, and improvement tips.
          </p>
          <Link to="/profile" className="btn btn-primary">
            Go to Profile
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  const scoreClass = getScoreClass(analysis.score);

  // ── Score label based on value ─────────────────────────────
  const scoreLabel =
    analysis.score >= 80 ? "Excellent Resume" :
    analysis.score >= 60 ? "Good Resume"      :
    analysis.score >= 40 ? "Needs Improvement" :
    "Weak Resume — Let's fix this";

  return (
    <div className="page-container-narrow">

      {/* Page Header */}
      <div className="flex items-center justify-between page-header">
        <div>
          <h1 className="page-title">Resume Analysis</h1>
          <p className="page-subtitle">AI-powered feedback by Groq</p>
        </div>
        <button
          onClick={() => navigate("/profile")}
          className="btn btn-secondary"
        >
          <RefreshCw size={16} />
          Re-analyze
        </button>
      </div>

      {/* ── Score Card ── */}
      <div className="card mb-6" style={{ borderColor: 'var(--primary)' }}>
        <div className="card-body p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Resume Score</p>
              <p className="text-5xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {analysis.score}
                <span className="text-2xl" style={{ color: 'var(--text-muted)' }}>/100</span>
              </p>
              <p className={`text-sm mt-2 font-medium ${scoreClass === 'score-high' ? '' : scoreClass === 'score-medium' ? '' : ''}`}
                style={{ color: scoreClass === 'score-high' ? 'var(--success)' : scoreClass === 'score-medium' ? 'var(--warning)' : 'var(--error)' }}>
                {scoreLabel}
              </p>
            </div>

            {/* Circular score visual */}
            <div className={`score-circle ${scoreClass}`}>
              {analysis.score}%
            </div>
          </div>

          {/* Progress bar */}
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${analysis.score}%`,
                background: scoreClass === 'score-high' ? 'var(--success)' : scoreClass === 'score-medium' ? 'var(--warning)' : 'var(--error)',
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Skills Section ── */}
      {analysis.skills?.length > 0 && (
        <Section title="Skills Found" icon={<CheckCircle2 size={18} />}>
          <div className="flex flex-wrap gap-2">
            {analysis.skills.map((skill, i) => (
              <span key={i} className="badge badge-success">
                {skill}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* ── Missing Skills Section ── */}
      {analysis.missingSkills?.length > 0 && (
        <Section title="Skills to Learn" icon={<BookOpen size={18} />}>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
            Adding these skills could significantly improve your match scores:
          </p>
          <div className="flex flex-wrap gap-2">
            {analysis.missingSkills.map((skill, i) => (
              <span key={i} className="badge badge-warning">
                + {skill}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* ── Strengths Section ── */}
      {analysis.strengths?.length > 0 && (
        <Section title="Your Strengths" icon={<Star size={18} />}>
          <div className="space-y-3">
            {analysis.strengths.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg"
                style={{ background: 'var(--bg-secondary)' }}
              >
                <span className="flex-center w-5 h-5 rounded-full flex-shrink-0 mt-0.5"
                  style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
                  <Check size={12} />
                </span>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── Suggestions Section ── */}
      {analysis.suggestions?.length > 0 && (
        <Section title="How to Improve" icon={<Lightbulb size={18} />}>
          <div className="space-y-3">
            {analysis.suggestions.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg"
                style={{ background: 'var(--bg-secondary)' }}
              >
                <span className="flex-center w-6 h-6 rounded-full text-xs font-bold flex-shrink-0 mt-0.5"
                  style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}>
                  {i + 1}
                </span>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── Action Buttons ── */}
      <div className="grid grid-cols-2 gap-3 mt-8">
        <Link to="/jobs" className="btn btn-primary justify-center">
          <ArrowRight size={16} />
          Find Matching Jobs
        </Link>
        <Link to="/ai-chat" className="btn btn-secondary justify-center">
          <MessageSquare size={16} />
          Ask AI for Advice
        </Link>
      </div>

    </div>
  );
}

export default ResumeAnalysis;