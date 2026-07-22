// src/pages/Unauthorized.jsx
import { useNavigate } from "react-router-dom";

function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="d-flex flex-column align-items-center justify-content-center vh-100 bg-light">
      {/* Illustration */}
      <div className="mb-4">
        <img
          src="https://cdn-icons-png.flaticon.com/512/29/29302.png"
          alt="Unauthorized"
          width="120"
        />
      </div>

      {/* Message */}
      <h2 className="text-danger fw-bold">Unauthorized Access</h2>
      <p className="text-muted">
        📚 Oops! You don’t have permission to access this page.
        <br /> Please return to the library dashboard or login again.
      </p>

      {/* Action Buttons */}
      <div className="mt-3">
        <button className="btn btn-primary me-2" onClick={() => navigate("/")}>
          Go to Home
        </button>
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate("/")}
        >
          Login
        </button>
      </div>
    </div>
  );
}

export default Unauthorized;
