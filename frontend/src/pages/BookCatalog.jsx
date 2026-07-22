import axios from "axios";
import { useEffect, useState } from "react";
import BookForm from "./BookForm";

function BookCatalog() {
  const [books, setBooks] = useState([]);
  const [editingBook, setEditingBook] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const role = localStorage.getItem("role");

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8080/api/books", {
        headers: { Authorization: token },
      });
      setBooks(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  // const handleBorrow = async (bookId) => {
  //   try {
  //     const memberId = localStorage.getItem("memberId"); // logged-in member ID
  //     const token = localStorage.getItem("token"); // JWT token

  //     const response = await axios.post(
  //       `http://localhost:8080/api/borrow/${memberId}/${bookId}`,
  //       {},
  //       { headers: { Authorization: token } }
  //     );

  //     alert(`Book borrowed successfully! Due date: ${response.data.dueDate}`);
  //     fetchBooks(); // refresh book list
  //   } catch (error) {
  //     console.error(error);
  //     alert(error.response?.data?.message || "Cannot borrow book");
  //   }
  // };

  const handleRequestBook = async (bookId) => {
    try {
      const memberId = localStorage.getItem("memberId"); // logged-in member ID
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `http://localhost:8080/api/requests/member/${memberId}/book/${bookId}`,
        {},
        { headers: { Authorization: token } }
      );

      alert(
        `Book request submitted successfully! Status: ${response.data.status}`
      );
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Cannot request book");
    }
  };

  const handleLike = async (bookId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:8080/api/books/like/${bookId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("You liked this book!");
    } catch (error) {
      console.error(error);
      alert("Cannot like book");
    }
  };

  const handleDelete = async (bookId) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8080/api/books/${bookId}`, {
        headers: { Authorization: token },
      });
      alert("Book deleted successfully!");
      fetchBooks();
    } catch (error) {
      console.error("Error deleting book:", error);
      alert("Cannot delete book");
    }
  };

  const handleEdit = (book) => {
    setEditingBook(book);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setEditingBook(null);
    setShowForm(false);
  };

  const handleFormSubmit = () => {
    fetchBooks();
    handleFormClose();
  };

  return (
    <div className="container mt-5 pt-5">
      <div className="d-flex justify-content-between align-items-center mb-4 mt-4 pt-4">
        <h2 className="text-gradient fw-bold">📚 Book Catalog</h2>
        {role === "ADMIN" && (
          <button
            className="btn btn-gradient text-white shadow-sm"
            onClick={() => setShowForm(true)}
          >
            + Add Book
          </button>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <BookForm
          book={editingBook}
          onClose={handleFormClose}
          onSuccess={handleFormSubmit}
        />
      )}

      <div className="row g-4">
        {books.map((book) => (
          <div key={book.id} className="col-md-4">
            <div
              className="card h-100 shadow-lg border-0 rounded-4 overflow-hidden hover-card"
              style={{ transition: "transform 0.3s, box-shadow 0.3s" }}
            >
              {book.coverImage ? (
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="card-img-top"
                  style={{ height: "250px", objectFit: "cover" }}
                />
              ) : book.isbn ? (
                <img
                  src={`https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg`}
                  alt={book.title}
                  className="card-img-top"
                  style={{ height: "250px", objectFit: "cover" }}
                />
              ) : (
                <div
                  className="bg-secondary text-white d-flex align-items-center justify-content-center"
                  style={{ height: "250px" }}
                >
                  No Image
                </div>
              )}

              <div className="card-body d-flex flex-column">
                <h5 className="card-title text-gradient fw-bold text-truncate">
                  {book.title}
                </h5>
                <p className="card-text mb-1">
                  <strong>Author:</strong> {book.author}
                </p>
                <p className="card-text mb-1">
                  <strong>Genre:</strong> {book.genre}
                </p>
                <p className="card-text mb-1">
                  <strong>Status:</strong>{" "}
                  <span
                    className={
                      book.status === "AVAILABLE"
                        ? "text-success"
                        : "text-danger"
                    }
                  >
                    {book.status}
                  </span>
                </p>

                <div className="mt-auto d-flex justify-content-between">
                  {/* {book.status === "AVAILABLE" && role !== "ADMIN" && (
                    <button
                      className="btn btn-sm btn-primary shadow-sm"
                      onClick={() => handleBorrow(book.id)}
                    >
                      Borrow
                    </button> */}
                  {book.status === "AVAILABLE" && role !== "ADMIN" && (
                    <button
                      className="btn btn-sm btn-primary shadow-sm"
                      onClick={() => handleRequestBook(book.id)}
                    >
                      Request Book
                    </button>
                  )}

                  <button
                    className="btn btn-sm btn-outline-success shadow-sm"
                    onClick={() => handleLike(book.id)}
                  >
                    Like
                  </button>
                  {role === "ADMIN" && (
                    <>
                      <button
                        className="btn btn-sm btn-warning me-2 shadow-sm"
                        onClick={() => handleEdit(book)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger shadow-sm"
                        onClick={() => handleDelete(book.id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {books.length === 0 && (
          <p className="text-center text-muted mt-5">No books found</p>
        )}
      </div>

      {/* Custom Styles */}
      <style>{`
        .hover-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.25);
        }
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
  );
}

export default BookCatalog;
