import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AddLibrarian() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [successData, setSuccessData] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:8080/api/users/register",
        {
          name: form.name,
          email: form.email,
          password: form.password,
          role: "LIBRARIAN",
        }
      );

      console.log("Librarian added:", response.data);

      setSuccessData({
        name: form.name,
        email: form.email,
        role: "LIBRARIAN",
      });
      setError("");
      setForm({ name: "", email: "", password: "" });

      // Redirect after short delay
      setTimeout(() => {
        navigate("/admin-dashboard");
      }, 4000);
    } catch (err) {
      console.error("Error adding librarian:", err);
      setError(
        "❌ Failed to register librarian. This email may already exist."
      );
      setSuccessData(null);
    }
  };

  return (
    <div
      className="container mt-5 pt-5 my-5"
      style={{ maxWidth: "600px", marginTop: "100px" }}
    >
      <div className="card shadow-lg p-4 rounded-3 bg-light mt-5 pt-5">
        <h2 className="text-center mb-4 text-primary">➕ Add New Librarian</h2>

        {successData && (
          <div className="alert alert-success text-center fw-bold" role="alert">
            ✅ Librarian account created successfully!
            <hr />
            <div className="text-start">
              <p>
                <strong>👤 Name:</strong> {successData.name}
              </p>
              <p>
                <strong>📧 Email:</strong> {successData.email}
              </p>
              <p>
                <strong>🔑 Role:</strong> {successData.role}
              </p>
            </div>
            <p className="mt-2">Redirecting to login...</p>
          </div>
        )}

        {error && (
          <div className="alert alert-danger text-center fw-bold" role="alert">
            {error}
          </div>
        )}

        {!successData && (
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label fw-bold">
                👤 Full Name
              </label>
              <input
                type="text"
                className="form-control"
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Enter librarian's full name"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="form-label fw-bold">
                📧 Email Address
              </label>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="Enter librarian's email"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="form-label fw-bold">
                🔒 Password
              </label>
              <input
                type="password"
                className="form-control"
                id="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="Create a secure password"
              />
            </div>

            <div className="text-center">
              <button
                type="submit"
                className="btn btn-primary px-4 py-2 rounded-pill shadow-sm"
              >
                ➕ Add Librarian
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default AddLibrarian;
