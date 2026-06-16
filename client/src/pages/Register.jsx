import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

// ─────────────────────────────────────────────────────────────
// Register Page
//
// Improvements vs old version:
//   1. alert() replaced with inline error messages
//   2. Password must be at least 6 characters (validated before API call)
//   3. Role selection uses visual cards instead of a <select> dropdown
//   4. Loading state on submit button
//   5. Redirect to correct dashboard after register based on role
//   6. Split layout with branding panel (matches Login page style)
// ─────────────────────────────────────────────────────────────

function InputField({ label, type, name, placeholder, value, onChange }) {
  return (
    <div className="mb-5">
      <label className="block text-sm font-medium mb-2" style={{ color: "#a5b4fc" }}>
        {label}
      </label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
        className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
        style={{ background: "#0f1629", border: "1px solid #1e2a4a", color: "white" }}
        onFocus={e => e.target.style.borderColor = "#6366f1"}
        onBlur={e  => e.target.style.borderColor = "#1e2a4a"}
      />
    </div>
  );
}

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
        "http://localhost:5000/api/auth/register",
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
        className="flex-1 p-4 rounded-xl text-left transition-all"
        style={{
          background:  isSelected ? "#1e1b4b" : "#0f1629",
          border:      `2px solid ${isSelected ? "#6366f1" : "#1e2a4a"}`,
          cursor:      "pointer",
        }}
      >
        <div className="text-xl mb-2">{icon}</div>
        <p className="font-semibold text-sm text-white mb-1">{title}</p>
        <p className="text-xs" style={{ color: "#64748b" }}>{description}</p>
      </button>
    );
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#070b18" }}>

      {/* ── Left Panel (branding) ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-1/2 p-14"
        style={{
          background:  "linear-gradient(135deg, #0d1117 0%, #0f1629 50%, #141832 100%)",
          borderRight: "1px solid #1e2a4a",
        }}
      >
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-bold"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white" }}
          >
            H
          </div>
          <span className="font-bold text-xl text-white">
            HireHub <span style={{ color: "#6366f1" }}>AI</span>
          </span>
        </div>

        {/* Stats */}
        <div>
          <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
            Join thousands of<br />professionals
          </h2>

          {/* Feature grid */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: "🎯", label: "Smart Matching",    desc: "AI matches your skills to jobs" },
              { icon: "📄", label: "Resume AI",         desc: "Get scored and improve your CV" },
              { icon: "🎤", label: "Interview Prep",    desc: "Practice with AI questions" },
              { icon: "💬", label: "Career Chat",       desc: "Get 24/7 AI career advice" },
            ].map((f, i) => (
              <div
                key={i}
                className="p-4 rounded-xl"
                style={{ background: "#0d1117", border: "1px solid #1e2a4a" }}
              >
                <div className="text-2xl mb-2">{f.icon}</div>
                <p className="font-semibold text-sm text-white">{f.label}</p>
                <p className="text-xs mt-1" style={{ color: "#64748b" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom note */}
        <p className="text-sm" style={{ color: "#475569" }}>
          Free forever for candidates. Post jobs as a recruiter.
        </p>
      </div>

      {/* ── Right Panel (register form) ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {/* Mobile brand */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white" }}
            >H</div>
            <span className="font-bold text-lg text-white">
              HireHub <span style={{ color: "#6366f1" }}>AI</span>
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-bold text-white mb-2">Create your account</h1>
          <p className="text-sm mb-8" style={{ color: "#64748b" }}>
            It's free. No credit card required.
          </p>

          {/* Inline error */}
          {error && (
            <div
              className="mb-5 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
              style={{ background: "#2a1a1a", border: "1px solid #991b1b", color: "#f87171" }}
            >
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Role Selection Cards — nicer than a dropdown */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3" style={{ color: "#a5b4fc" }}>
                I am a...
              </label>
              <div className="flex gap-3">
                <RoleCard
                  value="candidate"
                  icon="🧑‍💻"
                  title="Candidate"
                  description="Looking for a job"
                />
                <RoleCard
                  value="recruiter"
                  icon="🏢"
                  title="Recruiter"
                  description="Hiring talent"
                />
              </div>
            </div>

            <InputField
              label="Full name"
              type="text"
              name="name"
              placeholder="John Smith"
              value={formData.name}
              onChange={handleChange}
            />
            <InputField
              label="Email address"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
            />
            <InputField
              label="Password"
              type="password"
              name="password"
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={handleChange}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all mt-2"
              style={{
                background: loading ? "#3730a3" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color:      "white",
                opacity:    loading ? 0.8 : 1,
                cursor:     loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: "#1e2a4a" }} />
            <span className="text-xs" style={{ color: "#475569" }}>OR</span>
            <div className="flex-1 h-px" style={{ background: "#1e2a4a" }} />
          </div>

          <p className="text-center text-sm" style={{ color: "#64748b" }}>
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold"
              style={{ color: "#6366f1" }}
              onMouseEnter={e => e.target.style.color = "#818cf8"}
              onMouseLeave={e => e.target.style.color = "#6366f1"}
            >
              Sign in
            </Link>
          </p>

        </div>
      </div>

    </div>
  );
}

export default Register;