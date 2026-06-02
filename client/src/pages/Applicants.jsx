import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function Applicants() {
    const { jobId } = useParams();

    const [applications, setApplications] = useState([]);

    useEffect(() => {
        fetchApplicants();
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