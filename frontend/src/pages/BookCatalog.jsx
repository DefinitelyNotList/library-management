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

  // Borrow Ticket Modal States
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [membersList, setMembersList] = useState([]);
  const [borrowMemberId, setBorrowMemberId] = useState("");
  const [selectedBookIds, setSelectedBookIds] = useState([]);

  const role = localStorage.getItem("role");
  const isLibrarianOrAdmin = role === "ADMIN" || role === "LIBRARIAN";
  const isReader = role === "MEMBER" || role === "READER";
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

  const fetchMembersList = async () => {
    try {
      const res = await axiosInstance.get("/users");
      const users = Array.isArray(res.data) ? res.data : [];
      const membersOnly = users.filter(
        (u) => u.role === "MEMBER" || u.role === "READER"
      );
      setMembersList(membersOnly);
    } catch (err) {
      console.error("Error fetching members list:", err);
    }
  };

  const handleRequestBook = async (bookId) => {
    try {
      let memberId = localStorage.getItem("memberId");

      if (!memberId) {
        const username = localStorage.getItem("username");
        if (username) {
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

  const handleDelete = async (bookId) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;
    try {
      await axiosInstance.delete(`/books/${bookId}`);
      alert("✅ Book deleted successfully!");
      fetchBooks();
    } catch (error) {
      console.error("Error deleting book:", error);
      alert(error.response?.data?.message || "❌ Cannot delete book");
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

  // Open Create Borrow Ticket Modal (Supports selecting up to 5 books)
  const openIssueModal = (initialBook = null) => {
    if (initialBook) {
      setSelectedBookIds([initialBook.id]);
    } else {
      setSelectedBookIds([]);
    }
    setBorrowMemberId("");
    fetchMembersList();
    setShowBorrowModal(true);
  };

  const toggleBookSelection = (bookId) => {
    if (selectedBookIds.includes(bookId)) {
      setSelectedBookIds(selectedBookIds.filter((id) => id !== bookId));
    } else {
      if (selectedBookIds.length >= 5) {
        alert("⚠️ Bạn chỉ được chọn tối đa 5 quyển sách cho mỗi phiếu mượn.");
        return;
      }
      setSelectedBookIds([...selectedBookIds, bookId]);
    }
  };

  const handleCreateBorrowTicket = async () => {
    if (!borrowMemberId) {
      alert("⚠️ Vui lòng chọn độc giả.");
      return;
    }
    if (selectedBookIds.length === 0) {
      alert("⚠️ Vui lòng chọn ít nhất 1 quyển sách.");
      return;
    }
    if (selectedBookIds.length > 5) {
      alert("⚠️ Mỗi phiếu mượn tối đa 5 quyển sách.");
      return;
    }

    try {
      await axiosInstance.post(
        `/transactions/issue-bulk/${borrowMemberId}`,
        selectedBookIds
      );
      alert(`✅ Đã tạo phiếu mượn thành công cho ${selectedBookIds.length} quyển sách!`);
      setShowBorrowModal(false);
      setBorrowMemberId("");
      setSelectedBookIds([]);
      fetchBooks();
    } catch (err) {
      console.error(err);
      alert(
        "❌ Tạo phiếu mượn thất bại: " +
          (err.response?.data?.message || err.message)
      );
    }
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
        {isLibrarianOrAdmin && (
          <div className="d-flex gap-2">
            <button
              className="btn btn-success shadow-sm fw-semibold"
              onClick={() => openIssueModal(null)}
            >
              📝 Tạo Phiếu Mượn (Mượn 1-5 quyển)
            </button>
            <button
              className="btn btn-gradient text-white shadow-sm"
              onClick={() => {
                setEditingBook(null);
                setShowForm(true);
              }}
            >
              + Add Book
            </button>
          </div>
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

      {/* Book Form Modal */}
      {showForm && (
        <BookForm
          book={editingBook}
          onClose={handleFormClose}
          onSuccess={handleFormSubmit}
        />
      )}

      {/* Borrow Ticket Modal (Supports 1-5 Books) */}
      {showBorrowModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-0 pb-0">
                <h4 className="modal-title fw-bold">
                  📝 Tạo Phiếu Mượn Sách (Tối đa 5 quyển)
                </h4>
                <button
                  className="btn-close"
                  onClick={() => setShowBorrowModal(false)}
                ></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-4">
                  {/* Select Member */}
                  <div className="col-12">
                    <label className="form-label fw-semibold">
                      👤 Chọn Độc Giả (Select Member) <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select form-select-lg"
                      value={borrowMemberId}
                      onChange={(e) => setBorrowMemberId(e.target.value)}
                    >
                      <option value="">-- Choose Member --</option>
                      {membersList.map((m) => (
                        <option key={m.id} value={m.id}>
                          #{m.id} - {m.name} ({m.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Select Books (Checklist up to 5) */}
                  <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <label className="form-label fw-semibold mb-0">
                        📖 Chọn Sách Mượn (Select Books) <span className="text-danger">*</span>
                      </label>
                      <span className={`badge ${selectedBookIds.length === 5 ? "bg-warning text-dark" : "bg-primary"}`}>
                        Đã chọn: {selectedBookIds.length}/5 quyển
                      </span>
                    </div>

                    <div
                      className="border rounded-3 p-3 bg-light"
                      style={{ maxHeight: "250px", overflowY: "auto" }}
                    >
                      {books.filter((b) => (b.availableCopies > 0 || (b.status && b.status.toLowerCase().includes("avail")))).length === 0 ? (
                        <p className="text-muted mb-0">Không có sách sẵn có để cho mượn.</p>
                      ) : (
                        books
                          .filter((b) => (b.availableCopies > 0 || (b.status && b.status.toLowerCase().includes("avail"))))
                          .map((b) => {
                            const isChecked = selectedBookIds.includes(b.id);
                            return (
                              <div
                                key={b.id}
                                className="form-check d-flex align-items-center py-2 border-bottom"
                              >
                                <input
                                  className="form-check-input me-3 fs-5"
                                  type="checkbox"
                                  id={`book-check-${b.id}`}
                                  checked={isChecked}
                                  onChange={() => toggleBookSelection(b.id)}
                                />
                                <label
                                  className="form-check-label w-100 cursor-pointer"
                                  htmlFor={`book-check-${b.id}`}
                                >
                                  <strong>{b.title}</strong> —{" "}
                                  <span className="text-muted">{b.author || "Unknown"}</span>{" "}
                                  <span className="badge bg-success-subtle text-success ms-2">
                                    Còn {b.availableCopies ?? 1} cuốn
                                  </span>
                                </label>
                              </div>
                            );
                          })
                      )}
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="alert alert-info py-2 px-3 mb-0 small">
                      💡 Mỗi phiếu mượn có thể chọn <strong>từ 1 đến 5 quyển sách</strong> cùng lúc. Thời hạn mượn mặc định là 14 ngày.
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button
                  className="btn btn-secondary btn-lg px-4"
                  onClick={() => setShowBorrowModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-success btn-lg px-4 fw-semibold"
                  onClick={handleCreateBorrowTicket}
                  disabled={selectedBookIds.length === 0 || !borrowMemberId}
                >
                  ✅ Xác Nhận Tạo Phiếu Mượn ({selectedBookIds.length} cuốn)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Book Grid */}
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

                    {/* LIBRARIAN / ADMIN Actions */}
                    {isLibrarianOrAdmin && (
                      <>
                        {isAvail && (
                          <button
                            className="btn btn-success btn-sm w-100 fw-semibold"
                            onClick={() => openIssueModal(book)}
                          >
                            📖 Cho mượn (Issue Book)
                          </button>
                        )}
                        <div className="d-flex justify-content-between gap-2">
                          <button
                            className="btn btn-warning me-2 shadow-sm flex-fill btn-sm"
                            onClick={() => handleEdit(book)}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="btn btn-danger shadow-sm flex-fill btn-sm"
                            onClick={() => handleDelete(book.id)}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </>
                    )}

                    {/* READER Actions */}
                    {isReader && (
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

                    {/* Unauthenticated Actions */}
                    {!isLibrarianOrAdmin && !isReader && (
                      <button
                        className="btn btn-outline-primary btn-sm rounded-pill w-100"
                        onClick={() => navigate("/login")}
                      >
                        🔑 Đăng nhập để mượn
                      </button>
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
        .cursor-pointer {
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

export default BookCatalog;
