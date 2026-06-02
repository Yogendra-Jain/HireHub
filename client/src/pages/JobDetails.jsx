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
    </div>
  );
}

export default JobDetails;