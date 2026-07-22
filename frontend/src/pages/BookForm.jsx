import axios from "axios";
import { useState } from "react";

function BookForm({ book, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: book ? book.title : "",
    author: book ? book.author : "",
    genre: book ? book.genre : "",
    publisher: book ? book.publisher : "",
    year: book ? book.year : "",
    isbn: book ? book.isbn : "",
    totalCopies: book ? book.totalCopies : 1,
    availableCopies: book ? book.availableCopies : 1,
    status: book ? book.status : "AVAILABLE",
    coverImage: book ? book.coverImage : "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (book) {
        await axios.put(
          `http://localhost:8080/api/books/${book.id}`,
          formData,
          {
            headers: { Authorization: token },
          }
        );
        alert("✅ Book updated successfully!");
      } else {
        await axios.post("http://localhost:8080/api/books", formData, {
          headers: { Authorization: token },
        });
        alert("✅ Book added successfully!");
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert(
        "❌ Error saving book. Ensure all fields are valid and status is correct."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal d-block" tabIndex="-1">
      <div className="modal-dialog modal-lg">
        <div className="modal-content rounded-4 shadow-lg">
          <div className="modal-header">
            <h5 className="modal-title text-gradient fw-bold">
              {book ? "Edit Book" : "Add Book"}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {/* Cover Image Preview */}
              {formData.coverImage && (
                <div className="text-center mb-3">
                  <img
                    src={formData.coverImage}
                    alt="Cover Preview"
                    className="rounded shadow-sm"
                    style={{ maxHeight: 200, objectFit: "contain" }}
                    onError={(e) => (e.target.style.display = "none")}
                  />
                </div>
              )}

              <div className="row g-3">
                {[
                  {
                    label: "Title",
                    name: "title",
                    type: "text",
                    required: true,
                  },
                  {
                    label: "Author",
                    name: "author",
                    type: "text",
                    required: true,
                  },
                  { label: "Genre", name: "genre", type: "text" },
                  { label: "Publisher", name: "publisher", type: "text" },
                  {
                    label: "Year",
                    name: "year",
                    type: "number",
                    min: 1000,
                    max: 9999,
                  },
                  { label: "ISBN", name: "isbn", type: "text" },
                  {
                    label: "Total Copies",
                    name: "totalCopies",
                    type: "number",
                    min: 1,
                    required: true,
                  },
                  {
                    label: "Available Copies",
                    name: "availableCopies",
                    type: "number",
                    min: 0,
                    required: true,
                  },
                  {
                    label: "Cover Image URL",
                    name: "coverImage",
                    type: "text",
                  },
                ].map((field) => (
                  <div className="col-md-6" key={field.name}>
                    <label className="form-label">{field.label}</label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      className="form-control rounded-3 shadow-sm"
                      min={field.min || undefined}
                      max={field.max || undefined}
                      required={field.required || false}
                    />
                  </div>
                ))}

                <div className="col-md-6">
                  <label className="form-label">Status *</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="form-select rounded-3 shadow-sm"
                    required
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="UNAVAILABLE">UNAVAILABLE</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="submit"
                className="btn btn-gradient text-white shadow-sm"
                disabled={loading}
              >
                {loading ? "Saving…" : book ? "Update" : "Add"}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </form>

          <style>{`
            .btn-gradient {
              background: linear-gradient(135deg, #6a11cb, #2575fc);
              border: none;
            }
            .text-gradient {
              background: linear-gradient(90deg, #2575fc, #6a11cb);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            }
          `}</style>
        </div>
      </div>
    </div>
  );
}

export default BookForm;
