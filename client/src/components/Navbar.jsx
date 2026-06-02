import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const token = localStorage.getItem("token");

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const role = user?.role;

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <nav className="bg-gray-900 text-white px-8 py-4 flex items-center justify-between">
      <h1 className="text-2xl font-bold text-green-400">
        HireHub AI
      </h1>

      <div className="flex gap-6 text-lg items-center">
        <Link to="/">Home</Link>
        {role === "candidate" && (
          <>
            <Link to="/jobs">Jobs</Link>

            <Link to="/my-applications">
              My Applications
            </Link>
          </>
        )}

        {role === "recruiter" && (
          <>
            <Link to="/create-job">
              Create Job
            </Link>

            <Link to="/recruiter-dashboard">
              Recruiter Dashboard
            </Link>
          </>
        )}
        {!token ? (
          <>
            <Link to="/login">Login</Link>

            <Link to="/register">Register</Link>
          </>
        ) : (
          <>
            <button
              onClick={handleLogout}
              className="bg-red-500 px-4 py-1 rounded"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;