import { useState } from "react";
import axios from "axios";
function CreateJob() {
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    salary: "",
    description: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        const token = localStorage.getItem("token");

        const response = await axios.post(
        "http://localhost:5000/api/jobs/create",
        formData,
        {
            headers: {
            Authorization: `Bearer ${token}`,
            },
        }
        );

        alert("Job Created Successfully");

        console.log(response.data);

        setFormData({
        title: "",
        company: "",
        location: "",
        salary: "",
        description: "",
        });
    } catch (error) {
        console.log(error);

        alert("Failed to create job");
    }
};

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6">
        Create Job
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <input
          type="text"
          name="title"
          placeholder="Job Title"
          value={formData.title}
          onChange={handleChange}
          className="w-full p-3 border rounded"
        />

        <input
          type="text"
          name="company"
          placeholder="Company Name"
          value={formData.company}
          onChange={handleChange}
          className="w-full p-3 border rounded"
        />

        <input
          type="text"
          name="location"
          placeholder="Location"
          value={formData.location}
          onChange={handleChange}
          className="w-full p-3 border rounded"
        />

        <input
          type="text"
          name="salary"
          placeholder="Salary"
          value={formData.salary}
          onChange={handleChange}
          className="w-full p-3 border rounded"
        />

        <textarea
          name="description"
          placeholder="Job Description"
          value={formData.description}
          onChange={handleChange}
          className="w-full p-3 border rounded"
        />

        <button
          type="submit"
          className="bg-green-500 px-6 py-3 rounded"
        >
          Create Job
        </button>
      </form>
    </div>
  );
}

export default CreateJob;