import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function LibrarianBookManagement() {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [requests, setRequests] = useState([]);
  const [bookForm, setBookForm] = useState({
    title: "",
    author: "",
    genre: "",
    publisher: "",
    year: "",
    isbn: "",
    totalCopies: "",
    availableCopies: "",
    status: "AVAILABLE",
    coverImage: "",
  });
  const [returnData, setReturnData] = useState({
    bookCondition: "GOOD",
    damagePenalty: 0,
  });
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [activeTab, setActiveTab] = useState("books"); // "books" or "requests"

  const navigate = useNavigate();

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    if (!token) return {};
    return {
      Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
    };
  };

  useEffect(() => {
    fetchBooks();
    fetchRequests();
  }, []);

  const fetchBooks = async () => {
    try {
      const booksRes = await axios.get("http://localhost:8080/api/books", {
        headers: getAuthHeader(),
      });
      const booksData = booksRes.data;

      // fetch transactions for each book
      const booksWithTxns = await Promise.all(
        booksData.map(async (book) => {
          try {
            const txnRes = await axios.get(
              `http://localhost:8080/api/transactions/book/${book.id}`,
              { headers: getAuthHeader() }
            );
            return { ...book, transactions: txnRes.data };
          } catch {
            return { ...book, transactions: [] };
          }
        })
      );

      setBooks(booksWithTxns);
      setFilteredBooks(booksWithTxns);
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8080/api/requests/pending",
        {
          headers: getAuthHeader(),
        }
      );
      setRequests(res.data);
    } catch (err) {
      console.error("Error fetching requests:", err);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setBookForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setBookForm({
      title: "",
      author: "",
      genre: "",
      publisher: "",
      year: "",
      isbn: "",
      totalCopies: "",
      availableCopies: "",
      status: "AVAILABLE",
      coverImage: "",
    });
  };

  // Add or Update Book
  const handleAddBook = async () => {
    try {
      await axios.post("http://localhost:8080/api/books", bookForm, {
        headers: getAuthHeader(),
      });
      alert("✅ Book added successfully!");
      setShowModal(false);
      resetForm();
      fetchBooks();
    } catch (error) {
      console.error("Error adding book:", error);
      alert("❌ Failed to add book. Make sure all fields are valid.");
    }
  };

  const handleUpdateBook = async () => {
    try {
      await axios.put(
        `http://localhost:8080/api/books/${editingBook.id}`,
        bookForm,
        { headers: getAuthHeader() }
      );
      alert("✅ Book updated successfully!");
      setShowModal(false);
      resetForm();
      setEditingBook(null);
      fetchBooks();
    } catch (error) {
      console.error("Error updating book:", error);
      alert("❌ Failed to update book");
    }
  };

  const handleDeleteBook = async (id) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;
    try {
      await axios.delete(`http://localhost:8080/api/books/${id}`, {
        headers: getAuthHeader(),
      });
      alert("✅ Book deleted successfully!");
      fetchBooks();
    } catch (error) {
      console.error("Error deleting book:", error);
      alert("❌ Failed to delete book");
    }
  };

  // ISSUE BOOK
  const openIssueModal = (book) => {
    const memberId = prompt("Enter Member ID to issue the book:");
    if (!memberId) return;
    axios
      .post(
        `http://localhost:8080/api/transactions/issue/${memberId}/${book.id}`,
        {},
        { headers: getAuthHeader() }
      )
      .then(() => {
        alert("✅ Book issued successfully!");
        fetchBooks();
      })
      .catch((err) => {
        console.error(err);
        alert("❌ Failed to issue book");
      });
  };

  // RETURN BOOK
  const openReturnModal = (txn) => {
    setSelectedTxn(txn);
    setReturnData({ bookCondition: "GOOD", damagePenalty: 0 });
    setShowReturnModal(true);
  };

  const handleReturnBook = () => {
    if (!selectedTxn) return;
    axios
      .post(
        `http://localhost:8080/api/transactions/return/${selectedTxn.id}?bookCondition=${returnData.bookCondition}&damagePenalty=${returnData.damagePenalty}`,
        {},
        { headers: getAuthHeader() }
      )
      .then(() => {
        alert("✅ Book returned successfully!");
        setShowReturnModal(false);
        setSelectedTxn(null);
        fetchBooks();
      })
      .catch((err) => {
        console.error(err);
        alert("❌ Failed to return book");
      });
  };

  // RENEW BOOK
  const openRenewModal = (txn) => {
    const extraDays = parseInt(
      prompt("Enter number of extra days for renewal:", "7")
    );
    if (!extraDays || extraDays <= 0) return;
    axios
      .post(
        `http://localhost:8080/api/transactions/renew/${txn.id}?extraDays=${extraDays}`,
        {},
        { headers: getAuthHeader() }
      )
      .then(() => {
        alert("✅ Book renewed successfully!");
        fetchBooks();
      })
      .catch((err) => {
        console.error(err);
        alert("❌ Failed to renew book");
      });
  };

  // Approve / Reject Requests
  const handleApproveRequest = async (requestId) => {
    try {
      await axios.put(
        `http://localhost:8080/api/requests/${requestId}/approve`,
        {},
        { headers: getAuthHeader() }
      );
      alert("✅ Request approved and book issued!");
      fetchRequests();
      fetchBooks();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to approve request");
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await axios.put(
        `http://localhost:8080/api/requests/${requestId}/reject`,
        {},
        { headers: getAuthHeader() }
      );
      alert("❌ Request rejected");
      fetchRequests();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to reject request");
    }
  };

  // Search
  useEffect(() => {
    setFilteredBooks(
      books.filter(
        (book) =>
          book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.author.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, books]);

  return (
    <div className="min-vh-100 bg-gradient-subtle">
      <div className="container-fluid px-4 py-5">
        {/* Header Section */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="text-center mb-4">
              <h1 className="display-4 fw-bold text-gradient mb-3">
                📚 Library Management System
              </h1>
              <p className="lead text-muted">
                Manage books, transactions, and member requests efficiently
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="row justify-content-center mb-5">
          <div className="col-auto">
            <div className="nav-pills-modern d-flex gap-2 p-2 bg-white rounded-pill shadow-sm">
              <button
                className={`btn rounded-pill px-4 py-2 fw-semibold transition-all ${
                  activeTab === "books"
                    ? "btn-primary-gradient text-white shadow"
                    : "btn-ghost text-muted"
                }`}
                onClick={() => setActiveTab("books")}
              >
                📖 Books Management
              </button>
              <button
                className={`btn rounded-pill px-4 py-2 fw-semibold transition-all position-relative ${
                  activeTab === "requests"
                    ? "btn-primary-gradient text-white shadow"
                    : "btn-ghost text-muted"
                }`}
                onClick={() => setActiveTab("requests")}
              >
                ⏰ Pending Requests
                {requests.length > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {requests.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Books Tab */}
        {activeTab === "books" && (
          <>
            {/* Control Panel */}
            <div className="row mb-4">
              <div className="col-12">
                <div className="card border-0 shadow-sm rounded-3 bg-white">
                  <div className="card-body p-4">
                    <div className="row align-items-center g-3">
                      <div className="col-md-8">
                        <div className="position-relative">
                          <span className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted">
                            🔍
                          </span>
                          <input
                            type="text"
                            placeholder="Search by title or author..."
                            className="form-control form-control-lg ps-5 border-0 bg-light rounded-pill"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="col-md-4 text-end">
                        <button
                          className="btn btn-primary-gradient btn-lg px-4 rounded-pill fw-semibold shadow"
                          onClick={() => {
                            resetForm();
                            setEditingBook(null);
                            setShowModal(true);
                          }}
                        >
                          ➕ Add New Book
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Low Stock Alert */}
            <div className="row mb-4 justify-content-center">
              {books.filter(
                (b) => b.availableCopies === 1 || b.availableCopies === 2
              ).length > 0 && (
                <div className="col-12">
                  <div className="card border-0 shadow-sm rounded-3 bg-danger-subtle">
                    <div className="card-body text-center">
                      <h5 className="mb-4 text-danger fw-bold">
                        ⚠️ Low Stock Alert
                      </h5>

                      <div className="d-flex flex-wrap justify-content-center gap-3">
                        {books
                          .filter(
                            (b) =>
                              b.availableCopies === 1 || b.availableCopies === 2
                          )
                          .map((book, idx) => (
                            <div
                              key={idx}
                              className="low-stock-card d-flex align-items-center p-3 border rounded bg-white shadow-lg"
                              style={{ width: "300px" }}
                            >
                              {/* Book Cover */}
                              <div className="flex-shrink-0 me-3">
                                {book.coverImage || book.isbn ? (
                                  <img
                                    src={
                                      book.coverImage
                                        ? book.coverImage
                                        : `https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg`
                                    }
                                    alt={book.title}
                                    className="rounded"
                                    style={{
                                      width: "60px",
                                      height: "90px",
                                      objectFit: "cover",
                                    }}
                                  />
                                ) : (
                                  <div
                                    className="d-flex align-items-center justify-content-center bg-gradient-secondary rounded"
                                    style={{ width: "60px", height: "90px" }}
                                  >
                                    <span className="text-white fs-4">📚</span>
                                  </div>
                                )}
                              </div>

                              {/* Book Info */}
                              <div className="flex-grow-1 text-start">
                                <div className="fw-bold text-dark">
                                  {book.title}
                                </div>
                                <div className="text-muted small">
                                  {book.author}
                                </div>
                                <div className="text-danger fw-semibold">
                                  Only {book.availableCopies} left
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Add this CSS to your App.css or component CSS */}
            <style>
              {`
  .low-stock-card {
    opacity: 0;
    transform: translateY(15px);
    animation: fadeInUp 0.6s ease forwards;
  }

  .low-stock-card:nth-child(1) { animation-delay: 0.1s; }
  .low-stock-card:nth-child(2) { animation-delay: 0.2s; }
  .low-stock-card:nth-child(3) { animation-delay: 0.3s; }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(15px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`}
            </style>

            {/* Books Grid */}
            <div className="row g-4">
              {filteredBooks.map((book) => (
                <div key={book.id} className="col-lg-4 col-md-6">
                  <div className="card book-card h-100 border-0 shadow-hover rounded-4 overflow-hidden">
                    {/* Book Cover */}
                    <div className="book-cover-container position-relative">
                      {book.coverImage || book.isbn ? (
                        <img
                          src={
                            book.coverImage
                              ? book.coverImage
                              : `https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg`
                          }
                          alt={book.title}
                          className="card-img-top book-cover"
                        />
                      ) : (
                        <div className="book-cover bg-gradient-secondary d-flex align-items-center justify-content-center">
                          <span className="text-white display-4">📚</span>
                        </div>
                      )}

                      {/* Status Badge */}
                      <div className="position-absolute top-0 end-0 m-3">
                        <span
                          className={`badge rounded-pill px-3 py-2 ${
                            book.status === "AVAILABLE"
                              ? "bg-success-soft text-success"
                              : "bg-danger-soft text-danger"
                          }`}
                        >
                          {book.status}
                        </span>
                      </div>
                    </div>

                    {/* Book Info */}
                    <div className="card-body p-4 d-flex flex-column">
                      <h5 className="card-title fw-bold text-dark mb-2 line-clamp-2">
                        {book.title}
                      </h5>

                      <div className="book-details mb-3 flex-grow-1">
                        <p className="text-muted mb-2">
                          👤 <strong>Author:</strong> {book.author}
                        </p>
                        <p className="text-muted mb-2">
                          📊 <strong>Stock:</strong>
                          <span
                            className={`ms-1 fw-semibold ${
                              book.availableCopies === 0
                                ? "text-danger"
                                : "text-success"
                            }`}
                          >
                            {book.availableCopies}/{book.totalCopies}
                          </span>
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="action-buttons">
                        <div className="d-flex gap-2 mb-2">
                          <button
                            className="btn btn-outline-primary btn-sm flex-fill"
                            onClick={() => {
                              setEditingBook(book);
                              setBookForm(book);
                              setShowModal(true);
                            }}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="btn btn-success btn-sm flex-fill"
                            onClick={() => openIssueModal(book)}
                            disabled={book.availableCopies === 0}
                          >
                            📖 Issue
                          </button>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDeleteBook(book.id)}
                          >
                            🗑️
                          </button>
                        </div>

                        {/* Transaction History Button */}
                        <button
                          className="btn btn-outline-info btn-sm w-100 mb-2"
                          onClick={() =>
                            navigate(`/transactions/book/${book.id}`)
                          }
                        >
                          📜 View Transaction History
                        </button>

                        {/* Return Buttons for Active Transactions */}
                        {book.transactions &&
                          book.transactions
                            .filter((txn) => txn.status === "BORROWED")
                            .map((txn) => (
                              <button
                                key={txn.id}
                                className="btn btn-warning btn-sm w-100 mb-1"
                                onClick={() => openReturnModal(txn)}
                              >
                                🔄 Return Book (ID: {txn.id})
                              </button>
                            ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {filteredBooks.length === 0 && (
                <div className="col-12">
                  <div className="text-center py-5">
                    <div className="display-1 text-muted mb-3 opacity-50">
                      🔍
                    </div>
                    <h4 className="text-muted">No books found</h4>
                    <p className="text-muted">
                      Try adjusting your search criteria or add new books to the
                      library.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Requests Tab */}
        {activeTab === "requests" && (
          <div className="row">
            <div className="col-12">
              {requests.length === 0 ? (
                <div className="text-center py-5">
                  <div className="display-1 text-success mb-3 opacity-50">
                    ✅
                  </div>
                  <h4 className="text-muted">No pending requests</h4>
                  <p className="text-muted">
                    All requests have been processed. Great job!
                  </p>
                </div>
              ) : (
                <div className="card border-0 shadow-sm rounded-3">
                  <div className="card-header bg-white border-0 p-4">
                    <h5 className="mb-0 fw-bold">
                      ⏰ Pending Book Requests ({requests.length})
                    </h5>
                  </div>
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead className="table-light">
                          <tr>
                            <th className="border-0 py-3 px-4">Request ID</th>
                            <th className="border-0 py-3">Member</th>
                            <th className="border-0 py-3">Book Title</th>
                            <th className="border-0 py-3">Request Date</th>
                            <th className="border-0 py-3">Status</th>
                            <th className="border-0 py-3 text-center">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {requests.map((req) => (
                            <tr key={req.id} className="border-bottom">
                              <td className="py-3 px-4 fw-semibold">
                                #{req.id}
                              </td>
                              <td className="py-3">
                                <span className="badge bg-info-soft text-info px-2 py-1">
                                  Member ID: {req.member?.id}
                                </span>
                              </td>
                              <td className="py-3 fw-medium">
                                {req.book?.title}
                              </td>
                              <td className="py-3 text-muted">
                                {req.requestDate}
                              </td>
                              <td className="py-3">
                                <span className="badge bg-warning-soft text-warning px-2 py-1">
                                  {req.status}
                                </span>
                              </td>
                              <td className="py-3 text-center">
                                <div className="btn-group" role="group">
                                  <button
                                    className="btn btn-success btn-sm me-1"
                                    onClick={() => handleApproveRequest(req.id)}
                                  >
                                    ✅ Approve
                                  </button>
                                  <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleRejectRequest(req.id)}
                                  >
                                    ❌ Reject
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div
            className="modal show d-block"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-xl modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg rounded-4">
                <div className="modal-header border-0 pb-0">
                  <h4 className="modal-title fw-bold">
                    {editingBook ? "✏️ Edit Book" : "➕ Add New Book"}
                  </h4>
                  <button
                    className="btn-close"
                    onClick={() => {
                      setShowModal(false);
                      setEditingBook(null);
                      resetForm();
                    }}
                  ></button>
                </div>
                <div className="modal-body p-4">
                  <div className="row g-4">
                    {[
                      {
                        field: "title",
                        label: "Book Title",
                        type: "text",
                        icon: "📖",
                      },
                      {
                        field: "author",
                        label: "Author",
                        type: "text",
                        icon: "👤",
                      },
                      {
                        field: "genre",
                        label: "Genre",
                        type: "text",
                        icon: "🏷️",
                      },
                      {
                        field: "publisher",
                        label: "Publisher",
                        type: "text",
                        icon: "🏢",
                      },
                      {
                        field: "year",
                        label: "Publication Year",
                        type: "number",
                        icon: "📅",
                      },
                      {
                        field: "isbn",
                        label: "ISBN",
                        type: "text",
                        icon: "🔢",
                      },
                      {
                        field: "totalCopies",
                        label: "Total Copies",
                        type: "number",
                        icon: "📚",
                      },
                      {
                        field: "availableCopies",
                        label: "Available Copies",
                        type: "number",
                        icon: "✅",
                      },
                    ].map(({ field, label, type, icon }) => (
                      <div className="col-md-6" key={field}>
                        <label className="form-label fw-semibold">
                          {icon} {label}
                        </label>
                        <input
                          type={type}
                          name={field}
                          className="form-control form-control-lg"
                          value={bookForm[field]}
                          onChange={handleFormChange}
                          placeholder={`Enter ${label.toLowerCase()}`}
                        />
                      </div>
                    ))}

                    <div className="col-12">
                      <label className="form-label fw-semibold">
                        🖼️ Cover Image URL
                      </label>
                      <input
                        type="text"
                        name="coverImage"
                        className="form-control form-control-lg"
                        value={bookForm.coverImage}
                        onChange={handleFormChange}
                        placeholder="Enter cover image URL"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        ⚙️ Status
                      </label>
                      <select
                        name="status"
                        className="form-select form-select-lg"
                        value={bookForm.status}
                        onChange={handleFormChange}
                      >
                        <option value="AVAILABLE">Available</option>
                        <option value="UNAVAILABLE">Unavailable</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button
                    className="btn btn-secondary btn-lg px-4"
                    onClick={() => {
                      setShowModal(false);
                      setEditingBook(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary-gradient btn-lg px-4 fw-semibold"
                    onClick={editingBook ? handleUpdateBook : handleAddBook}
                  >
                    {editingBook ? "✅ Update Book" : "➕ Add Book"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Return Modal */}
        {showReturnModal && selectedTxn && (
          <div
            className="modal show d-block"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg rounded-4">
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-bold">
                    🔄 Return Book (Transaction #{selectedTxn.id})
                  </h5>
                  <button
                    className="btn-close"
                    onClick={() => setShowReturnModal(false)}
                  ></button>
                </div>
                <div className="modal-body p-4">
                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      📋 Book Condition
                    </label>
                    <select
                      className="form-select form-select-lg"
                      value={returnData.bookCondition}
                      onChange={(e) =>
                        setReturnData({
                          ...returnData,
                          bookCondition: e.target.value,
                        })
                      }
                    >
                      <option value="GOOD">Good Condition</option>
                      <option value="DAMAGED">Damaged</option>
                    </select>
                  </div>

                  {returnData.bookCondition === "DAMAGED" && (
                    <div className="mb-4">
                      <label className="form-label fw-semibold text-warning">
                        ⚠️ Damage Penalty Amount
                      </label>
                      <div className="input-group input-group-lg">
                        <span className="input-group-text">$</span>
                        <input
                          type="number"
                          className="form-control"
                          value={returnData.damagePenalty}
                          onChange={(e) =>
                            setReturnData({
                              ...returnData,
                              damagePenalty: e.target.value,
                            })
                          }
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button
                    className="btn btn-secondary btn-lg"
                    onClick={() => setShowReturnModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-success btn-lg fw-semibold"
                    onClick={handleReturnBook}
                  >
                    ✅ Process Return
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Styles */}
      <style>{`
        /* Background and Layout */
        .bg-gradient-subtle {
          background: linear-gradient(135deg, #f8f9ff 0%, #e3f2fd 100%);
          min-height: 100vh;
        }

        /* Text Gradients */
        .text-gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Button Gradients */
        .btn-primary-gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          color: white;
          transition: all 0.3s ease;
        }
        .btn-primary-gradient:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
          color: white;
        }

        .btn-ghost {
          background: transparent;
          border: none;
          transition: all 0.3s ease;
        }
        .btn-ghost:hover {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea !important;
        }

        /* Card Enhancements */
        .book-card {
          transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
          border: 1px solid rgba(0,0,0,0.05);
        }
        .book-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }

        .shadow-hover {
          box-shadow: 0 4px 15px rgba(0,0,0,0.08);
        }
        .shadow-hover:hover {
          box-shadow: 0 15px 35px rgba(0,0,0,0.2);
        }

        /* Book Cover Styling */
        .book-cover-container {
          height: 280px;
          overflow: hidden;
        }
        .book-cover {
          height: 100%;
          width: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        .book-card:hover .book-cover {
          transform: scale(1.05);
        }

        .bg-gradient-secondary {
          background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
        }

        /* Badge Styles */
        .bg-success-soft {
          background-color: #d1f2eb !important;
        }
        .bg-danger-soft {
          background-color: #fadbd8 !important;
        }
        .bg-info-soft {
          background-color: #d1ecf1 !important;
        }
        .bg-warning-soft {
          background-color: #fef9e7 !important;
        }

        /* Text Utilities */
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Navigation Pills */
        .nav-pills-modern {
          backdrop-filter: blur(10px);
        }

        /* Modal Enhancements */
        .modal-content {
          backdrop-filter: blur(10px);
        }

        /* Table Enhancements */
        .table-hover tbody tr:hover {
          background-color: rgba(102, 126, 234, 0.05);
          transform: scale(1.01);
          transition: all 0.2s ease;
        }

        /* Form Enhancements */
        .form-control:focus, .form-select:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 0.25rem rgba(102, 126, 234, 0.15);
        }

        /* Action Button Animations */
        .action-buttons .btn {
          transition: all 0.2s ease;
        }
        .action-buttons .btn:hover {
          transform: translateY(-2px);
        }

        /* Responsive Adjustments */
        @media (max-width: 768px) {
          .display-4 {
            font-size: 2.5rem;
          }
          .btn-lg {
            padding: 0.75rem 1.5rem;
          }
          .book-cover-container {
            height: 240px;
          }
          .nav-pills-modern {
            flex-direction: column;
            gap: 0.5rem;
          }
          .nav-pills-modern .btn {
            width: 100%;
          }
        }

        /* Loading and Animation States */
        .transition-all {
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }

        /* Custom Scrollbar */
        .table-responsive::-webkit-scrollbar {
          height: 8px;
        }
        .table-responsive::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        .table-responsive::-webkit-scrollbar-thumb {
          background: #667eea;
          border-radius: 4px;
        }
        .table-responsive::-webkit-scrollbar-thumb:hover {
          background: #5a6fd8;
        }

        /* Status Indicators */
        .badge {
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        /* Card Body Enhancements */
        .card-body {
          position: relative;
        }

        /* Button Group Enhancements */
        .btn-group .btn:not(:last-child) {
          margin-right: 0.25rem;
        }

        /* Empty State Styling */
        .opacity-50 {
          opacity: 0.5;
        }

        /* Focus States */
        .btn:focus {
          box-shadow: 0 0 0 0.25rem rgba(102, 126, 234, 0.25);
        }

        /* Hover Effects for Cards */
        .card {
          position: relative;
          overflow: hidden;
        }
        .card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #667eea, #764ba2);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }
        .card:hover::before {
          transform: scaleX(1);
        }

        /* Button Disabled State */
        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Modal Animation */
        .modal.show .modal-dialog {
          animation: modalSlideIn 0.3s ease-out;
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Search Input Enhancement */
        .form-control-lg {
          font-size: 1.1rem;
          padding: 0.75rem 1rem;
        }

        /* Badge Animation */
        .badge {
          animation: fadeIn 0.3s ease-in;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* Table Row Animation */
        tbody tr {
          transition: all 0.2s ease;
        }

        /* Card Header Enhancement */
        .card-header {
          background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
        }

        /* Input Group Enhancement */
        .input-group-text {
          background-color: #667eea;
          color: white;
          border-color: #667eea;
        }

        /* Success/Error States */
        .text-success {
          color: #28a745 !important;
        }
        .text-danger {
          color: #dc3545 !important;
        }
        .text-warning {
          color: #ffc107 !important;
        }
        .text-info {
          color: #17a2b8 !important;
        }
      `}</style>
    </div>
  );
}

export default LibrarianBookManagement;
