import { useEffect, useState } from "react";
import axios from "axios";

function RecruiterInterviews() {

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);

  const [selectedInterview, setSelectedInterview] =
    useState(null);

  const [formData, setFormData] = useState({
    date: "",
    time: "",
    meetingLink: ""
  });

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {

      const token =
        localStorage.getItem("token");

      const res =
        await axios.get(
          "http://localhost:5000/api/interview-management/recruiter",
          {
            headers: {
              Authorization:
                `Bearer ${token}`
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

  const openReschedule = (interview) => {

    setSelectedInterview(interview);

    setFormData({
      date: interview.date,
      time: interview.time,
      meetingLink: interview.meetingLink
    });

    setShowModal(true);

  };

  const rescheduleInterview = async () => {
    try {

      const token =
        localStorage.getItem("token");

      await axios.put(

        `http://localhost:5000/api/interview-management/reschedule/${selectedInterview._id}`,

        formData,

        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

      alert(
        "Interview Rescheduled"
      );

      setShowModal(false);

      fetchInterviews();

    } catch (error) {

      console.log(error);

      alert(
        "Failed"
      );

    }
  };

  const cancelInterview = async (id) => {

    if (
      !window.confirm(
        "Cancel this interview?"
      )
    ) return;

    try {

      const token =
        localStorage.getItem("token");

      await axios.put(

        `http://localhost:5000/api/interview-management/cancel/${id}`,

        {},

        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

      alert(
        "Interview Cancelled"
      );

      fetchInterviews();

    } catch (error) {

      console.log(error);

      alert(
        "Failed"
      );

    }

  };

  return (
    <div className="max-w-6xl mx-auto p-6">

      <h1 className="text-3xl font-bold mb-6">
        Recruiter Interviews
      </h1>

      {loading ? (

        <p>Loading...</p>

      ) : interviews.length === 0 ? (

        <p>No interviews scheduled.</p>

      ) : (

        <div className="space-y-4">

          {interviews.map((interview) => (

            <div
              key={interview._id}
              className="border rounded-xl p-5"
            >

              <h2 className="text-xl font-bold">
                {interview.candidate?.name}
              </h2>

              <p>
                Email:
                {" "}
                {interview.candidate?.email}
              </p>

              <p>
                Job:
                {" "}
                {interview.job?.title}
              </p>

              <p>
                Date:
                {" "}
                {interview.date}
              </p>

              <p>
                Time:
                {" "}
                {interview.time}
              </p>

              <p>
                Status:
                {" "}
                {interview.status}
              </p>

              <div className="flex gap-3 mt-4">

                <button
                  onClick={() =>
                    openReschedule(
                      interview
                    )
                  }
                  className="px-4 py-2 rounded bg-blue-600"
                >
                  Reschedule
                </button>

                <button
                  onClick={() =>
                    cancelInterview(
                      interview._id
                    )
                  }
                  className="px-4 py-2 rounded bg-red-600"
                >
                  Cancel
                </button>

              </div>

            </div>

          ))}

        </div>

      )}

      {showModal && (

        <div
          className="fixed inset-0 flex items-center justify-center bg-black/70"
        >

          <div
            className="bg-gray-900 p-6 rounded-xl w-[500px]"
          >

            <h2 className="text-xl font-bold mb-4">
              Reschedule Interview
            </h2>

            <input
              type="date"
              className="w-full p-3 mb-3 rounded text-black"
              value={formData.date}
              onChange={(e)=>
                setFormData({
                  ...formData,
                  date:e.target.value
                })
              }
            />

            <input
              type="time"
              className="w-full p-3 mb-3 rounded text-black"
              value={formData.time}
              onChange={(e)=>
                setFormData({
                  ...formData,
                  time:e.target.value
                })
              }
            />

            <input
              type="text"
              placeholder="Meeting Link"
              className="w-full p-3 mb-4 rounded text-black"
              value={formData.meetingLink}
              onChange={(e)=>
                setFormData({
                  ...formData,
                  meetingLink:e.target.value
                })
              }
            />

            <div className="flex gap-3">

              <button
                onClick={
                  rescheduleInterview
                }
                className="px-4 py-2 rounded bg-blue-600"
              >
                Save
              </button>

              <button
                onClick={() =>
                  setShowModal(false)
                }
                className="px-4 py-2 rounded bg-gray-600"
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default RecruiterInterviews;