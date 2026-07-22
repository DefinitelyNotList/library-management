import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AddBook() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    genre: "",
    publisher: "",
    year: "",
    isbn: "",
    totalCopies: "",
    availableCopies: "",
    status: "AVAILABLE", // default value
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("http://localhost:8080/api/books", formData, {
        headers: {
          Authorization: `${localStorage.getItem("token")}`,
        },
      });
      alert("✅ Book added successfully!");
      navigate("/book-catalog");
    } catch (error) {
      console.error("❌ Error adding book:", error);
      alert("Failed to add book. Make sure all fields are valid.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container py-5"
      style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}
    >
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="card shadow rounded">
            <div className="card-header bg-primary text-white text-center">
              <h3 className="mb-0">➕ Add New Book</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  {/* Title */}
                  <div className="col-md-6">
                    <label className="form-label">Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>

                  {/* Author */}
                  <div className="col-md-6">
                    <label className="form-label">Author *</label>
                    <input
                      type="text"
                      name="author"
                      value={formData.author}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>

                  {/* Genre */}
                  <div className="col-md-6">
                    <label className="form-label">Genre</label>
                    <input
                      type="text"
                      name="genre"
                      value={formData.genre}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>

                  {/* Publisher */}
                  <div className="col-md-6">
                    <label className="form-label">Publisher</label>
                    <input
                      type="text"
                      name="publisher"
                      value={formData.publisher}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>

                  {/* Year */}
                  <div className="col-md-4">
                    <label className="form-label">Year</label>
                    <input
                      type="number"
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      className="form-control"
                      min="1000"
                      max="9999"
                    />
                  </div>

                  {/* ISBN */}
                  <div className="col-md-4">
                    <label className="form-label">ISBN</label>
                    <input
                      type="text"
                      name="isbn"
                      value={formData.isbn}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>

                  {/* Total Copies */}
                  <div className="col-md-2">
                    <label className="form-label">Total Copies *</label>
                    <input
                      type="number"
                      name="totalCopies"
                      value={formData.totalCopies}
                      onChange={handleChange}
                      className="form-control"
                      min="1"
                      required
                    />
                  </div>

                  {/* Available Copies */}
                  <div className="col-md-2">
                    <label className="form-label">Available Copies11 *</label>
                    <input
                      type="number"
                      name="availableCopies"
                      value={formData.availableCopies}
                      onChange={handleChange}
                      className="form-control"
                      min="0"
                      required
                    />
                  </div>

                  {/* Status */}
                  <div className="col-md-4">
                    <label className="form-label">Status *</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="form-select"
                      required
                    >
                      <option value="AVAILABLE">AVAILABLE</option>
                      <option value="UNAVAILABLE">UNAVAILABLE</option>
                    </select>
                  </div>
                </div>

                {/* Submit */}
                <div className="text-center mt-4">
                  <button
                    type="submit"
                    className="btn btn-success px-4"
                    disabled={loading}
                  >
                    {loading ? "Adding…" : "📘 Add Book"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddBook;
