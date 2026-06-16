import { Navigate } from "react-router-dom";

// RoleProtectedRoute
// allowedRole can be a string "recruiter" or "admin"
// Admin can also access recruiter routes if needed

function RoleProtectedRoute({ children, allowedRole }) {
  const user = JSON.parse(localStorage.getItem("user"));

  // Not logged in → go to login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Check if user's role matches the required role
  if (user.role !== allowedRole) {
    return <Navigate to="/" />;
  }

  return children;
}

export default RoleProtectedRoute;