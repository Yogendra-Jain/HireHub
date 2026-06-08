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
import Applicants from "./pages/Applicants";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import MyApplications from "./pages/MyApplications";
import Profile from "./pages/Profile";
import ResumeAnalysis from "./pages/ResumeAnalysis";
import AIChat from "./pages/AIChat";
import ApplicantsDashboard from "./pages/ApplicantsDashboard";

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
              <RoleProtectedRoute  allowedRole="recruiter">
                <CreateJob />
              </RoleProtectedRoute >
            }
          />
          
          <Route path="/jobs" element={<Jobs />} />

          <Route path="/jobs/:id" element={<JobDetails />} />

          <Route path="/recruiter-dashboard"
            element={
              <RoleProtectedRoute  allowedRole="recruiter">
                <RecruiterDashboard />
              </RoleProtectedRoute >
            }
          />

          <Route
            path="/applicants/:jobId"
            element={
              <RoleProtectedRoute  allowedRole="recruiter">
                <Applicants />
              </RoleProtectedRoute >
            }
          />

          <Route
            path="/my-applications"
            element={
              <ProtectedRoute>
                <MyApplications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resume-analysis"
            element={
              <ProtectedRoute>
                <ResumeAnalysis />
              </ProtectedRoute>
            }
          />

          <Route
            path="/ai-chat"
            element={
              <ProtectedRoute>
                <AIChat />
              </ProtectedRoute>
            }
          />

          <Route
            path="/applicants-dashboard/:jobId"
            element={<ApplicantsDashboard />}
          />
        </Routes>
        
      </div>
    </BrowserRouter>
  );
}

export default App;