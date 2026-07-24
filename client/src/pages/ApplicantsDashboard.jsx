import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  Sparkles,
  User,
  Mail,
  Users,
} from "lucide-react";

function ApplicantsDashboard() {
  const { jobId } = useParams();

  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplicants();
  }, []);

  const fetchApplicants = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/job-match/applicants-match/${jobId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setApplicants(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // ── Helper: score level class ──────────────────────────────
  const getScoreClass = (score) => {
    if (score >= 75) return "score-circle score-high";
    if (score >= 50) return "score-circle score-medium";
    return "score-circle score-low";
  };

  // ── Helper: status badge class ─────────────────────────────
  const getStatusBadgeClass = (status) => {
    const s = status?.toLowerCase();
    if (s === "applied")                         return "badge status-applied";
    if (s === "reviewing" || s === "reviewed")    return "badge status-reviewed";
    if (s === "accepted" || s === "selected")     return "badge status-selected";
    if (s === "rejected")                         return "badge status-rejected";
    if (s === "scheduled")                        return "badge status-scheduled";
    return "badge badge-warning";
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">AI Applicants Dashboard</h1>
          <p className="page-subtitle">Loading applicant data...</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="card">
              <div className="card-body">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="skeleton" style={{ width: "200px", height: "22px" }} />
                    <div className="skeleton mt-2" style={{ width: "160px", height: "16px" }} />
                  </div>
                  <div className="skeleton" style={{ width: "64px", height: "64px", borderRadius: "var(--radius-full)" }} />
                </div>
                <div className="skeleton mt-4" style={{ width: "100%", height: "14px" }} />
                <div className="skeleton mt-1" style={{ width: "80%", height: "14px" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <Sparkles size={28} style={{ color: "var(--primary)" }} />
          AI Applicants Dashboard
        </h1>
        <p className="page-subtitle">
          AI-powered candidate matching and recommendations
        </p>
      </div>

      {applicants.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Users size={32} />
          </div>
          <p className="empty-state-title">No applicants found</p>
          <p className="empty-state-text">
            There are no applicants for this job yet.
          </p>
        </div>
      ) : (
        applicants.map((applicant) => (
          <div key={applicant.applicationId} className="card mb-4">
            <div className="card-body">
              {/* Header: Name/Email + Score/Status */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="avatar avatar-lg flex-center" style={{ background: "var(--primary-50)", color: "var(--primary)" }}>
                    <User size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                      {applicant.name}
                    </h2>
                    <p className="flex items-center gap-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                      <Mail size={14} />
                      {applicant.email}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className={getScoreClass(applicant.matchScore)}>
                    {applicant.matchScore}%
                  </div>
                  <span className={getStatusBadgeClass(applicant.status)}>
                    {applicant.status}
                  </span>
                </div>
              </div>

              {/* Skills sections in a grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Matched Skills */}
                <div className="p-3 rounded-lg" style={{ background: "var(--success-light)" }}>
                  <h3 className="font-semibold text-sm mb-2 flex items-center gap-1" style={{ color: "var(--success)" }}>
                    <CheckCircle size={14} />
                    Matched Skills
                  </h3>
                  {applicant.matchedSkills?.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {applicant.matchedSkills.map((skill, index) => (
                        <span key={index} className="badge badge-success">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                      No matched skills found
                    </p>
                  )}
                </div>

                {/* Missing Skills */}
                <div className="p-3 rounded-lg" style={{ background: "var(--error-light)" }}>
                  <h3 className="font-semibold text-sm mb-2 flex items-center gap-1" style={{ color: "var(--error)" }}>
                    <XCircle size={14} />
                    Missing Skills
                  </h3>
                  {applicant.missingSkills?.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {applicant.missingSkills.map((skill, index) => (
                        <span key={index} className="badge badge-error">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                      No missing skills
                    </p>
                  )}
                </div>
              </div>

              {/* AI Recommendation */}
              <div className="divider" />
              <div className="pt-1">
                <h3 className="font-semibold text-sm mb-2 flex items-center gap-1" style={{ color: "var(--info)" }}>
                  <Sparkles size={14} />
                  AI Recommendation
                </h3>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {applicant.recommendation}
                </p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default ApplicantsDashboard;