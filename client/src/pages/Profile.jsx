import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Profile() {
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  const isCandidate = user?.role === "candidate";
    
  const [resume, setResume] = useState(null);
  const [resumeUrl, setResumeUrl] = useState("");

  const handleUpload = async () => {
    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();

      formData.append("resume", resume);

      const response = await axios.post(
        "http://localhost:5000/api/users/upload-resume",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setResumeUrl(response.data.resume);

      alert("Resume Uploaded Successfully");
    } catch (error) {
      console.log(error);

      alert("Upload Failed");
    }
  };

  const handleAnalyze = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:5000/api/ai/analyze-resume",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      localStorage.setItem(
        "resumeAnalysis",
        JSON.stringify(response.data)
      );

      navigate("/resume-analysis");

    } catch (error) {
      console.log(error);
      alert("Analysis Failed");
    }
  };
  return (
    <div className="min-h-screen bg-black text-white p-10">
      <h1 className="text-4xl font-bold text-green-400 mb-8">
        Profile
      </h1>

      <div className="bg-gray-900 p-6 rounded-lg max-w-xl">
        <h2 className="text-2xl font-bold mb-4">
          {user?.name}
        </h2>

        <p>Email: {user?.email}</p>

        <p className="mb-6">
          Role: {user?.role}
        </p>

       {isCandidate && (
            <>
                <input
                type="file"
                accept=".pdf"
                onChange={(e) =>
                    setResume(e.target.files[0])
                }
                className="mb-4"
                />

                <button
                  onClick={handleUpload}
                  className="bg-green-500 hover:bg-green-600 px-6 py-2 rounded"
                >
                  Upload Resume
                </button>

                <button
                  onClick={handleAnalyze}
                  className="bg-blue-500 px-6 py-2 rounded ml-4"
                >
                  Analyze Resume
                </button>
            </>
        )}

        {resumeUrl && (
          <div className="mt-6">
            <a
              href={resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="text-blue-400 underline"
            >
              View Uploaded Resume
            </a>
          </div>
        )}

        {analysis && (
          <div className="mt-8 bg-gray-900 p-6 rounded">
            <h2 className="text-2xl font-bold mb-4">
              AI Resume Analysis
            </h2>

            <pre className="whitespace-pre-wrap">
              {analysis}
            </pre>
          </div>
        )}

      </div>
    </div>
  );
}

export default Profile;