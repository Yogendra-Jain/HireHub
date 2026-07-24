import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Sparkles, FileSearch, Target, Mic, Search, ClipboardList,
  FileText, Bot, PlusCircle, BarChart3, ArrowRight, MapPin, Briefcase
} from "lucide-react";

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
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/jobs`);
      setRecentJobs(res.data.slice(0, 6)); // latest 6 jobs
    } catch (err) {
      console.error(err);
    } finally {
      setJobsLoading(false);
    }
  };

  const jobTypeClass = (type) => {
    const map = {
      "Full-time": "job-type-fulltime",
      "Part-time": "job-type-parttime",
      "Contract": "job-type-contract",
      "Internship": "job-type-internship",
      "Remote": "job-type-remote",
    };
    return map[type] || "badge-neutral";
  };

  // ── GUEST: Public Landing Page ─────────────────────────────
  if (!isLoggedIn) {
    return (
      <div>
        {/* Hero */}
        <div className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">

          <div className="badge badge-primary mb-6" style={{ fontSize: "0.8125rem", padding: "0.375rem 1rem" }}>
            <Sparkles size={14} />
            AI-Powered Job Portal
          </div>

          <h1 style={{ fontSize: "3rem", lineHeight: 1.15, marginBottom: "1.5rem" }}>
            Find Your Dream Job
            <br />
            With <span style={{ color: "var(--primary)" }}>HireHub</span>
          </h1>

          <p style={{ color: "var(--text-secondary)", fontSize: "1.125rem", maxWidth: 640, margin: "0 auto 2.5rem" }}>
            AI-powered resume analysis, smart job matching, and interview prep —
            all in one place. Built for candidates and recruiters.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/register" className="btn btn-accent btn-lg">
              Get Started Free
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">
              Sign In
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="max-w-5xl mx-auto px-6 pb-20">
          <h2 className="text-center" style={{ marginBottom: "2.5rem" }}>
            Everything you need to get hired
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: <FileSearch size={24} />,
                title: "AI Resume Analysis",
                desc: "Upload your resume and get instant AI feedback on your skills, score, and what to improve.",
              },
              {
                icon: <Target size={24} />,
                title: "Smart Job Matching",
                desc: "See exactly how well your skills match any job with a percentage score and skill gap analysis.",
              },
              {
                icon: <Mic size={24} />,
                title: "Interview Prep",
                desc: "Practice with AI-generated questions specific to each job and get scored feedback on your answers.",
              },
            ].map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-card-icon">
                  {f.icon}
                </div>
                <h3 className="feature-card-title">{f.title}</h3>
                <p className="feature-card-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ background: "var(--bg-card)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }} className="py-12">
          <div className="max-w-3xl mx-auto px-6 grid grid-cols-3 gap-6 text-center">
            {[
              { value: "AI",     label: "Powered Matching" },
              { value: "100%",   label: "Free for Candidates" },
              { value: "Smart",  label: "Interview Prep" },
            ].map((s, i) => (
              <div key={i}>
                <p style={{ fontSize: "2rem", fontWeight: 700, color: "var(--primary)", fontFamily: "var(--font-heading)" }}>
                  {s.value}
                </p>
                <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <h2 style={{ marginBottom: "1rem" }}>Ready to get started?</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
            Join thousands of candidates and recruiters already using HireHub.
          </p>
          <Link to="/register" className="btn btn-primary btn-lg">
            Create Free Account
          </Link>
        </div>
      </div>
    );
  }

  // ── CANDIDATE: App Home ─────────────────────────────────────
  if (!isRecruiter) {
    return (
      <div className="page-container">

        {/* Welcome */}
        <div className="page-header">
          <h1 className="page-title">
            Good to see you, {user?.name?.split(" ")[0]}
          </h1>
          <p className="page-subtitle">Here's what's waiting for you today</p>
        </div>

        {/* Quick action cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {[
            { to: "/jobs",            icon: <Search size={20} />,        label: "Browse Jobs",     desc: "Find opportunities" },
            { to: "/my-applications", icon: <ClipboardList size={20} />, label: "My Applications", desc: "Track your progress" },
            { to: "/profile",         icon: <FileText size={20} />,      label: "My Resume",       desc: "Update your profile" },
            { to: "/ai-chat",         icon: <Bot size={20} />,           label: "AI Career Chat",  desc: "Get AI advice" },
          ].map((item) => (
            <Link key={item.to} to={item.to} className="quick-action" style={{ flexDirection: "column", textAlign: "center", padding: "1.25rem" }}>
              <div className="quick-action-icon" style={{ margin: "0 auto 0.5rem" }}>
                {item.icon}
              </div>
              <span className="quick-action-label">{item.label}</span>
              <span className="quick-action-desc">{item.desc}</span>
            </Link>
          ))}
        </div>

        {/* Recent Jobs */}
        <div className="flex items-center justify-between mb-4">
          <h2>Recent Job Openings</h2>
          <Link to="/jobs" className="btn btn-ghost btn-sm" style={{ color: "var(--primary)" }}>
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {jobsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton" style={{ height: 80 }} />
            ))}
          </div>
        ) : recentJobs.length === 0 ? (
          <div className="empty-state card">
            <div className="empty-state-icon">
              <Briefcase size={28} />
            </div>
            <p className="empty-state-title">No jobs posted yet</p>
            <p className="empty-state-text">Check back soon for new opportunities</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentJobs.map(job => (
              <Link key={job._id} to={`/jobs/${job._id}`}>
                <div className="card card-interactive card-body-sm" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div className="flex items-center gap-4">
                    <div className="avatar avatar-md">
                      {job.company?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text-primary)" }}>{job.title}</p>
                      <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginTop: 2 }}>
                        <MapPin size={12} style={{ display: "inline", verticalAlign: "-1px", marginRight: 4 }} />
                        {job.company} · {job.location}
                      </p>
                    </div>
                  </div>
                  <span className={`badge ${jobTypeClass(job.jobType)} hidden md:inline-flex`}>
                    {job.jobType}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── RECRUITER: App Home ─────────────────────────────────────
  return (
    <div className="page-container">

      <div className="page-header">
        <h1 className="page-title">
          Welcome back, {user?.name?.split(" ")[0]}
        </h1>
        <p className="page-subtitle">Manage your jobs and find the best talent</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { to: "/create-job",          icon: <PlusCircle size={22} />, label: "Post New Job",  desc: "Create a new listing" },
          { to: "/recruiter-dashboard", icon: <BarChart3 size={22} />,  label: "My Jobs",       desc: "View all your postings" },
          { to: "/ai-chat",             icon: <Bot size={22} />,        label: "AI Assistant",  desc: "Get help with job posts" },
        ].map((item) => (
          <Link key={item.to} to={item.to} className="quick-action" style={{ flexDirection: "column", padding: "1.75rem" }}>
            <div className="quick-action-icon" style={{ width: 48, height: 48, marginBottom: "0.75rem" }}>
              {item.icon}
            </div>
            <span className="quick-action-label" style={{ fontSize: "1rem" }}>{item.label}</span>
            <span className="quick-action-desc" style={{ marginTop: "0.25rem" }}>{item.desc}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Home;