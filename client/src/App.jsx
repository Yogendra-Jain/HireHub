import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import CreateJob from "./pages/CreateJob";
function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-black text-white">
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute> } />
          
          <Route
            path="/create-job"
            element={
              <ProtectedRoute>
                <CreateJob />
              </ProtectedRoute>
            }
          />
          
          <Route path="/jobs" element={<Jobs />} />

          <Route path="/jobs/:id" element={<JobDetails />} />

          <Route path="/recruiter-dashboard"
            element={
              <ProtectedRoute>
                <RecruiterDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
        
      </div>
    </BrowserRouter>
  );
}

export default App;