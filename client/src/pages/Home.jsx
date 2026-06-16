import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

// ─────────────────────────────────────────────────────────────
// Home Page — Smart landing that detects login state
//
// BUG: The old Home.jsx was never changed — still showed
// "Get Started" and "Login" buttons even when logged in.
//
// FIX: Read token + user from localStorage on every render.
// - No token  → show public landing page
// - Candidate → show app home with recent jobs
// - Recruiter → show recruiter home with quick actions
// ─────────────────────────────────────────────────────────────

function Home() {
  const navigate    = useNavigate();
  const token       = localStorage.getItem("token");
  const user        = JSON.parse(localStorage.getItem("user"));
  const isLoggedIn  = !!token;
  const isRecruiter = user?.role === "recruiter";

  const [recentJobs,  setRecentJobs]  = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);

  useEffect(() => {
    // Only fetch jobs for logged-in candidates
    if (isLoggedIn && !isRecruiter) {
      fetchRecentJobs();
    }
  }, []);

  const fetchRecentJobs = async () => {
    setJobsLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/jobs");
      setRecentJobs(res.data.slice(0, 6)); // latest 6 jobs
    } catch (err) {
      console.error(err);
    } finally {
      setJobsLoading(false);
    }
  };

  // ── GUEST: Public Landing Page ─────────────────────────────
  if (!isLoggedIn) {
    return (
      <div style={{ background: "#070b18", minHeight: "100vh", color: "white" }}>

        {/* Hero */}
        <div className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">

          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-8"
            style={{ background: "#1e1b4b", color: "#a5b4fc", border: "1px solid #4f46e5" }}
          >
            ✦ AI-Powered Job Portal
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Find Your Dream Job<br />
            With{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              HireHub AI
            </span>
          </h1>

          <p className="text-lg mb-10 max-w-2xl mx-auto" style={{ color: "#64748b" }}>
            AI-powered resume analysis, smart job matching, and interview prep —
            all in one place. Built for candidates and recruiters.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/register"
              className="px-8 py-3 rounded-xl font-bold text-base"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white" }}
            >
              Get Started Free
            </Link>
            <Link
              to="/login"
              className="px-8 py-3 rounded-xl font-bold text-base"
              style={{ border: "1px solid #4f46e5", color: "#a5b4fc" }}
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="max-w-5xl mx-auto px-6 pb-24">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything you need to get hired
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: "📄",
                title: "AI Resume Analysis",
                desc: "Upload your resume and get instant AI feedback on your skills, score, and what to improve.",
                color: "#6366f1",
              },
              {
                icon: "🎯",
                title: "Smart Job Matching",
                desc: "See exactly how well your skills match any job with a percentage score and skill gap analysis.",
                color: "#8b5cf6",
              },
              {
                icon: "🎤",
                title: "Interview Prep",
                desc: "Practice with AI-generated questions specific to each job and get scored feedback on your answers.",
                color: "#a855f7",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl"
                style={{ background: "#0d1117", border: "1px solid #1e2a4a" }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-4"
                  style={{ background: "#1e1b4b" }}
                >
                  {f.icon}
                </div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-sm" style={{ color: "#64748b" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <div
          style={{ background: "#0d1117", borderTop: "1px solid #1e2a4a", borderBottom: "1px solid #1e2a4a" }}
          className="py-12"
        >
          <div className="max-w-3xl mx-auto px-6 grid grid-cols-3 gap-6 text-center">
            {[
              { value: "AI",     label: "Powered Matching" },
              { value: "100%",   label: "Free for Candidates" },
              { value: "Smart",  label: "Interview Prep" },
            ].map((s, i) => (
              <div key={i}>
                <p
                  className="text-4xl font-bold"
                  style={{
                    background: "linear-gradient(135deg, #6366f1, #a855f7)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {s.value}
                </p>
                <p className="text-sm mt-1" style={{ color: "#64748b" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-2xl mx-auto px-6 py-24 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="mb-8" style={{ color: "#64748b" }}>
            Join thousands of candidates and recruiters already using HireHub AI.
          </p>
          <Link
            to="/register"
            className="inline-block px-10 py-3 rounded-xl font-bold"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white" }}
          >
            Create Free Account
          </Link>
        </div>
      </div>
    );
  }

  // ── CANDIDATE: App Home ─────────────────────────────────────
  if (!isRecruiter) {
    return (
      <div style={{ background: "#070b18", minHeight: "100vh", color: "white" }}>
        <div className="max-w-5xl mx-auto px-6 py-10">

          {/* Welcome */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-1">
              Good to see you, {user?.name?.split(" ")[0]} 👋
            </h1>
            <p style={{ color: "#64748b" }}>Here's what's waiting for you today</p>
          </div>

          {/* Quick action cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
            {[
              { to: "/jobs",            emoji: "🔍", label: "Browse Jobs",      color: "#6366f1" },
              { to: "/my-applications", emoji: "📋", label: "My Applications",  color: "#8b5cf6" },
              { to: "/profile",         emoji: "📄", label: "My Resume",        color: "#a855f7" },
              { to: "/ai-chat",         emoji: "🤖", label: "AI Career Chat",   color: "#7c3aed" },
            ].map((item) => (
              <Link key={item.to} to={item.to}>
                <div
                  className="p-4 rounded-2xl text-center transition-all"
                  style={{ background: "#0d1117", border: "1px solid #1e2a4a" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = item.color}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "#1e2a4a"}
                >
                  <div className="text-2xl mb-2">{item.emoji}</div>
                  <p className="text-sm font-semibold">{item.label}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Recent Jobs */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Recent Job Openings</h2>
            <Link to="/jobs" className="text-sm font-medium" style={{ color: "#6366f1" }}>
              View all →
            </Link>
          </div>

          {jobsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: "#0d1117" }} />
              ))}
            </div>
          ) : recentJobs.length === 0 ? (
            <div
              className="text-center py-12 rounded-2xl"
              style={{ background: "#0d1117", border: "1px dashed #1e2a4a" }}
            >
              <p style={{ color: "#64748b" }}>No jobs posted yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentJobs.map(job => (
                <Link key={job._id} to={`/jobs/${job._id}`}>
                  <div
                    className="flex items-center justify-between p-5 rounded-2xl transition-all"
                    style={{ background: "#0d1117", border: "1px solid #1e2a4a" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "#4f46e5"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "#1e2a4a"}
                  >
                    <div className="flex items-center gap-4">
                      {/* Company initial */}
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                        style={{
                          background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                          color: "white",
                        }}
                      >
                        {job.company?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{job.title}</p>
                        <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>
                          {job.company} · {job.location}
                        </p>
                      </div>
                    </div>
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-medium hidden md:block"
                      style={{ background: "#1e1b4b", color: "#a5b4fc", border: "1px solid #4f46e5" }}
                    >
                      {job.jobType}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── RECRUITER: App Home ─────────────────────────────────────
  return (
    <div style={{ background: "#070b18", minHeight: "100vh", color: "white" }}>
      <div className="max-w-5xl mx-auto px-6 py-10">

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">
            Welcome back, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p style={{ color: "#64748b" }}>Manage your jobs and find the best talent</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { to: "/create-job",          emoji: "➕", label: "Post New Job",     desc: "Create a new listing",        color: "#6366f1" },
            { to: "/recruiter-dashboard", emoji: "📊", label: "My Jobs",          desc: "View all your postings",      color: "#8b5cf6" },
            { to: "/ai-chat",             emoji: "🤖", label: "AI Assistant",     desc: "Get help with job posts",     color: "#a855f7" },
          ].map((item) => (
            <Link key={item.to} to={item.to}>
              <div
                className="p-6 rounded-2xl transition-all"
                style={{ background: "#0d1117", border: "1px solid #1e2a4a" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = item.color}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#1e2a4a"}
              >
                <div className="text-2xl mb-3">{item.emoji}</div>
                <p className="font-bold mb-1">{item.label}</p>
                <p className="text-xs" style={{ color: "#64748b" }}>{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;