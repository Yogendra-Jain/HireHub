import { Link, useNavigate, useLocation } from "react-router-dom";

// ─────────────────────────────────────────────────────────────
// Navbar — updated to use new indigo/violet color system
//
// Color changes from old green system:
//   - Active link:    #6366f1 (indigo)  was #22c55e (green)
//   - CTA button:     gradient indigo    was green
//   - Brand H:        gradient indigo    was green
//   - Profile circle: indigo border      was green border
// ─────────────────────────────────────────────────────────────

function Navbar() {
  const navigate  = useNavigate();
  const location  = useLocation(); // current URL path for active link detection

  const token       = localStorage.getItem("token");
  const user        = JSON.parse(localStorage.getItem("user"));
  const isLoggedIn  = !!token;
  const isRecruiter = user?.role === "recruiter";

  // Clear everything and go to login
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("resumeAnalysis");
    navigate("/login");
  };

  // Returns true if current URL exactly matches the path
  const isActive = (path) => location.pathname === path;

  // Link styles — indigo when active, gray when not
  const navLink = (path) => ({
    color:        isActive(path) ? "#818cf8" : "#64748b",
    fontWeight:   isActive(path) ? "600" : "400",
    fontSize:     "14px",
    borderBottom: isActive(path) ? "2px solid #6366f1" : "2px solid transparent",
    paddingBottom: "2px",
    transition:   "all 0.15s",
    textDecoration: "none",
  });

  return (
    <nav
      style={{
        background:   "#0d1117",
        borderBottom: "1px solid #1e2a4a",
        position:     "sticky",
        top:          0,
        zIndex:       50,
      }}
    >
      <div
        className="max-w-6xl mx-auto px-6 flex items-center justify-between"
        style={{ height: "60px" }}
      >

        {/* ── Brand ── */}
        <Link to="/" className="flex items-center gap-2.5" style={{ textDecoration: "none" }}>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
            style={{
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color:      "white",
            }}
          >
            H
          </div>
          <span className="font-bold text-base text-white">
            HireHub{" "}
            <span style={{ color: "#818cf8" }}>AI</span>
          </span>
        </Link>

        {/* ── Nav Links ── */}
        <div className="flex items-center gap-7">

          {/* Home — always visible */}
          <Link to="/" style={navLink("/")}
            onMouseEnter={e => !isActive("/")  && (e.target.style.color = "#94a3b8")}
            onMouseLeave={e => !isActive("/")  && (e.target.style.color = "#64748b")}>
            Home
          </Link>

          {/* ── Candidate links ── */}
          {isLoggedIn && !isRecruiter && (
            <>
              <Link to="/jobs" style={navLink("/jobs")}
                onMouseEnter={e => !isActive("/jobs") && (e.target.style.color = "#94a3b8")}
                onMouseLeave={e => !isActive("/jobs") && (e.target.style.color = "#64748b")}>
                Jobs
              </Link>
              <Link to="/my-applications" style={navLink("/my-applications")}
                onMouseEnter={e => !isActive("/my-applications") && (e.target.style.color = "#94a3b8")}
                onMouseLeave={e => !isActive("/my-applications") && (e.target.style.color = "#64748b")}>
                Applications
              </Link>

              <Link to="/my-interviews" style={navLink("/my-interviews")}
                onMouseEnter={e => !isActive("/my-interviews") && (e.target.style.color = "#94a3b8") }
                onMouseLeave={e => !isActive("/my-interviews") && (e.target.style.color = "#64748b")}>
                MyInterviews
              </Link>

              <Link to="/resume-analysis" style={navLink("/resume-analysis")}
                onMouseEnter={e => !isActive("/resume-analysis") && (e.target.style.color = "#94a3b8")}
                onMouseLeave={e => !isActive("/resume-analysis") && (e.target.style.color = "#64748b")}>
                Resume
              </Link>
              <Link to="/ai-chat" style={navLink("/ai-chat")}
                onMouseEnter={e => !isActive("/ai-chat") && (e.target.style.color = "#94a3b8")}
                onMouseLeave={e => !isActive("/ai-chat") && (e.target.style.color = "#64748b")}>
                AI Chat
              </Link>
            </>
          )}

          {/* ── Recruiter links ── */}
          {isLoggedIn && isRecruiter && (
            <>
              <Link to="/recruiter-dashboard" style={navLink("/recruiter-dashboard")}
                onMouseEnter={e => !isActive("/recruiter-dashboard") && (e.target.style.color = "#94a3b8")}
                onMouseLeave={e => !isActive("/recruiter-dashboard") && (e.target.style.color = "#64748b")}>
                My Jobs
              </Link>
              <Link to="/create-job" style={navLink("/create-job")}
                onMouseEnter={e => !isActive("/create-job") && (e.target.style.color = "#94a3b8")}
                onMouseLeave={e => !isActive("/create-job") && (e.target.style.color = "#64748b")}>
                Post Job
              </Link>

              <Link to="/recruiter-interviews" style={navLink("/recruiter-interviews")}
                onMouseEnter={e => !isActive("/recruiter-interviews") && (e.target.style.color = "#94a3b8")}
                onMouseLeave={e => !isActive("/recruiter-interviews") && (e.target.style.color = "#64748b")}>
                Interviews
              </Link>

              <Link to="/ai-chat" style={navLink("/ai-chat")}
                onMouseEnter={e => !isActive("/ai-chat") && (e.target.style.color = "#94a3b8")}
                onMouseLeave={e => !isActive("/ai-chat") && (e.target.style.color = "#64748b")}>
                AI Chat
              </Link>
            </>
          )}

          {/* ── Guest link ── */}
          {!isLoggedIn && (
            <Link to="/login" style={navLink("/login")}
              onMouseEnter={e => !isActive("/login") && (e.target.style.color = "#94a3b8")}
              onMouseLeave={e => !isActive("/login") && (e.target.style.color = "#64748b")}>
              Sign In
            </Link>
          )}
        </div>

        {/* ── Right side ── */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              {/* User avatar — click to go to profile */}
              <Link to="/profile" style={{ textDecoration: "none" }}>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all"
                  style={{
                    background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                    color:      "white",
                    cursor:     "pointer",
                  }}
                  title={`${user?.name} — ${user?.role}`}
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              </Link>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: "#1a1a2e",
                  color:      "#94a3b8",
                  border:     "1px solid #1e2a4a",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background   = "#2a1a1a";
                  e.currentTarget.style.color        = "#f87171";
                  e.currentTarget.style.borderColor  = "#991b1b";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background   = "#1a1a2e";
                  e.currentTarget.style.color        = "#94a3b8";
                  e.currentTarget.style.borderColor  = "#1e2a4a";
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/register"
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color:      "white",
              }}
            >
              Get Started
            </Link>
          )}
        </div>

      </div>
    </nav>
  );
}

export default Navbar;