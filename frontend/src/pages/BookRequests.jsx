// src/pages/BookRequests.jsx
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function BookRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const navigate = useNavigate();

  // Fetch requests data
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const memberId = localStorage.getItem("memberId");
        const token = localStorage.getItem("token");

        const response = await axios.get(
          `http://localhost:8080/api/requests/member/${memberId}`,
          { headers: { Authorization: token } }
        );
        setRequests(response.data);
      } catch (err) {
        console.error("Failed to fetch requests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  // Filter requests based on selected filter
  const filteredRequests = requests.filter((req) => {
    if (filter === "ALL") return true;
    return req.status === filter;
  });

  const getStatusStats = () => {
    return {
      total: requests.length,
      pending: requests.filter((r) => r.status === "PENDING").length,
      approved: requests.filter((r) => r.status === "APPROVED").length,
      rejected: requests.filter((r) => r.status === "REJECTED").length,
    };
  };

  const stats = getStatusStats();

  return (
    <>
      <style>{`
        .requests-page-bg {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
        }

        .page-header {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .requests-container {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          margin-top: 2rem;
        }

        .request-card {
          background: #ffffff;
          border: 1px solid #e9ecef;
          border-radius: 16px;
          margin-bottom: 20px;
          padding: 24px;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .request-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          border-color: #dee2e6;
        }

        .status-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
          margin-right: 20px;
          flex-shrink: 0;
        }

        .filter-btn {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 8px 20px;
          border-radius: 25px;
          margin: 0 5px;
          transition: all 0.3s ease;
          font-weight: 600;
        }

        .filter-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          color: white;
        }

        .filter-btn.active {
          background: white;
          color: #667eea;
          border-color: white;
        }

        .stat-card-small {
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 16px;
          padding: 20px;
          text-align: center;
          color: white;
          margin-bottom: 1rem;
        }

        .stat-number {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 5px;
        }

        .stat-label {
          font-size: 0.9rem;
          opacity: 0.8;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .back-btn {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          border-radius: 12px;
          padding: 10px 20px;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .back-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          color: white;
          transform: translateY(-2px);
        }

        .loading-spinner {
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top: 4px solid white;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
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

        .badge-custom {
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      `}</style>

      <div className="requests-page-bg mt-5 pt-5">
        {/* Header */}
        <nav className="navbar navbar-expand-lg page-header mt-5 pt-5">
          <div className="container">
            <div className="d-flex align-items-center">
              <button className="back-btn me-3" onClick={() => navigate(-1)}>
                ← Back
              </button>
              <div>
                <h4 className="mb-0 text-white fw-bold">My Book Requests</h4>
                <small className="text-white-50">
                  Complete history of your book requests
                </small>
              </div>
            </div>
          </div>
        </nav>

        <div className="container py-4">
          {/* Statistics Row */}
          <div className="row mb-4">
            <div className="col-lg-3 col-md-6 mb-3">
              <div className="stat-card-small">
                <div className="stat-number">{stats.total}</div>
                <div className="stat-label">Total Requests</div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 mb-3">
              <div className="stat-card-small">
                <div className="stat-number text-warning">{stats.pending}</div>
                <div className="stat-label">Pending</div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 mb-3">
              <div className="stat-card-small">
                <div className="stat-number text-success">{stats.approved}</div>
                <div className="stat-label">Approved</div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 mb-3">
              <div className="stat-card-small">
                <div className="stat-number text-danger">{stats.rejected}</div>
                <div className="stat-label">Rejected</div>
              </div>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="text-center mb-4">
            <button
              className={`filter-btn ${filter === "ALL" ? "active" : ""}`}
              onClick={() => setFilter("ALL")}
            >
              All ({stats.total})
            </button>
            <button
              className={`filter-btn ${filter === "PENDING" ? "active" : ""}`}
              onClick={() => setFilter("PENDING")}
            >
              Pending ({stats.pending})
            </button>
            <button
              className={`filter-btn ${filter === "APPROVED" ? "active" : ""}`}
              onClick={() => setFilter("APPROVED")}
            >
              Approved ({stats.approved})
            </button>
            <button
              className={`filter-btn ${filter === "REJECTED" ? "active" : ""}`}
              onClick={() => setFilter("REJECTED")}
            >
              Rejected ({stats.rejected})
            </button>
          </div>

          {/* Requests Content */}
          <div className="requests-container p-4">
            {loading ? (
              <div className="text-center py-5">
                <div className="loading-spinner"></div>
                <p className="text-muted mt-3">Loading your requests...</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📝</div>
                <h5>No requests found</h5>
                <p>
                  {filter === "ALL"
                    ? "You haven't made any book requests yet. Visit the book catalog to request books!"
                    : `No ${filter.toLowerCase()} requests found.`}
                </p>
                {filter === "ALL" && (
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
                {filteredRequests.map((req, idx) => (
                  <div key={idx} className="col-12">
                    <div className="request-card">
                      <div className="d-flex align-items-start">
                        <div
                          className="status-icon"
                          style={{
                            backgroundColor:
                              req.status === "PENDING"
                                ? "#fff3cd"
                                : req.status === "APPROVED"
                                ? "#d1edff"
                                : "#f8d7da",
                            color:
                              req.status === "PENDING"
                                ? "#856404"
                                : req.status === "APPROVED"
                                ? "#0c5460"
                                : "#721c24",
                          }}
                        >
                          {req.status === "PENDING"
                            ? "⏳"
                            : req.status === "APPROVED"
                            ? "✅"
                            : "❌"}
                        </div>

                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <h4 className="fw-bold text-dark mb-2">
                              {req.book.title}
                            </h4>
                            <span
                              className={`badge-custom ${
                                req.status === "PENDING"
                                  ? "bg-warning text-dark"
                                  : req.status === "APPROVED"
                                  ? "bg-success text-white"
                                  : "bg-danger text-white"
                              }`}
                            >
                              {req.status}
                            </span>
                          </div>

                          <div className="row">
                            <div className="col-md-6">
                              <div className="mb-3">
                                <h6 className="text-primary mb-1">
                                  📅 Request Date
                                </h6>
                                <p className="text-muted mb-0">
                                  {new Date(
                                    req.requestDate
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                              {req.book.author && (
                                <div className="mb-3">
                                  <h6 className="text-secondary mb-1">
                                    👤 Author
                                  </h6>
                                  <p className="text-muted mb-0">
                                    {req.book.author}
                                  </p>
                                </div>
                              )}
                              {req.book.isbn && (
                                <div className="mb-3">
                                  <h6 className="text-info mb-1">📖 ISBN</h6>
                                  <p className="text-muted mb-0">
                                    {req.book.isbn}
                                  </p>
                                </div>
                              )}
                            </div>
                            <div className="col-md-6">
                              {req.approvedDate &&
                                req.status === "APPROVED" && (
                                  <div className="mb-3">
                                    <h6 className="text-success mb-1">
                                      ✅ Approved Date
                                    </h6>
                                    <p className="text-muted mb-0">
                                      {new Date(
                                        req.approvedDate
                                      ).toLocaleDateString()}
                                    </p>
                                  </div>
                                )}
                              {req.rejectedDate &&
                                req.status === "REJECTED" && (
                                  <div className="mb-3">
                                    <h6 className="text-danger mb-1">
                                      ❌ Rejected Date
                                    </h6>
                                    <p className="text-muted mb-0">
                                      {new Date(
                                        req.rejectedDate
                                      ).toLocaleDateString()}
                                    </p>
                                  </div>
                                )}
                              {req.book.genre && (
                                <div className="mb-3">
                                  <h6 className="text-warning mb-1">
                                    🏷️ Genre
                                  </h6>
                                  <p className="text-muted mb-0">
                                    {req.book.genre}
                                  </p>
                                </div>
                              )}
                              {req.book.publicationYear && (
                                <div className="mb-3">
                                  <h6 className="text-secondary mb-1">
                                    📅 Published
                                  </h6>
                                  <p className="text-muted mb-0">
                                    {req.book.publicationYear}
                                  </p>
                                </div>
                              )}
                            </div>
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

export default BookRequests;
