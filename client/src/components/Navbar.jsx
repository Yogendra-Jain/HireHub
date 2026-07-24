import { Link, useNavigate, useLocation } from "react-router-dom";
import { Briefcase, LogOut, User, Shield } from "lucide-react";

function Navbar() {
  const navigate  = useNavigate();
  const location  = useLocation();

  const token       = localStorage.getItem("token");
  const user        = JSON.parse(localStorage.getItem("user"));
  const isLoggedIn  = !!token;
  const isRecruiter = user?.role === "recruiter";
  const isAdmin     = user?.role === "admin";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("resumeAnalysis");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-inner">

        {/* ── Brand ── */}
        <Link to="/" className="navbar-brand">
          <div className="navbar-brand-icon">
            <Briefcase size={18} />
          </div>
          <span className="navbar-brand-text">HireHub</span>
        </Link>

        {/* ── Nav Links ── */}
        <div className="navbar-links">

          <Link to="/" className={`nav-link ${isActive("/") ? "nav-link-active" : ""}`}>
            Home
          </Link>

          {/* Candidate links */}
          {isLoggedIn && !isRecruiter && !isAdmin && (
            <>
              <Link to="/jobs" className={`nav-link ${isActive("/jobs") ? "nav-link-active" : ""}`}>
                Jobs
              </Link>
              <Link to="/my-applications" className={`nav-link ${isActive("/my-applications") ? "nav-link-active" : ""}`}>
                Applications
              </Link>
              <Link to="/my-interviews" className={`nav-link ${isActive("/my-interviews") ? "nav-link-active" : ""}`}>
                Interviews
              </Link>
              <Link to="/resume-analysis" className={`nav-link ${isActive("/resume-analysis") ? "nav-link-active" : ""}`}>
                Resume
              </Link>
              <Link to="/ai-chat" className={`nav-link ${isActive("/ai-chat") ? "nav-link-active" : ""}`}>
                AI Chat
              </Link>
            </>
          )}

          {/* Recruiter links */}
          {isLoggedIn && isRecruiter && (
            <>
              <Link to="/recruiter-dashboard" className={`nav-link ${isActive("/recruiter-dashboard") ? "nav-link-active" : ""}`}>
                My Jobs
              </Link>
              <Link to="/create-job" className={`nav-link ${isActive("/create-job") ? "nav-link-active" : ""}`}>
                Post Job
              </Link>
              <Link to="/recruiter-interviews" className={`nav-link ${isActive("/recruiter-interviews") ? "nav-link-active" : ""}`}>
                Interviews
              </Link>
              <Link to="/ai-chat" className={`nav-link ${isActive("/ai-chat") ? "nav-link-active" : ""}`}>
                AI Chat
              </Link>
            </>
          )}

          {/* Admin link */}
          {isLoggedIn && isAdmin && (
            <Link to="/admin" className={`nav-link ${isActive("/admin") ? "nav-link-active" : ""}`}>
              <Shield size={14} style={{ marginRight: 4, display: "inline" }} />
              Admin
            </Link>
          )}

          {/* Guest */}
          {!isLoggedIn && (
            <Link to="/login" className={`nav-link ${isActive("/login") ? "nav-link-active" : ""}`}>
              Sign In
            </Link>
          )}
        </div>

        {/* ── Right side ── */}
        <div className="navbar-actions">
          {isLoggedIn ? (
            <>
              <Link to="/profile" title={`${user?.name} — ${user?.role}`}>
                <div className="avatar avatar-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              </Link>

              <button onClick={handleLogout} className="btn btn-ghost btn-sm">
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <Link to="/register" className="btn btn-primary btn-sm">
              Get Started
            </Link>
          )}
        </div>

      </div>
    </nav>
  );
}

export default Navbar;