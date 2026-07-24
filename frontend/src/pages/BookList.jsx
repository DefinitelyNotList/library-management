import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

function BookList() {
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchBooks();
  }, [location]);

  const fetchBooks = async () => {
    try {
      const response = await axiosInstance.get("/books");
      setBooks(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching books", error);
      if (error.response?.status === 401) {
        navigate("/login");
      }
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) {
      fetchBooks();
      return;
    }

    try {
      const response = await axiosInstance.get(
        `/books/search/title?title=${encodeURIComponent(query)}`
      );
      setBooks(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Search failed", error);
      if (error.response?.status === 401) {
        navigate("/login");
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      try {
        await axiosInstance.delete(`/books/${id}`);
        alert("✅ Book deleted successfully!");
        fetchBooks();
      } catch (error) {
        console.error("Error deleting book", error);
        alert(error.response?.data?.message || "❌ Error deleting book");
      }
    }
  };

  const handleEdit = (book) => {
    navigate(`/edit-book/${book.id}`, { state: { book } });
  };

  return (
    <div className="container mt-5 pt-5">
      <h2 className="mb-4 mt-4 text-center fw-bold">📚 Book Catalog</h2>

      <div className="d-flex mb-3">
        <input
          type="text"
          placeholder="Search by title"
          value={query}
          className="form-control me-2"
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button className="btn btn-primary" onClick={handleSearch}>
          Search
        </button>
      </div>

      <table className="table table-bordered shadow-sm">
        <thead className="table-light">
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Genre</th>
            <th>Copies</th>
            <th>Year</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {books.length > 0 ? (
            books.map((book) => (
              <tr key={book.id}>
                <td className="fw-semibold">{book.title}</td>
                <td>{book.author}</td>
                <td>{book.genre}</td>
                <td>
                  {book.availableCopies} / {book.totalCopies}
                </td>
                <td>{book.year || "-"}</td>
                <td>
                  <button
                    className="btn btn-sm btn-warning me-2"
                    onClick={() => handleEdit(book)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(book.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center text-muted">
                No books found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default BookList;
