import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";

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

  const [authorsList, setAuthorsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [publishersList, setPublishersList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLookups();
  }, []);

  const fetchLookups = async () => {
    try {
      const [authorsRes, catRes, pubRes] = await Promise.allSettled([
        axiosInstance.get("/library/lookups/authors"),
        axiosInstance.get("/library/lookups/categories"),
        axiosInstance.get("/library/lookups/publishers"),
      ]);

      if (authorsRes.status === "fulfilled" && Array.isArray(authorsRes.value.data)) {
        setAuthorsList(authorsRes.value.data);
      }
      if (catRes.status === "fulfilled" && Array.isArray(catRes.value.data)) {
        setCategoriesList(catRes.value.data);
      }
      if (pubRes.status === "fulfilled" && Array.isArray(pubRes.value.data)) {
        setPublishersList(pubRes.value.data);
      }
    } catch (e) {
      console.warn("Could not fetch lookups:", e);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (book) {
        await axiosInstance.put(`/books/${book.id}`, formData);
        alert("✅ Book updated successfully!");
      } else {
        await axiosInstance.post("/books", formData);
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
                    list: "authors-list",
                  },
                  {
                    label: "Genre (Category)",
                    name: "genre",
                    type: "text",
                    list: "categories-list",
                  },
                  {
                    label: "Publisher",
                    name: "publisher",
                    type: "text",
                    list: "publishers-list",
                  },
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
                      list={field.list || undefined}
                    />
                  </div>
                ))}

                {/* Datalists for DB Lookups */}
                <datalist id="authors-list">
                  {authorsList.map((a) => (
                    <option key={a.id || a.name} value={a.name} />
                  ))}
                </datalist>
                <datalist id="categories-list">
                  {categoriesList.map((c) => (
                    <option key={c.id || c.name} value={c.name} />
                  ))}
                </datalist>
                <datalist id="publishers-list">
                  {publishersList.map((p) => (
                    <option key={p.id || p.name} value={p.name} />
                  ))}
                </datalist>

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
