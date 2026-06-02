import { Navigate } from "react-router-dom";

function RoleProtectedRoute({
  children,
  allowedRole,
}) {
  const user = JSON.parse(
    localStorage.getItem("user")
  );

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== allowedRole) {
    return <Navigate to="/" />;
  }

  return children;
}

export default RoleProtectedRoute;