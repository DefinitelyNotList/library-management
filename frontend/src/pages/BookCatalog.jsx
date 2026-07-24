import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import BookForm from "./BookForm";

function BookCatalog() {
  const [books, setBooks] = useState([]);
  const [editingBook, setEditingBook] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await axiosInstance.get("/books");
      setBooks(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  };

  const handleRequestBook = async (bookId) => {
    try {
      let memberId = localStorage.getItem("memberId");

      // Fallback if memberId is not directly stored in localStorage
      if (!memberId) {
        const username = localStorage.getItem("username");
        if (username) {
          // Attempt to get user/member details
          const usersRes = await axiosInstance.get("/users");
          const me = usersRes.data.find(
            (u) => u.name === username || u.email === username
          );
          if (me) memberId = me.id;
        }
      }

      if (!memberId) {
        alert("⚠️ Cannot identify Member ID. Please re-login.");
        return;
      }

      const response = await axiosInstance.post(
        `/requests/member/${memberId}/book/${bookId}`
      );

      alert(
        `✅ Request submitted successfully! Status: ${response.data.status || "PENDING"}`
      );
      fetchBooks();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "❌ Cannot request book");
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

  const genres = ["ALL", ...new Set(books.map((b) => b.genre).filter(Boolean))];

  const filteredBooks = books.filter((book) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      (book.title && book.title.toLowerCase().includes(q)) ||
      (book.author && book.author.toLowerCase().includes(q)) ||
      (book.isbn && book.isbn.toLowerCase().includes(q));

    const matchesGenre = selectedGenre === "ALL" || book.genre === selectedGenre;
    const isAvail =
      (book.availableCopies !== undefined && book.availableCopies > 0) ||
      (book.status && book.status.toLowerCase().includes("avail"));

    const matchesStatus =
      selectedStatus === "ALL" ||
      (selectedStatus === "AVAILABLE" && isAvail) ||
      (selectedStatus === "UNAVAILABLE" && !isAvail);

    return matchesQuery && matchesGenre && matchesStatus;
  });

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

      {/* Filtering Bar */}
      <div className="row g-3 mb-4 p-3 rounded-4 shadow-sm bg-light">
        <div className="col-md-5">
          <div className="input-group">
            <span className="input-group-text bg-white border-0">🔍</span>
            <input
              type="text"
              className="form-control border-0 bg-white"
              placeholder="Search by title, author, or ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-3">
          <select
            className="form-select border-0 bg-white"
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
          >
            <option value="ALL">🏷️ All Genres</option>
            {genres
              .filter((g) => g !== "ALL")
              .map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
          </select>
        </div>
        <div className="col-md-3">
          <select
            className="form-select border-0 bg-white"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="ALL">⚙️ All Statuses</option>
            <option value="AVAILABLE">Available Only</option>
            <option value="UNAVAILABLE">Unavailable Only</option>
          </select>
        </div>
        <div className="col-md-1 d-flex align-items-center">
          <button
            className="btn btn-outline-secondary w-100 rounded-pill"
            onClick={() => {
              setSearchQuery("");
              setSelectedGenre("ALL");
              setSelectedStatus("ALL");
            }}
          >
            Reset
          </button>
        </div>
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
        {filteredBooks.map((book) => {
          const isAvail =
            (book.availableCopies !== undefined && book.availableCopies > 0) ||
            (book.status && book.status.toLowerCase().includes("avail"));

          return (
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
                    <strong>Author:</strong> {book.author || "Unknown"}
                  </p>
                  <p className="card-text mb-1">
                    <strong>Genre:</strong> {book.genre || "General"}
                  </p>
                  <p className="card-text mb-1">
                    <strong>Status:</strong>{" "}
                    <span className={isAvail ? "text-success fw-bold" : "text-danger fw-bold"}>
                      {isAvail ? "Available" : "Out of Stock"}
                    </span>
                  </p>

                  <div className="mt-auto pt-3 d-flex flex-column gap-2">
                    <button
                      className="btn btn-outline-secondary btn-sm rounded-pill w-100"
                      onClick={() => navigate(`/books/${book.id}`)}
                    >
                      🔍 Xem chi tiết
                    </button>
                    {role !== "ADMIN" && (
                      isAvail ? (
                        <button
                          className="btn btn-primary w-100 shadow-sm fw-semibold"
                          onClick={() => handleRequestBook(book.id)}
                        >
                          📖 Request Book
                        </button>
                      ) : (
                        <button className="btn btn-secondary w-100 shadow-sm" disabled>
                          🚫 Out of Stock
                        </button>
                      )
                    )}

                    {role === "ADMIN" && (
                      <div className="d-flex justify-content-between">
                        <button
                          className="btn btn-warning me-2 shadow-sm flex-fill"
                          onClick={() => handleEdit(book)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger shadow-sm flex-fill"
                          onClick={() => handleDelete(book.id)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
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
