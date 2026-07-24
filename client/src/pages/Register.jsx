import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { AlertCircle, UserRound, Building2, Briefcase } from "lucide-react";

// ─────────────────────────────────────────────────────────────
// Register Page
//
// Improvements vs old version:
//   1. alert() replaced with inline error messages
//   2. Password must be at least 6 characters (validated before API call)
//   3. Role selection uses visual cards instead of a <select> dropdown
//   4. Loading state on submit button
//   5. Redirect to correct dashboard after register based on role
//   6. Clean centered card layout matching Login page style
// ─────────────────────────────────────────────────────────────

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [role,     setRole]     = useState("candidate"); // "candidate" or "recruiter"
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // ── Client-side validation before hitting the API ──────
    if (!formData.name.trim()) {
      return setError("Name is required");
    }
    if (formData.password.length < 6) {
      return setError("Password must be at least 6 characters");
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/register`,
        { ...formData, role }
      );

      // Save auth data to localStorage
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user",  JSON.stringify(response.data.user));

      // Redirect based on role
      if (role === "recruiter") {
        navigate("/recruiter-dashboard");
      } else {
        navigate("/");
      }

    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Role card: visual selector for candidate vs recruiter ──
  const RoleCard = ({ value, title, description, icon }) => {
    const isSelected = role === value;
    return (
      <button
        type="button"
        onClick={() => setRole(value)}
        className="card flex-1 text-left"
        style={{
          padding: "1rem",
          border: `2px solid ${isSelected ? "var(--primary)" : "var(--border)"}`,
          background: isSelected ? "var(--primary-50)" : "var(--bg-card)",
          cursor: "pointer",
          transition: "all 0.15s ease",
        }}
      >
        <div style={{ color: isSelected ? "var(--primary)" : "var(--text-muted)", marginBottom: 8 }}>
          {icon}
        </div>
        <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text-primary)", marginBottom: 2 }}>{title}</p>
        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{description}</p>
      </button>
    );
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 480 }}>

        {/* Brand */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="navbar-brand-icon">
            <Briefcase size={18} />
          </div>
          <span className="navbar-brand-text">HireHub</span>
        </div>

        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">It's free. No credit card required.</p>

        {/* Inline error */}
        {error && (
          <div className="toast toast-error mb-5">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* Role Selection Cards */}
          <div className="input-group">
            <label className="input-label">I am a...</label>
            <div className="flex gap-3">
              <RoleCard
                value="candidate"
                icon={<UserRound size={22} />}
                title="Candidate"
                description="Looking for a job"
              />
              <RoleCard
                value="recruiter"
                icon={<Building2 size={22} />}
                title="Recruiter"
                description="Hiring talent"
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Full name</label>
            <input
              type="text"
              name="name"
              placeholder="John Smith"
              value={formData.name}
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>

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
              placeholder="At least 6 characters"
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
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1" style={{ height: 1, background: "var(--border)" }} />
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>OR</span>
          <div className="flex-1" style={{ height: 1, background: "var(--border)" }} />
        </div>

        <p className="text-center" style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--primary)", fontWeight: 600 }}>
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Register;