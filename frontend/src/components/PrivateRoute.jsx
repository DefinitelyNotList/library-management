import { Navigate } from "react-router-dom";

function PrivateRoute({ children, requiredRole }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/" />; // Redirect to login if not logged in
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/unauthorized" />; // Redirect if role mismatch
  }

  return children;
}

export default PrivateRoute;
