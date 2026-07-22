import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function BorrowingHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const memberId = localStorage.getItem("memberId");

      if (!memberId) {
        alert("Member ID not found in localStorage");
        setLoading(false);
        return;
      }

      const authHeader = { Authorization: token };

      // Fetch transactions only (includes both self and librarian-issued)
      const res = await axios.get(
        `http://localhost:8080/api/transactions/member/${memberId}`,
        { headers: authHeader }
      );

      // Map transactions
      const transactionHistory = res.data.map((r, index) => ({
        id: `txn-${r.id}-${index}`,
        title: r.book?.title || r.bookTitle,
        borrowDate: r.issueDate,
        dueDate: r.dueDate,
        returnDate: r.returnDate,
        status: r.status || r.transactionStatus,
        source:
          r.issuedBy === "LIBRARIAN" ? "Issued by Librarian" : "Self Borrowed",
        book: r.book, // Keep book object for additional details
      }));

      // Sort by borrow date descending
      transactionHistory.sort(
        (a, b) => new Date(b.borrowDate) - new Date(a.borrowDate)
      );

      setHistory(transactionHistory);
      setLoading(false);
    } catch (error) {
      console.error(error);
      alert("Failed to fetch borrowing history");
      setLoading(false);
    }
  };

  // Filter and search logic
  const filteredHistory = history.filter((record) => {
    const matchesFilter = filter === "ALL" || record.status === filter;
    const matchesSearch =
      record.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.book?.author?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStats = () => {
    return {
      total: history.length,
      returned: history.filter((r) => r.status === "RETURNED").length,
      borrowed: history.filter((r) => r.status === "BORROWED").length,
      overdue: history.filter((r) => r.status === "OVERDUE").length,
    };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading your borrowing history...</p>
        <style>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .loading-spinner {
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top: 4px solid white;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
          }
          .loading-text {
            color: white;
            font-size: 1.2rem;
            font-weight: 500;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <style>{`
        :root {
          --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          --card-bg: rgba(255, 255, 255, 0.95);
          --glass-bg: rgba(255, 255, 255, 0.1);
        }

        .history-page-bg {
          background: var(--primary-gradient);
          min-height: 100vh;
          position: relative;
        }

        .history-page-bg::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                      radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.15) 0%, transparent 50%);
          pointer-events: none;
        }

        .page-header {
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          position: sticky;
          top: 0;
          z-index: 1000;
        }

        .back-btn {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          border-radius: 12px;
          padding: 10px 20px;
          font-weight: 600;
          transition: all 0.3s ease;
          text-decoration: none;
        }

        .back-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          color: white;
          transform: translateY(-2px);
        }

        .stats-card {
          background: var(--glass-bg);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 20px;
          padding: 24px;
          text-align: center;
          color: white;
          transition: all 0.3s ease;
        }

        .stats-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .stats-number {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 8px;
          line-height: 1;
        }

        .stats-label {
          font-size: 0.9rem;
          opacity: 0.9;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 600;
        }

        .search-filter-section {
          background: var(--card-bg);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          padding: 24px;
          margin-bottom: 24px;
        }

        .search-input {
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 16px;
          padding: 12px 20px;
          font-size: 1rem;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .search-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          background: white;
        }

        .filter-btn {
          background: rgba(102, 126, 234, 0.1);
          border: 1px solid rgba(102, 126, 234, 0.3);
          color: #667eea;
          padding: 10px 20px;
          border-radius: 25px;
          margin: 0 5px 10px 0;
          transition: all 0.3s ease;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .filter-btn:hover {
          background: rgba(102, 126, 234, 0.2);
          color: #667eea;
          transform: translateY(-2px);
        }

        .filter-btn.active {
          background: #667eea;
          color: white;
          border-color: #667eea;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .history-container {
          background: var(--card-bg);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          position: relative;
          z-index: 1;
        }

        .history-card {
          background: #ffffff;
          border: 1px solid #e9ecef;
          border-radius: 16px;
          margin-bottom: 16px;
          padding: 24px;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          position: relative;
          overflow: hidden;
        }

        .history-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background: linear-gradient(135deg, #667eea, #764ba2);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .history-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          border-color: #dee2e6;
        }

        .history-card:hover::before {
          opacity: 1;
        }

        .book-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #2c3e50;
          margin-bottom: 8px;
          line-height: 1.3;
        }

        .book-meta {
          color: #6c757d;
          font-size: 0.9rem;
          margin-bottom: 16px;
        }

        .status-icon {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          margin-right: 16px;
          flex-shrink: 0;
        }

        .date-info {
          background: rgba(102, 126, 234, 0.1);
          padding: 8px 12px;
          border-radius: 8px;
          margin-bottom: 8px;
          font-size: 0.85rem;
        }

        .date-label {
          font-weight: 600;
          color: #667eea;
          margin-right: 8px;
        }

        .badge-custom {
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .source-badge {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 6px 12px;
          border-radius: 15px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: #6c757d;
        }

        .empty-state-icon {
          font-size: 4rem;
          opacity: 0.3;
          margin-bottom: 1rem;
        }

        .container-custom {
          position: relative;
          z-index: 1;
        }

        .page-title {
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 800;
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }

        @media (max-width: 768px) {
          .stats-card {
            margin-bottom: 1rem;
          }
          
          .history-card {
            padding: 16px;
          }
          
          .book-title {
            font-size: 1.1rem;
          }
        }
      `}</style>

      <div className="history-page-bg mt-5 pt-5">
        {/* Header */}
        <nav className="navbar navbar-expand-lg page-header mt-5 pt-5">
          <div className="container">
            <div className="d-flex align-items-center">
              <button className="back-btn me-3" onClick={() => navigate(-1)}>
                ← Back
              </button>
              <div>
                <h4 className="mb-0 text-white fw-bold">Borrowing History</h4>
                <small className="text-black-60">
                  Complete record of your book transactions
                </small>
              </div>
            </div>
          </div>
        </nav>

        <div className="container container-custom py-4">
          {/* Statistics Cards */}
          <div className="row mb-4">
            <div className="col-lg-3 col-md-6 mb-3">
              <div className="stats-card">
                <div className="stats-number">
                  {stats.borrowed + stats.returned}
                </div>
                <div className="stats-label">Total Books</div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 mb-3">
              <div className="stats-card">
                <div className="stats-number text-success">
                  {stats.returned}
                </div>
                <div className="stats-label">Returned</div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 mb-3">
              <div className="stats-card">
                <div className="stats-number text-primary">
                  {stats.borrowed}
                </div>
                <div className="stats-label">Currently Borrowed</div>
              </div>
            </div>
            {/* <div className="col-lg-3 col-md-6 mb-3">
              <div className="stats-card">
                <div className="stats-number text-danger">{stats.overdue}</div>
                <div className="stats-label">Overdue</div>
              </div>
            </div> */}
          </div>

          {/* Search and Filter Section */}
          <div className="search-filter-section">
            <div className="row align-items-center">
              <div className="col-md-6 mb-3 mb-md-0">
                <div className="position-relative">
                  <input
                    type="text"
                    className="form-control search-input"
                    placeholder="🔍 Search by book title or author..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="d-flex flex-wrap justify-content-md-end">
                  <button
                    className={`btn filter-btn ${
                      filter === "ALL" ? "active" : ""
                    }`}
                    onClick={() => setFilter("ALL")}
                  >
                    All ({stats.borrowed + stats.returned})
                  </button>
                  <button
                    className={`btn filter-btn ${
                      filter === "RETURNED" ? "active" : ""
                    }`}
                    onClick={() => setFilter("RETURNED")}
                  >
                    Returned ({stats.returned})
                  </button>
                  <button
                    className={`btn filter-btn ${
                      filter === "BORROWED" ? "active" : ""
                    }`}
                    onClick={() => setFilter("BORROWED")}
                  >
                    Borrowed ({stats.borrowed})
                  </button>
                  {/* <button
                    className={`btn filter-btn ${
                      filter === "OVERDUE" ? "active" : ""
                    }`}
                    onClick={() => setFilter("OVERDUE")}
                  >
                    Overdue ({stats.overdue})
                  </button> */}
                </div>
              </div>
            </div>
          </div>

          {/* History Content */}
          <div className="history-container p-4">
            {filteredHistory.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📚</div>
                <h5>No records found</h5>
                <p>
                  {searchTerm || filter !== "ALL"
                    ? "Try adjusting your search or filter criteria."
                    : "You haven't borrowed any books yet. Start exploring our collection!"}
                </p>
                {!searchTerm && filter === "ALL" && (
                  <button
                    className="btn btn-primary mt-3"
                    onClick={() => navigate("/book-catalog")}
                  >
                    Browse Books
                  </button>
                )}
              </div>
            ) : (
              <div className="row">
                {filteredHistory.map((record) => (
                  <div key={record.id} className="col-12">
                    <div className="history-card">
                      <div className="d-flex align-items-start">
                        <div
                          className="status-icon"
                          style={{
                            backgroundColor:
                              record.status === "RETURNED"
                                ? "#d1edff"
                                : record.status === "OVERDUE"
                                ? "#f8d7da"
                                : "#fff3cd",
                            color:
                              record.status === "RETURNED"
                                ? "#0c5460"
                                : record.status === "OVERDUE"
                                ? "#721c24"
                                : "#856404",
                          }}
                        >
                          {record.status === "RETURNED"
                            ? "✅"
                            : record.status === "OVERDUE"
                            ? "⚠️"
                            : "📖"}
                        </div>

                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div>
                              <h5 className="book-title">
                                {record.title || "Unknown Title"}
                              </h5>
                              {record.book?.author && (
                                <div className="book-meta">
                                  👤 <strong>Author:</strong>{" "}
                                  {record.book.author}
                                </div>
                              )}
                            </div>
                            <div className="d-flex gap-2">
                              <span
                                className={`badge-custom ${
                                  record.status === "RETURNED"
                                    ? "bg-success text-white"
                                    : record.status === "OVERDUE"
                                    ? "bg-danger text-white"
                                    : "bg-warning text-dark"
                                }`}
                              >
                                {record.status}
                              </span>
                            </div>
                          </div>

                          <div className="row">
                            <div className="col-md-4">
                              <div className="date-info">
                                <span className="date-label">📅 Borrowed:</span>
                                {new Date(
                                  record.borrowDate
                                ).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="col-md-4">
                              <div className="date-info">
                                <span className="date-label">📆 Due:</span>
                                {new Date(record.dueDate).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="col-md-4">
                              <div className="date-info">
                                <span className="date-label">↩️ Returned:</span>
                                {record.returnDate
                                  ? new Date(
                                      record.returnDate
                                    ).toLocaleDateString()
                                  : "-"}
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 d-flex justify-content-between align-items-center">
                            <span className="source-badge">
                              {record.source}
                            </span>
                            {record.book?.genre && (
                              <small className="text-muted">
                                🏷️ {record.book.genre}
                              </small>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default BorrowingHistory;
