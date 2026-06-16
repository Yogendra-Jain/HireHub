import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship", "Remote"];
const EXP_LEVELS = ["Entry Level", "Mid Level", "Senior Level", "Lead", "Manager"];

function Label({ children }) {
  return <label className="block text-sm font-medium mb-1.5" style={{ color: "#94a3b8" }}>{children}</label>;
}

function Input({ ...props }) {
  return (
    <input {...props}
      className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
      style={{ background: "#13151c", border: "1px solid #1e2130", color: "white" }}
      onFocus={e => e.target.style.borderColor = "#22c55e"}
      onBlur={e => e.target.style.borderColor = "#1e2130"}
    />
  );
}

function SelectPill({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button key={opt} type="button" onClick={() => onChange(opt)}
          className="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
          style={{
            background: value === opt ? "#22c55e" : "#13151c",
            color: value === opt ? "#0f1117" : "#94a3b8",
            border: `1px solid ${value === opt ? "#22c55e" : "#1e2130"}`
          }}>
          {opt}
        </button>
      ))}
    </div>
  );
}

function ListInput({ items, onAddItem, onRemoveItem, placeholder }) {
  const [input, setInput] = useState("");

  const handleAdd = () => {
    if (input.trim()) {
      onAddItem(input);
      setInput("");
    }
  };

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === "Enter" && (e.preventDefault(), handleAdd())}
          placeholder={placeholder}
        />
        <button type="button" onClick={handleAdd}
          className="px-4 py-3 rounded-xl font-medium transition-all"
          style={{ background: "#22c55e", color: "#0f1117" }}>
          +
        </button>
      </div>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "#1a1f2e" }}>
            <span className="flex-1 text-sm" style={{ color: "#e2e8f0" }}>{item}</span>
            <button type="button" onClick={() => onRemoveItem(idx)}
              className="text-red-500 hover:text-red-400 text-sm">✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Toast({ message, type, onClose }) {
  if (!message) return null;
  return (
    <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg"
      style={{ background: type === "success" ? "#14532d" : "#7f1d1d", border: `1px solid ${type === "success" ? "#16a34a" : "#dc2626"}`, color: "white" }}>
      <span>{message}</span>
      <button onClick={onClose} style={{ color: "#94a3b8" }}>✕</button>
    </div>
  );
}

function CreateJob() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("form");
  const [toast, setToast] = useState({ message: "", type: "" });

  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    salary: "",
    description: "",
    jobType: "Full-time",
    experienceLevel: "Mid Level",
    responsibilities: [],
    requirements: [],
    benefits: [],
  });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 3500);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.company || !formData.description) {
      showToast("Please fill in title, company, and description", "error");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("http://localhost:5000/api/jobs/create", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast("Job posted successfully!");
      setTimeout(() => navigate(`/jobs/${res.data.job._id}`), 1500);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to create job", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "#0f1117", minHeight: "100vh", color: "white" }}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "" })} />

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Post a job</h1>
          <p className="text-sm" style={{ color: "#64748b" }}>
            AI will automatically extract key details. Fill in basics, we'll handle the rest.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-4 mb-6 border-b" style={{ borderColor: "#1e2130" }}>
          <button onClick={() => setActiveTab("form")}
            className="pb-3 px-4 font-medium transition-colors text-sm"
            style={{
              color: activeTab === "form" ? "#22c55e" : "#64748b",
              borderBottom: activeTab === "form" ? "2px solid #22c55e" : "none"
            }}>
            Job Details
          </button>
          <button onClick={() => setActiveTab("preview")}
            className="pb-3 px-4 font-medium transition-colors text-sm"
            style={{
              color: activeTab === "preview" ? "#22c55e" : "#64748b",
              borderBottom: activeTab === "preview" ? "2px solid #22c55e" : "none"
            }}>
            Preview
          </button>
        </div>

        {/* Form Tab */}
        {activeTab === "form" && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Row 1: Title, Company */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Job title *</Label>
                <Input name="title" placeholder="e.g. Senior React Developer" value={formData.title} onChange={handleChange} />
              </div>
              <div>
                <Label>Company *</Label>
                <Input name="company" placeholder="Company name" value={formData.company} onChange={handleChange} />
              </div>
            </div>

            {/* Row 2: Location, Salary */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Location *</Label>
                <Input name="location" placeholder="e.g. Remote, New York" value={formData.location} onChange={handleChange} />
              </div>
              <div>
                <Label>Salary / Compensation *</Label>
                <Input name="salary" placeholder="e.g. $80,000 – $120,000/yr" value={formData.salary} onChange={handleChange} />
              </div>
            </div>

            {/* Job type & Experience */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Job type</Label>
                <SelectPill options={JOB_TYPES} value={formData.jobType}
                  onChange={v => setFormData({ ...formData, jobType: v })} />
              </div>
              <div>
                <Label>Experience level</Label>
                <SelectPill options={EXP_LEVELS} value={formData.experienceLevel}
                  onChange={v => setFormData({ ...formData, experienceLevel: v })} />
              </div>
            </div>

            {/* Description */}
            <div>
              <Label>About the role *</Label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                placeholder="Describe the role, team, and impact. Be detailed — this helps with AI extraction."
                className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                style={{ background: "#13151c", border: "1px solid #1e2130", color: "white", lineHeight: "1.6" }}
                onFocus={e => e.target.style.borderColor = "#22c55e"}
                onBlur={e => e.target.style.borderColor = "#1e2130"}
              />
            </div>

            {/* Responsibilities */}
            <div>
              <Label>Key responsibilities (optional — AI will auto-extract)</Label>
              <ListInput
                items={formData.responsibilities}
                onAddItem={item => setFormData({ ...formData, responsibilities: [...formData.responsibilities, item] })}
                onRemoveItem={idx => setFormData({ ...formData, responsibilities: formData.responsibilities.filter((_, i) => i !== idx) })}
                placeholder="e.g. Build scalable React components"
              />
            </div>

            {/* Requirements */}
            <div>
              <Label>Required qualifications (optional — AI will auto-extract)</Label>
              <ListInput
                items={formData.requirements}
                onAddItem={item => setFormData({ ...formData, requirements: [...formData.requirements, item] })}
                onRemoveItem={idx => setFormData({ ...formData, requirements: formData.requirements.filter((_, i) => i !== idx) })}
                placeholder="e.g. 5+ years React experience"
              />
            </div>

            {/* Benefits */}
            <div>
              <Label>Benefits (optional — AI will auto-extract)</Label>
              <ListInput
                items={formData.benefits}
                onAddItem={item => setFormData({ ...formData, benefits: [...formData.benefits, item] })}
                onRemoveItem={idx => setFormData({ ...formData, benefits: formData.benefits.filter((_, i) => i !== idx) })}
                placeholder="e.g. Flexible work hours"
              />
            </div>

            {/* Info box */}
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl" style={{ background: "#0d1f0d", border: "1px solid #166534" }}>
              <svg className="flex-shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><path d="M12 2a10 10 0 100 20 10 10 0 000-20z" /><path d="M12 16v-4M12 8h.01" /></svg>
              <p className="text-xs" style={{ color: "#4ade80" }}>
                AI will extract responsibilities, requirements, and benefits from your description. You can also manually add them above. The preview shows how candidates will see your job.
              </p>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
              style={{ background: loading ? "#14532d" : "#22c55e", color: "#0f1117", opacity: loading ? 0.8 : 1 }}>
              {loading ? (
                <>
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity="0.25" /><path d="M21 12a9 9 0 00-9-9" /></svg>
                  AI is analyzing your job…
                </>
              ) : "Post job"}
            </button>
          </form>
        )}

        {/* Preview Tab */}
        {activeTab === "preview" && (
          <div>
            {!formData.title ? (
              <div className="text-center py-20" style={{ color: "#64748b" }}>
                <p>Fill in the job details to see a preview</p>
              </div>
            ) : (
              <JobPreview job={formData} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function JobPreview({ job }) {
  return (
    <div style={{ background: "#13151c", border: "1px solid #1e2130" }} className="rounded-xl p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">{job.title || "Job Title"}</h1>
        <p className="text-lg" style={{ color: "#94a3b8" }}>{job.company || "Company Name"}</p>

        {/* Meta */}
        <div className="flex flex-wrap gap-3 mt-4 text-sm">
          <span className="flex items-center gap-1" style={{ color: "#64748b" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
            {job.location || "Location"}
          </span>
          <span className="flex items-center gap-1" style={{ color: "#64748b" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
            {job.salary || "Salary"}
          </span>
          <span style={{ color: "#64748b" }}>{job.jobType}</span>
          <span style={{ color: "#64748b" }}>·</span>
          <span style={{ color: "#64748b" }}>{job.experienceLevel}</span>
        </div>
      </div>

      {/* About the role */}
      {job.description && (
        <div className="mb-6 pb-6" style={{ borderBottom: "1px solid #1e2130" }}>
          <h2 className="font-bold text-lg mb-3 text-white">About the role</h2>
          <p style={{ color: "#cbd5e1", whiteSpace: "pre-wrap", lineHeight: "1.6" }}>{job.description}</p>
        </div>
      )}

      {/* Responsibilities */}
      {job.responsibilities?.length > 0 && (
        <div className="mb-6 pb-6" style={{ borderBottom: "1px solid #1e2130" }}>
          <h2 className="font-bold text-lg mb-3 text-white">Key responsibilities</h2>
          <ul className="space-y-2">
            {job.responsibilities.map((item, idx) => (
              <li key={idx} className="flex gap-3" style={{ color: "#cbd5e1" }}>
                <span style={{ color: "#22c55e" }}>•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Requirements */}
      {job.requirements?.length > 0 && (
        <div className="mb-6 pb-6" style={{ borderBottom: "1px solid #1e2130" }}>
          <h2 className="font-bold text-lg mb-3 text-white">Qualifications</h2>
          <ul className="space-y-2">
            {job.requirements.map((item, idx) => (
              <li key={idx} className="flex gap-3" style={{ color: "#cbd5e1" }}>
                <span style={{ color: "#22c55e" }}>•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Benefits */}
      {job.benefits?.length > 0 && (
        <div className="mb-6 pb-6" style={{ borderBottom: "1px solid #1e2130" }}>
          <h2 className="font-bold text-lg mb-3 text-white">Benefits</h2>
          <ul className="space-y-2">
            {job.benefits.map((item, idx) => (
              <li key={idx} className="flex gap-3" style={{ color: "#cbd5e1" }}>
                <span style={{ color: "#22c55e" }}>•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Skills */}
      {job.requiredSkills?.length > 0 && (
        <div>
          <h2 className="font-bold text-lg mb-3 text-white">Required skills</h2>
          <div className="flex flex-wrap gap-2">
            {job.requiredSkills.map((skill, idx) => (
              <span key={idx} className="px-3 py-1 rounded-full text-xs font-medium"
                style={{ background: "#1a2f1a", color: "#4ade80", border: "1px solid #166534" }}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateJob;