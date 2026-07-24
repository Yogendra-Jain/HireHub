import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  X,
  Plus,
  MapPin,
  DollarSign,
  Info,
  Loader2,
  CheckCircle2,
} from "lucide-react";

const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship", "Remote"];
const EXP_LEVELS = ["Entry Level", "Mid Level", "Senior Level", "Lead", "Manager"];

function SelectPill({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button key={opt} type="button" onClick={() => onChange(opt)}
          className={`badge cursor-pointer ${value === opt ? "badge-primary" : "badge-neutral"}`}>
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
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === "Enter" && (e.preventDefault(), handleAdd())}
          placeholder={placeholder}
          className="input-field"
        />
        <button type="button" onClick={handleAdd}
          className="btn btn-primary btn-icon flex-shrink-0">
          <Plus size={18} />
        </button>
      </div>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="tag tag-removable">
            <span className="flex-1 text-sm">{item}</span>
            <button type="button" onClick={() => onRemoveItem(idx)}
              className="tag-remove">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Toast({ message, type, onClose }) {
  if (!message) return null;
  return (
    <div className={`toast fixed top-5 right-5 z-50 ${type === "success" ? "toast-success" : "toast-error"}`}>
      {type === "success" ? <CheckCircle2 size={16} /> : <Info size={16} />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="tag-remove">
        <X size={16} />
      </button>
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
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/jobs/create`, formData, {
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
    <div className="page-container">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "" })} />

      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Post a Job</h1>
        <p className="page-subtitle">
          AI will automatically extract key details. Fill in basics, we'll handle the rest.
        </p>
      </div>

      {/* Tab switcher */}
      <div className="tabs mb-6">
        <button
          onClick={() => setActiveTab("form")}
          className={`tab ${activeTab === "form" ? "tab-active" : ""}`}
        >
          Job Details
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`tab ${activeTab === "preview" ? "tab-active" : ""}`}
        >
          Preview
        </button>
      </div>

      {/* Form Tab */}
      {activeTab === "form" && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: Title, Company */}
          <div className="grid grid-cols-2 gap-4">
            <div className="input-group">
              <label className="input-label">Job title *</label>
              <input name="title" placeholder="e.g. Senior React Developer" value={formData.title} onChange={handleChange} className="input-field" />
            </div>
            <div className="input-group">
              <label className="input-label">Company *</label>
              <input name="company" placeholder="Company name" value={formData.company} onChange={handleChange} className="input-field" />
            </div>
          </div>

          {/* Row 2: Location, Salary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="input-group">
              <label className="input-label">Location *</label>
              <input name="location" placeholder="e.g. Remote, New York" value={formData.location} onChange={handleChange} className="input-field" />
            </div>
            <div className="input-group">
              <label className="input-label">Salary / Compensation *</label>
              <input name="salary" placeholder="e.g. $80,000 – $120,000/yr" value={formData.salary} onChange={handleChange} className="input-field" />
            </div>
          </div>

          {/* Job type & Experience */}
          <div className="grid grid-cols-2 gap-4">
            <div className="input-group">
              <label className="input-label">Job type</label>
              <SelectPill options={JOB_TYPES} value={formData.jobType}
                onChange={v => setFormData({ ...formData, jobType: v })} />
            </div>
            <div className="input-group">
              <label className="input-label">Experience level</label>
              <SelectPill options={EXP_LEVELS} value={formData.experienceLevel}
                onChange={v => setFormData({ ...formData, experienceLevel: v })} />
            </div>
          </div>

          {/* Description */}
          <div className="input-group">
            <label className="input-label">About the role *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={6}
              placeholder="Describe the role, team, and impact. Be detailed — this helps with AI extraction."
              className="input-field"
            />
          </div>

          {/* Responsibilities */}
          <div className="input-group">
            <label className="input-label">Key responsibilities (optional — AI will auto-extract)</label>
            <ListInput
              items={formData.responsibilities}
              onAddItem={item => setFormData({ ...formData, responsibilities: [...formData.responsibilities, item] })}
              onRemoveItem={idx => setFormData({ ...formData, responsibilities: formData.responsibilities.filter((_, i) => i !== idx) })}
              placeholder="e.g. Build scalable React components"
            />
          </div>

          {/* Requirements */}
          <div className="input-group">
            <label className="input-label">Required qualifications (optional — AI will auto-extract)</label>
            <ListInput
              items={formData.requirements}
              onAddItem={item => setFormData({ ...formData, requirements: [...formData.requirements, item] })}
              onRemoveItem={idx => setFormData({ ...formData, requirements: formData.requirements.filter((_, i) => i !== idx) })}
              placeholder="e.g. 5+ years React experience"
            />
          </div>

          {/* Benefits */}
          <div className="input-group">
            <label className="input-label">Benefits (optional — AI will auto-extract)</label>
            <ListInput
              items={formData.benefits}
              onAddItem={item => setFormData({ ...formData, benefits: [...formData.benefits, item] })}
              onRemoveItem={idx => setFormData({ ...formData, benefits: formData.benefits.filter((_, i) => i !== idx) })}
              placeholder="e.g. Flexible work hours"
            />
          </div>

          {/* Info box */}
          <div className="toast toast-info">
            <Info size={16} className="flex-shrink-0" />
            <p className="text-xs">
              AI will extract responsibilities, requirements, and benefits from your description. You can also manually add them above. The preview shows how candidates will see your job.
            </p>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading}
            className="btn btn-primary btn-lg w-full">
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
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
            <div className="empty-state">
              <p className="empty-state-text">Fill in the job details to see a preview</p>
            </div>
          ) : (
            <JobPreview job={formData} />
          )}
        </div>
      )}
    </div>
  );
}

function JobPreview({ job }) {
  return (
    <div className="card max-w-2xl mx-auto">
      <div className="card-body">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">{job.title || "Job Title"}</h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>{job.company || "Company Name"}</p>

          {/* Meta */}
          <div className="flex flex-wrap gap-3 mt-4 text-sm" style={{ color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-1">
              <MapPin size={16} />
              {job.location || "Location"}
            </span>
            <span className="flex items-center gap-1">
              <DollarSign size={16} />
              {job.salary || "Salary"}
            </span>
            <span className="badge badge-neutral">{job.jobType}</span>
            <span className="badge badge-neutral">{job.experienceLevel}</span>
          </div>
        </div>

        {/* About the role */}
        {job.description && (
          <div className="mb-6 pb-6">
            <hr className="divider" />
            <h2 className="font-bold text-lg mb-3">About the role</h2>
            <p style={{ color: 'var(--text-secondary)', whiteSpace: "pre-wrap", lineHeight: "1.6" }}>{job.description}</p>
          </div>
        )}

        {/* Responsibilities */}
        {job.responsibilities?.length > 0 && (
          <div className="mb-6 pb-6">
            <hr className="divider" />
            <h2 className="font-bold text-lg mb-3">Key responsibilities</h2>
            <ul className="space-y-2">
              {job.responsibilities.map((item, idx) => (
                <li key={idx} className="flex gap-3" style={{ color: 'var(--text-secondary)' }}>
                  <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--primary)' }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Requirements */}
        {job.requirements?.length > 0 && (
          <div className="mb-6 pb-6">
            <hr className="divider" />
            <h2 className="font-bold text-lg mb-3">Qualifications</h2>
            <ul className="space-y-2">
              {job.requirements.map((item, idx) => (
                <li key={idx} className="flex gap-3" style={{ color: 'var(--text-secondary)' }}>
                  <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--primary)' }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Benefits */}
        {job.benefits?.length > 0 && (
          <div className="mb-6 pb-6">
            <hr className="divider" />
            <h2 className="font-bold text-lg mb-3">Benefits</h2>
            <ul className="space-y-2">
              {job.benefits.map((item, idx) => (
                <li key={idx} className="flex gap-3" style={{ color: 'var(--text-secondary)' }}>
                  <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--success)' }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Skills */}
        {job.requiredSkills?.length > 0 && (
          <div>
            <h2 className="font-bold text-lg mb-3">Required skills</h2>
            <div className="flex flex-wrap gap-2">
              {job.requiredSkills.map((skill, idx) => (
                <span key={idx} className="badge badge-primary">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CreateJob;