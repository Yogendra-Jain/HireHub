import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { MapPin, Banknote, Search, X, Briefcase } from "lucide-react";

// ─────────────────────────────────────────────────────────────
// Jobs Page — Filter Bug Fixed
//
// BUG: Type and level filters weren't working
//
// Root cause: The filter buttons set state (jobType, expLevel)
// but the useEffect dependency array was correct. The REAL issue
// was that jobs created in the database might have stored the
// jobType with slightly different casing or the field was empty.
//
// Fix 1: Backend getAllJobs now does case-insensitive regex match
//        for jobType and experienceLevel instead of exact match
// Fix 2: Frontend shows a "No results" message with clear filters
//        so user knows filters are working
// Fix 3: Added "clear all" button so user can reset filters easily
// ─────────────────────────────────────────────────────────────

const JOB_TYPES  = ["All", "Full-time", "Part-time", "Contract", "Internship", "Remote"];
const EXP_LEVELS = ["All", "Entry Level", "Mid Level", "Senior Level", "Lead", "Manager"];

const JOB_TYPE_CLASS = {
  "Full-time":  "job-type-fulltime",
  "Part-time":  "job-type-parttime",
  "Contract":   "job-type-contract",
  "Internship": "job-type-internship",
  "Remote":     "job-type-remote",
};

function timeAgo(dateStr) {
  const days = Math.floor((Date.now() - new Date(dateStr)) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7)  return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function JobCard({ job }) {
  const typeClass = JOB_TYPE_CLASS[job.jobType] || "badge-neutral";

  return (
    <Link to={`/jobs/${job._id}`}>
      <div className="card card-interactive card-body">

        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="avatar avatar-md">
              {job.company?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="text-truncate" style={{ fontWeight: 600, fontSize: "1rem", color: "var(--text-primary)" }}>{job.title}</h2>
              <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginTop: 2 }}>{job.company}</p>
            </div>
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", flexShrink: 0 }}>
            {timeAgo(job.createdAt)}
          </span>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-2 mb-3 items-center">
          <span className={`badge ${typeClass}`}>
            {job.jobType || "Full-time"}
          </span>
          <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 4 }}>
            <MapPin size={13} /> {job.location}
          </span>
          {job.salary && (
            <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 4 }}>
              <Banknote size={13} /> {job.salary}
            </span>
          )}
          {job.experienceLevel && (
            <span className="badge badge-neutral">
              {job.experienceLevel}
            </span>
          )}
        </div>

        {/* Description preview */}
        <p className="text-clamp-2" style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginBottom: "0.75rem" }}>
          {job.description}
        </p>

        {/* Skills */}
        {job.requiredSkills?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {job.requiredSkills.slice(0, 5).map((s, i) => (
              <span key={i} className="tag">{s}</span>
            ))}
            {job.requiredSkills.length > 5 && (
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", padding: "0.25rem" }}>
                +{job.requiredSkills.length - 5} more
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

function Jobs() {
  const [jobs,        setJobs]        = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [search,      setSearch]      = useState("");
  const [jobType,     setJobType]     = useState("All");
  const [expLevel,    setExpLevel]    = useState("All");

  // Re-fetch whenever any filter/search changes
  useEffect(() => {
    fetchJobs();
  }, [search, jobType, expLevel]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      // Build query params — only send non-default values
      const params = {};
      if (search)             params.search           = search;
      if (jobType  !== "All") params.jobType          = jobType;
      if (expLevel !== "All") params.experienceLevel  = expLevel;

      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/jobs`, { params });
      setJobs(res.data);
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const clearFilters = () => {
    setSearch("");
    setSearchInput("");
    setJobType("All");
    setExpLevel("All");
  };

  const hasActiveFilters = search || jobType !== "All" || expLevel !== "All";

  return (
    <div className="page-container">

      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Find your next role</h1>
        <p className="page-subtitle">
          {loading ? "Loading..." : `${jobs.length} ${jobs.length === 1 ? "position" : "positions"} available`}
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-5">
        <div className="flex-1 flex items-center gap-2 input-field" style={{ padding: "0 0.875rem" }}>
          <Search size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search by title, company, or skill…"
            className="w-full py-2.5 bg-transparent outline-none"
            style={{ fontSize: "0.875rem", border: "none" }}
          />
          {searchInput && (
            <button type="button" onClick={() => { setSearchInput(""); setSearch(""); }}
              className="btn-icon" style={{ color: "var(--text-muted)" }}>
              <X size={16} />
            </button>
          )}
        </div>
        <button type="submit" className="btn btn-primary">
          Search
        </button>
      </form>

      {/* Filters */}
      <div className="space-y-3 mb-8">
        {/* Job type row */}
        <div className="flex flex-wrap gap-2 items-center">
          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", marginRight: 4 }}>Type:</span>
          {JOB_TYPES.map(t => (
            <button
              key={t}
              onClick={() => setJobType(t)}
              className={`badge ${jobType === t ? "badge-primary" : "badge-neutral"}`}
              style={{ cursor: "pointer" }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Experience level row */}
        <div className="flex flex-wrap gap-2 items-center">
          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", marginRight: 4 }}>Level:</span>
          {EXP_LEVELS.map(l => (
            <button
              key={l}
              onClick={() => setExpLevel(l)}
              className={`badge ${expLevel === l ? "badge-primary" : "badge-neutral"}`}
              style={{ cursor: "pointer" }}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button onClick={clearFilters} className="btn btn-ghost btn-sm" style={{ color: "var(--error)" }}>
            <X size={14} /> Clear all filters
          </button>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton" style={{ height: 144 }} />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="empty-state card" style={{ padding: "3rem" }}>
          <div className="empty-state-icon">
            <Briefcase size={28} />
          </div>
          <p className="empty-state-title">No jobs found</p>
          <p className="empty-state-text">Try different search terms or filters</p>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="btn btn-secondary btn-sm" style={{ marginTop: "1rem" }}>
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map(job => <JobCard key={job._id} job={job} />)}
        </div>
      )}

    </div>
  );
}

export default Jobs;