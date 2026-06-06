import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function JobDetails() {
  const { id } = useParams();

  const [job, setJob] = useState(null);
  const [matchData, setMatchData] = useState(null);
  const [interviewData, setInterviewData] = useState(null);

  useEffect(() => {
    fetchJob();
  }, []);

  const fetchJob = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/jobs/${id}`
      );

      setJob(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleApply = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `http://localhost:5000/api/applications/apply/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(response.data.message);
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
        "Failed to apply"
      );
    }
  };

  const checkMatchScore = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `http://localhost:5000/api/job-match/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMatchData(response.data);

    } catch (error) {
      console.log(error);
    }
  };

  const generateInterviewQuestions = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `http://localhost:5000/api/interview/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setInterviewData(response.data);

    } catch (error) {
      console.log(error);
    }
  };

  if (!job) {
    return <h1>Loading...</h1>;
  }

  return (
    <div className="p-10">
      <h1 className="text-4xl font-bold text-green-400">
        {job.title}
      </h1>

      <p className="mt-4">{job.company}</p>

      <p>{job.location}</p>

      <p>{job.salary}</p>

      <p className="mt-6">{job.description}</p>

      <button
        onClick={handleApply}
        className="mt-6 bg-green-500 hover:bg-green-600 px-6 py-3 rounded font-bold"
      >
        Apply Now
      </button>
      <button
        onClick={checkMatchScore}
        className="bg-blue-500 px-4 py-2 rounded mt-4 ml-3"
      >
        Check Match Score
      </button>
      <button
        onClick={generateInterviewQuestions}
        className="bg-purple-500 px-4 py-2 rounded mt-4 ml-3"
      >
        Generate Interview Questions
      </button>
      {matchData && (
        <div className="mt-6 bg-gray-900 p-4 rounded">
          <h2 className="text-2xl font-bold">
            Match Score
          </h2>

          <p className="text-green-400 text-4xl">
            {matchData.matchScore}%
          </p>

          <h3 className="mt-4 font-bold">
            Matched Skills
          </h3>

          {matchData.matchedSkills?.map(
            (skill, index) => (
              <p key={index}>
                ✅ {skill}
              </p>
            )
          )}

          <h3 className="mt-4 font-bold">
            Missing Skills
          </h3>

          {matchData.missingSkills?.map(
            (skill, index) => (
              <p key={index}>
                ❌ {skill}
              </p>
            )
          )}

          <h3 className="mt-4 font-bold">
            Recommendation
          </h3>

          <p>
            {matchData.recommendation}
          </p>
        </div>
      )}

      {interviewData && (
        <div className="mt-8 bg-gray-900 p-6 rounded">

          <h2 className="text-3xl font-bold text-purple-400 mb-4">
            AI Interview Preparation
          </h2>

          <h3 className="text-xl font-bold mt-4">
            Technical Questions
          </h3>

          {interviewData.technicalQuestions?.map(
            (q, index) => (
              <p key={index}>
                {index + 1}. {q}
              </p>
            )
          )}

          <h3 className="text-xl font-bold mt-6">
            HR Questions
          </h3>

          {interviewData.hrQuestions?.map(
            (q, index) => (
              <p key={index}>
                {index + 1}. {q}
              </p>
            )
          )}

          <h3 className="text-xl font-bold mt-6">
            Coding Questions
          </h3>

          {interviewData.codingQuestions?.map(
            (q, index) => (
              <p key={index}>
                {index + 1}. {q}
              </p>
            )
          )}

        </div>
      )}
    </div>
  );
}

export default JobDetails;