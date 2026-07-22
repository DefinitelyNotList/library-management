import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import bgImage from "../assets/background.jpg";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post(
        "http://localhost:8080/api/users/forgot-password",
        null,
        { params: { email } }
      );

      // Show success message
      setMessage(response.data); // "OTP has been sent to your email"

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate("/reset-password", { state: { email } }); // Pass email to reset page
      }, 2000);
    } catch (err) {
      setMessage("Error: " + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  const backgroundStyle = {
    backgroundImage: `url(${bgImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  return (
    <div style={backgroundStyle}>
      <div
        className="container p-4 bg-white rounded shadow"
        style={{ maxWidth: "400px" }}
      >
        <h3 className="mb-3">Reset Your Password</h3>
        {message && <div className="alert alert-info">{message}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label>Enter Your Registered Email</label>
            <input
              type="email"
              className="form-control"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button
            className="btn btn-primary w-100"
            type="submit"
            disabled={loading}
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;
