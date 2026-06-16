import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

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

const TYPE_COLORS = {
  "Full-time":  { bg: "#0f1b2d", color: "#38bdf8", border: "#0369a1" },
  "Part-time":  { bg: "#1c1a09", color: "#facc15", border: "#854d0e" },
  "Contract":   { bg: "#1a0f1f", color: "#c084fc", border: "#7e22ce" },
  "Internship": { bg: "#0a1a1a", color: "#34d399", border: "#065f46" },
  "Remote":     { bg: "#1a0d0d", color: "#fb923c", border: "#9a3412" },
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
  const tc = TYPE_COLORS[job.jobType] || TYPE_COLORS["Full-time"];

  return (
    <Link to={`/jobs/${job._id}`}>
      <div
        className="rounded-2xl p-5 transition-all cursor-pointer"
        style={{ background: "#0d1117", border: "1px solid #1e2a4a" }}
        onMouseEnter={e => e.currentTarget.style.borderColor = "#6366f1"}
        onMouseLeave={e => e.currentTarget.style.borderColor = "#1e2a4a"}
      >
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)", color: "white" }}
            >
              {job.company?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-white text-base truncate">{job.title}</h2>
              <p className="text-sm mt-0.5" style={{ color: "#64748b" }}>{job.company}</p>
            </div>
          </div>
          <span className="text-xs flex-shrink-0" style={{ color: "#475569" }}>
            {timeAgo(job.createdAt)}
          </span>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span
            className="px-2.5 py-0.5 rounded-full text-xs font-medium"
            style={{ background: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }}
          >
            {job.jobType || "Full-time"}
          </span>
          <span className="text-xs flex items-center gap-1" style={{ color: "#64748b" }}>
            📍 {job.location}
          </span>
          {job.salary && (
            <span className="text-xs flex items-center gap-1" style={{ color: "#64748b" }}>
              💰 {job.salary}
            </span>
          )}
          {job.experienceLevel && (
            <span className="text-xs" style={{ color: "#475569" }}>
              · {job.experienceLevel}
            </span>
          )}
        </div>

        {/* Description preview */}
        <p className="text-sm mb-3 line-clamp-2" style={{ color: "#64748b" }}>
          {job.description}
        </p>

        {/* Skills */}
        {job.requiredSkills?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {job.requiredSkills.slice(0, 5).map((s, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-full text-xs font-medium"
                style={{ background: "#1e1b4b", color: "#a5b4fc", border: "1px solid #4f46e5" }}
              >
                {s}
              </span>
            ))}
            {job.requiredSkills.length > 5 && (
              <span className="text-xs px-1" style={{ color: "#475569" }}>
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

      const res = await axios.get("http://localhost:5000/api/jobs", { params });
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
    <div style={{ background: "#070b18", minHeight: "100vh", color: "white" }}>
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <h1 className="text-3xl font-bold mb-1">Find your next role</h1>
        <p className="mb-8" style={{ color: "#64748b" }}>
          {loading ? "Loading..." : `${jobs.length} ${jobs.length === 1 ? "position" : "positions"} available`}
        </p>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-5">
          <div
            className="flex-1 flex items-center gap-2 px-4 rounded-xl"
            style={{ background: "#0d1117", border: "1px solid #1e2a4a" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search by title, company, or skill…"
              className="w-full py-3 bg-transparent outline-none text-sm"
              style={{ color: "white" }}
            />
            {searchInput && (
              <button type="button" onClick={() => { setSearchInput(""); setSearch(""); }}
                style={{ color: "#64748b" }}>✕</button>
            )}
          </div>
          <button
            type="submit"
            className="px-5 py-3 rounded-xl text-sm font-semibold"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white" }}
          >
            Search
          </button>
        </form>

        {/* Filters */}
        <div className="space-y-3 mb-8">
          {/* Job type row */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-medium mr-1" style={{ color: "#475569" }}>Type:</span>
            {JOB_TYPES.map(t => (
              <button
                key={t}
                onClick={() => setJobType(t)}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{
                  background: jobType === t ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "#0d1117",
                  color:      jobType === t ? "white" : "#64748b",
                  border:     `1px solid ${jobType === t ? "#6366f1" : "#1e2a4a"}`,
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Experience level row */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-medium mr-1" style={{ color: "#475569" }}>Level:</span>
            {EXP_LEVELS.map(l => (
              <button
                key={l}
                onClick={() => setExpLevel(l)}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{
                  background: expLevel === l ? "#1e1b4b" : "#0d1117",
                  color:      expLevel === l ? "#a5b4fc" : "#64748b",
                  border:     `1px solid ${expLevel === l ? "#4f46e5" : "#1e2a4a"}`,
                }}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs font-medium"
              style={{ color: "#f87171" }}
            >
              ✕ Clear all filters
            </button>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-36 rounded-2xl animate-pulse" style={{ background: "#0d1117" }} />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20" style={{ color: "#64748b" }}>
            <p className="text-lg font-semibold text-white mb-2">No jobs found</p>
            <p className="text-sm mb-4">Try different search terms or filters</p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 rounded-xl text-sm font-medium"
                style={{ background: "#1e2a4a", color: "white" }}
              >
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
    </div>
  );
}

export default Jobs;