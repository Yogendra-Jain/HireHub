import { useEffect, useState } from "react";
import axios from "axios";

function MyApplications() {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:5000/api/applications/my-applications",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setApplications(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="p-10 min-h-screen bg-black text-white">
      <h1 className="text-4xl font-bold text-green-400 mb-8">
        My Applications
      </h1>

      {applications.map((app) => (
        <div
          key={app._id}
          className="bg-gray-900 p-6 rounded-lg mb-4"
        >
          <h2 className="text-2xl font-bold">
            {app.job?.title}
          </h2>

          <p>{app.job?.company}</p>

          <p className="mt-2">
            Status: {app.status}
          </p>
        </div>
      ))}
    </div>
  );
}

export default MyApplications;