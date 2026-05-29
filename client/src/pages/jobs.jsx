import { useEffect, useState } from "react";
import axios from "axios";

function Jobs() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/jobs"
      );

      setJobs(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="p-10">
      <h1 className="text-4xl font-bold mb-8 text-green-400">
        Available Jobs
      </h1>

      <div className="grid gap-6">
        {jobs.map((job) => (
          <div
            key={job._id}
            className="bg-gray-900 p-6 rounded-lg"
          >
            <h2 className="text-2xl font-bold">
              {job.title}
            </h2>

            <p>{job.company}</p>

            <p>{job.location}</p>

            <p>{job.salary}</p>

            <p className="mt-2 text-gray-400">
              {job.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Jobs;