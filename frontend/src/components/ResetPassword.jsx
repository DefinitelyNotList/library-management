import axios from "axios";
import { useState } from "react";
import bgImage from "../assets/background.jpg";

function ResetPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:8080/api/users/reset-password",
        {
          email,
          otp,
          newPassword,
        }
      );

      setMessage(response.data);
      setEmail("");
      setOtp("");
      setNewPassword("");
    } catch (err) {
      setMessage("Reset failed: " + (err.response?.data || err.message));
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
        <h3 className="mb-3">Reset Password</h3>
        {message && <div className="alert alert-info">{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className=" mb-3 d-flex align-items-center">
            <label className="me-2" style={{ minWidth: "70px" }}>
              Email:
            </label>
            <input
              type="email"
              className="form-control"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-3 d-flex align-items-center">
            <label className="me-2" style={{ minWidth: "70px" }}>
              OTP:
            </label>
            <input
              type="text"
              className="form-control"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>

          <div className="mb-3 d-flex align-items-center">
            <label className="me-2" style={{ minWidth: "70px" }}>
              New Pass:
            </label>
            <input
              type="password"
              className="form-control"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <button className="btn btn-primary w-100" type="submit">
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
