import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function JobDetails() {
  const { id } = useParams();

  const [job, setJob] = useState(null);

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
    </div>
  );
}

export default JobDetails;