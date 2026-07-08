import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

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

  if (loading) {
    return (
      <div className="p-10 text-white">
        Loading Applicants...
      </div>
    );
  }

  return (
    <div className="p-10 text-white min-h-screen bg-black">
      <h1 className="text-4xl font-bold text-green-400 mb-8">
        AI Applicants Dashboard
      </h1>

      {applicants.length === 0 ? (
        <p>No applicants found.</p>
      ) : (
        applicants.map((applicant) => (
          <div
            key={applicant.applicationId}
            className="bg-gray-900 p-6 rounded-lg mb-6 border border-gray-700"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">
                  {applicant.name}
                </h2>

                <p className="text-gray-400">
                  {applicant.email}
                </p>
              </div>

              <div className="text-right">
                <p className="text-4xl font-bold text-green-400">
                  {applicant.matchScore}%
                </p>

                <p className="text-yellow-400">
                  {applicant.status}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="font-bold text-green-400">
                Matched Skills
              </h3>

              {applicant.matchedSkills?.length > 0 ? (
                applicant.matchedSkills.map(
                  (skill, index) => (
                    <p key={index}>
                      ✅ {skill}
                    </p>
                  )
                )
              ) : (
                <p>No matched skills found</p>
              )}
            </div>

            <div className="mt-4">
              <h3 className="font-bold text-red-400">
                Missing Skills
              </h3>

              {applicant.missingSkills?.length > 0 ? (
                applicant.missingSkills.map(
                  (skill, index) => (
                    <p key={index}>
                      ❌ {skill}
                    </p>
                  )
                )
              ) : (
                <p>No missing skills</p>
              )}
            </div>

            <div className="mt-4">
              <h3 className="font-bold text-blue-400">
                AI Recommendation
              </h3>

              <p className="mt-2 text-gray-300">
                {applicant.recommendation}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default ApplicantsDashboard;