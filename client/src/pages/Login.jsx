import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

// ─────────────────────────────────────────────────────────────
// Login Page — All bugs fixed
//
// Fix 1: After login, saves resume + resumeAnalysis to localStorage
//         so candidate doesn't re-upload resume after every login
// Fix 2: Navigates to "/" after login (old version used alert)
// Fix 3: Inline error message instead of alert()
// Fix 4: Loading state on button
// ─────────────────────────────────────────────────────────────

function InputField({ label, type, name, placeholder, value, onChange }) {
  return (
    <div className="mb-5">
      <label className="block text-sm font-medium mb-2" style={{ color: "#a5b4fc" }}>
        {label}
      </label>
      <input
        type={type} name={name} placeholder={placeholder}
        value={value} onChange={onChange} required
        className="w-full px-4 py-3 rounded-xl text-sm outline-none"
        style={{ background: "#0f1629", border: "1px solid #1e2a4a", color: "white" }}
        onFocus={e => e.target.style.borderColor = "#6366f1"}
        onBlur={e  => e.target.style.borderColor = "#1e2a4a"}
      />
    </div>
  );
}

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
      const res = await axios.post("http://localhost:5000/api/auth/login", formData);

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
    <div className="min-h-screen flex" style={{ background: "#070b18" }}>

      {/* Left panel — branding */}
      <div
        className="hidden lg:flex flex-col justify-between w-1/2 p-14"
        style={{ background: "linear-gradient(135deg, #0d1117, #0f1629)", borderRight: "1px solid #1e2a4a" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white" }}>H</div>
          <span className="font-bold text-xl text-white">
            HireHub <span style={{ color: "#6366f1" }}>AI</span>
          </span>
        </div>

        <div>
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            Your career,<br />powered by AI
          </h2>
          <p className="text-base mb-10" style={{ color: "#64748b" }}>
            Smart job matching, resume analysis, and interview prep — all in one platform.
          </p>
          {[
            "AI-powered resume analysis & scoring",
            "Smart job matching with skill gap analysis",
            "Personalized interview preparation",
          ].map((text, i) => (
            <div key={i} className="flex items-center gap-3 mb-4">
              <span style={{ color: "#6366f1", fontSize: "10px" }}>✦</span>
              <span className="text-sm" style={{ color: "#94a3b8" }}>{text}</span>
            </div>
          ))}
        </div>

        <div className="p-5 rounded-2xl" style={{ background: "#0d1117", border: "1px solid #1e2a4a" }}>
          <p className="text-sm mb-3" style={{ color: "#94a3b8" }}>
            "HireHub AI helped me land my dream job in 3 weeks. The match score feature is incredible."
          </p>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: "#6366f1", color: "white" }}>R</div>
            <div>
              <p className="text-xs font-medium text-white">Rahul Sharma</p>
              <p className="text-xs" style={{ color: "#64748b" }}>Frontend Developer</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {/* Mobile brand */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white" }}>H</div>
            <span className="font-bold text-lg text-white">HireHub <span style={{ color: "#6366f1" }}>AI</span></span>
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-sm mb-8" style={{ color: "#64748b" }}>Sign in to your account to continue</p>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
              style={{ background: "#2a1a1a", border: "1px solid #991b1b", color: "#f87171" }}>
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <InputField label="Email address" type="email" name="email"
              placeholder="you@example.com" value={formData.email} onChange={handleChange} />
            <InputField label="Password" type="password" name="password"
              placeholder="Enter your password" value={formData.password} onChange={handleChange} />

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm mt-2"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "white", opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: "#1e2a4a" }} />
            <span className="text-xs" style={{ color: "#475569" }}>OR</span>
            <div className="flex-1 h-px" style={{ background: "#1e2a4a" }} />
          </div>

          <p className="text-center text-sm" style={{ color: "#64748b" }}>
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold" style={{ color: "#6366f1" }}>
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;