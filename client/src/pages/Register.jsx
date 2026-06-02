import { useState } from "react";
import axios from "axios";
function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [role, setRole] = useState("candidate");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          ...formData ,
          role,
        }
      );

      console.log(response.data);

      alert("Registration Successful");
    } catch (error) {
        console.log(error);

        alert("Registration Failed");
      }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 p-8 rounded-lg w-full max-w-md"
      >
        <h1 className="text-3xl font-bold mb-6 text-center text-green-400">
          Register
        </h1>

        <div className="mb-4">
          <label>Name</label>

          <input
            type="text"
            name="name"
            placeholder="Enter your name"
            value={formData.name}
            onChange={handleChange}
            className="w-full mt-2 p-3 rounded bg-gray-800 outline-none"
          />
        </div>

        <div className="mb-4">
          <label>Email</label>

          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            className="w-full mt-2 p-3 rounded bg-gray-800 outline-none"
          />
        </div>

        <div className="mb-6">
          <label>Password</label>

          <input
            type="password"
            name="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleChange}
            className="w-full mt-2 p-3 rounded bg-gray-800 outline-none"
          />
        </div>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full p-3 rounded"
        >
          <option value="candidate">
            Candidate
          </option>

          <option value="recruiter">
            Recruiter
          </option>
        </select>
        <button
          type="submit"
          className="w-full bg-green-500 hover:bg-green-600 p-3 rounded font-bold"
        >
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;