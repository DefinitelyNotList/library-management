import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function EditBook() {
  const { id } = useParams(); // Book ID from URL
  const navigate = useNavigate();

  const [book, setBook] = useState({
    title: "",
    author: "",
    genre: "",
    publisher: "",
    year: "",
    isbn: "",
    totalCopies: "",
    availableCopies: "",
  });

  // Fetch book details on load
  useEffect(() => {
    axios
      .get(`http://localhost:8080/api/books/${id}`)
      .then((res) => setBook(res.data))
      .catch((err) => console.error("Error fetching book:", err));
  }, [id]);

  const handleChange = (e) => {
    setBook({ ...book, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    axios
      .put(`http://localhost:8080/api/books/${id}`, book)
      .then(() => {
        alert("✅ Book updated successfully!");
        navigate("/manage-books");
      })
      .catch((err) => console.error("Error updating book:", err));
  };

  return (
    <div className="container mt-4">
      <h3 className="text-center">✏️ Edit Book</h3>
      <form onSubmit={handleSubmit} className="mt-4">
        {[
          ["Title", "title"],
          ["Author", "author"],
          ["Genre", "genre"],
          ["Publisher", "publisher"],
          ["Year", "year"],
          ["ISBN", "isbn"],
          ["Total Copies", "totalCopies"],
          ["Available Copies", "availableCopies"],
        ].map(([label, name]) => (
          <div className="mb-3" key={name}>
            <label className="form-label">{label}</label>
            <input
              type="text"
              name={name}
              value={book[name]}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
        ))}
        <button type="submit" className="btn btn-primary">
          Update Book
        </button>
      </form>
    </div>
  );
}

export default EditBook;
