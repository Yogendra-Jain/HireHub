import { useEffect, useState } from "react";
import axios from "axios";

function MyInterviews() {

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {

    try {

      const token =
        localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:5000/api/interview-schedule/my-interviews",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setInterviews(res.data);

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">

      <h1 className="text-3xl font-bold mb-6">
        My Interviews
      </h1>

      {loading ? (

        <p>Loading...</p>

      ) : interviews.length === 0 ? (

        <p>No interviews scheduled yet.</p>

      ) : (

        <div className="space-y-4">

          {interviews.map((interview) => (

            <div
              key={interview._id}
              className="p-5 rounded-xl border"
            >

              <h2 className="text-xl font-semibold">
                {interview.job?.title}
              </h2>

              <p>
                Date: {interview.date}
              </p>

              <p>
                Time: {interview.time}
              </p>

              <p>
                Status: {interview.status}
              </p>

              <a
                href={interview.meetingLink}
                target="_blank"
                rel="noreferrer"
                className="text-blue-400"
              >
                Join Interview
              </a>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}

export default MyInterviews;