import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function RecruiterDashboard() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:5000/api/jobs/my-jobs",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data);
      setJobs(response.data);
    } catch (error) {
      console.log(error);
    }
  };
  console.log("Jobs:", jobs);
  return (
    <div className="p-10">
      <h1 className="text-4xl font-bold text-green-400 mb-8">
        Recruiter Dashboard
      </h1>

      {jobs.map((job) => (
        <div
          key={job._id}
          className="bg-gray-900 p-6 rounded-lg mb-4"
        >
          <h2 className="text-2xl font-bold">
            {job.title}
          </h2>

          <p>{job.company}</p>

          <p>{job.location}</p>

          <Link
            to={`/applicants/${job._id}`}
            className="bg-green-500 px-4 py-2 rounded inline-block mt-3"
          >
            View Applicants
          </Link>
        </div>
      ))}
    </div>
  );
}

export default RecruiterDashboard;