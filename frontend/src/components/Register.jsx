import axios from "axios";
import { useState } from "react";
import bgImage from "../assets/background.jpg";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:8080/api/users/register",
        {
          name,
          email,
          password,
        }
      );

      setMessage(response.data);
      setName("");
      setEmail("");
      setPassword("");
    } catch (err) {
      setMessage("Registration failed: " + (err.response?.data || err.message));
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
        <h3 className="mb-3">Register</h3>
        {message && <div className="alert alert-info">{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="d-flex align-items-center mb-3">
            <label className="me-2" style={{ minWidth: "70px" }}>
              Name:
            </label>
            <input
              type="text"
              className="form-control"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="d-flex align-items-center mb-3">
            <label className="me-2" style={{ minWidth: "70px" }}>
              Email:
            </label>
            <input
              type="Email"
              className="form-control"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="d-flex align-items-center mb-3">
            <label className="me-2" style={{ minWidth: "70px" }}>
              Password:
            </label>
            <input
              type="Password"
              className="form-control"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="btn btn-primary w-100" type="submit">
            Register
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;
