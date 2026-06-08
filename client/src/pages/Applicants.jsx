import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function Applicants() {
    const { jobId } = useParams();

    const [applications, setApplications] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);

    useEffect(() => {
        fetchApplicants();
        fetchLeaderboard();
    }, []);

    const fetchApplicants = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await axios.get(
                `http://localhost:5000/api/applications/job/${jobId}`,
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

    const fetchLeaderboard = async () => {
        try {
            const token =
                localStorage.getItem("token");

            const response =
                await axios.get(
                    `http://localhost:5000/api/job-match/applicants-match/${jobId}`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
                );

            setLeaderboard(response.data);

        } catch (error) {
            console.log(error);
        }
    };
    const updateStatus = async (
        applicationId,
        status
    ) => {
        try {
            const token =
                localStorage.getItem("token");

            await axios.put(
                `http://localhost:5000/api/applications/status/${applicationId}`,
                { status },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            fetchApplicants();
        } catch (error) {
            console.log(error);
        }
    };
    return (
        <div className="p-10">
            <h1 className="text-4xl font-bold mb-8">
                Applicants
            </h1>
            <div className="bg-gray-900 p-6 rounded-lg mb-8">

                <h2 className="text-3xl font-bold text-purple-400 mb-4">
                    AI Candidate Ranking
                </h2>

                {leaderboard.map(
                    (candidate, index) => (
                        <div
                            key={candidate.applicationId}
                            className="flex justify-between border-b border-gray-700 py-3"
                        >

                            <div>

                                <h3 className="font-bold text-lg">

                                    {index === 0 && "🥇 "}
                                    {index === 1 && "🥈 "}
                                    {index === 2 && "🥉 "}

                                    {candidate.name}

                                </h3>

                                <p>
                                    {candidate.email}
                                </p>

                            </div>

                            <div className="text-right">

                                <p className="text-2xl text-green-400 font-bold">
                                    {candidate.matchScore}%
                                </p>

                                <p>
                                    {candidate.status}
                                </p>

                            </div>

                        </div>
                    )
                )}

            </div>
            {applications.map((app) => (
                <div
                    key={app._id}
                    className="bg-gray-900 p-4 rounded-lg mb-4"
                >
                    <h2 className="text-xl font-bold">
                        {app.candidate?.name}
                    </h2>

                    <p>{app.candidate?.email}</p>

                    <select
                        value={app.status}
                        onChange={(e) =>
                            updateStatus(app._id, e.target.value)
                        }
                        className="text-black p-2 rounded mt-2"
                    >
                        <option value="Applied">
                            Applied
                        </option>

                        <option value="Reviewed">
                            Reviewed
                        </option>

                        <option value="Selected">
                            Selected
                        </option>

                        <option value="Rejected">
                            Rejected
                        </option>
                    </select>
                </div>
            ))}
        </div>
    );
}

export default Applicants;