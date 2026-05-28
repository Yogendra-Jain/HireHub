import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      <h1 className="text-6xl font-bold text-center leading-tight">
        Find Your Dream Job <br />
        With <span className="text-green-400">HireHub AI</span>
      </h1>

      <p className="text-gray-400 text-xl mt-6 text-center max-w-2xl">
        AI-powered job portal that helps candidates find jobs
        and recruiters hire smarter.
      </p>

      <div className="flex gap-6 mt-10">
        <Link
          to="/register"
          className="bg-green-500 hover:bg-green-600 px-8 py-3 rounded-lg font-bold"
        >
          Get Started
        </Link>

        <Link
          to="/login"
          className="border border-green-400 text-green-400 hover:bg-green-400 hover:text-black px-8 py-3 rounded-lg font-bold"
        >
          Login
        </Link>
      </div>
    </div>
  );
}

export default Home;