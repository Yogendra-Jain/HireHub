import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { AlertCircle, Briefcase } from "lucide-react";

// ─────────────────────────────────────────────────────────────
// Login Page — All bugs fixed
//
// Fix 1: After login, saves resume + resumeAnalysis to localStorage
//         so candidate doesn't re-upload resume after every login
// Fix 2: Navigates to "/" after login (old version used alert)
// Fix 3: Inline error message instead of alert()
// Fix 4: Loading state on button
// ─────────────────────────────────────────────────────────────

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        formData
      );

      // Save token
      localStorage.setItem("token", res.data.token);

      // Save full user object (now includes resume + resumeAnalysis from backend fix)
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // FIX: Also save resumeAnalysis to its own key so Profile and
      // ResumeAnalysis pages can read it without needing re-analysis
      if (res.data.user.resumeAnalysis) {
        localStorage.setItem("resumeAnalysis", JSON.stringify(res.data.user.resumeAnalysis));
      }

      // Navigate to home — no more alert()
      navigate("/");

    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* Brand */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="navbar-brand-icon">
            <Briefcase size={18} />
          </div>
          <span className="navbar-brand-text">HireHub</span>
        </div>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your account to continue</p>

        {/* Error */}
        {error && (
          <div className="toast toast-error mb-5">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Email address</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full mt-2"
            style={{ padding: "0.75rem" }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1" style={{ height: 1, background: "var(--border)" }} />
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>OR</span>
          <div className="flex-1" style={{ height: 1, background: "var(--border)" }} />
        </div>

        <p className="text-center" style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "var(--primary)", fontWeight: 600 }}>
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;