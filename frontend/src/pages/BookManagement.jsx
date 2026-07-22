// src/pages/BookManagement.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

function BookManagement() {
  const [books, setBooks] = useState([]);
  const navigate = useNavigate();

  const fetchBooks = async () => {
    try {
      const response = await axiosInstance.get(
        "http://localhost:8080/api/books"
      );
      setBooks(response.data);
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
        await axiosInstance.delete(`http://localhost:8080/api/books/${bookId}`);
        fetchBooks(); // Refresh book list after deletion
      } catch (err) {
        console.error("Failed to delete book", err);
      }
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  return (
    <div className="container mt-5">
      <h3 className="text-center">📚 Manage Library Books</h3>
      <table className="table table-bordered mt-4">
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
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td>{book.genre}</td>
                <td>{book.publisher}</td>
                <td>
                  {book.availableCopies}/{book.totalCopies}
                </td>
                <td>{book.status}</td>
                <td>
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => navigate(`/edit-book/${book.id}`)}
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
              <td colSpan="7" className="text-center">
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
