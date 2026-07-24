import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

function BookManagement() {
  const [books, setBooks] = useState([]);
  const navigate = useNavigate();

  const fetchBooks = async () => {
    try {
      const response = await axiosInstance.get("/books");
      setBooks(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Failed to fetch books", err);
    }
  };

  const handleEdit = (bookId) => {
    navigate(`/edit-book/${bookId}`);
  };

  const handleDelete = async (bookId) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      try {
        await axiosInstance.delete(`/books/${bookId}`);
        fetchBooks();
      } catch (err) {
        console.error("Failed to delete book", err);
      }
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  return (
    <div className="container mt-5 pt-5">
      <h3 className="text-center mt-4 fw-bold">📚 Manage Library Books</h3>
      <table className="table table-bordered mt-4 shadow-sm">
        <thead className="table-light">
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Genre</th>
            <th>Publisher</th>
            <th>Copies</th>
            <th>Status</th>
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
                <td>{book.publisher}</td>
                <td>
                  {book.availableCopies}/{book.totalCopies}
                </td>
                <td>
                  <span className={`badge ${book.availableCopies > 0 ? "bg-success" : "bg-danger"}`}>
                    {book.status}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => handleEdit(book.id)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(book.id)}
                  >
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center text-muted">
                No books found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default BookManagement;
