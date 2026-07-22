// src/pages/MemberDashboard.jsx
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function MemberDashboard() {
  const [username] = useState(localStorage.getItem("username") || "John Doe");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [penalties, setPenalties] = useState([]);
  const [totalPenalty, setTotalPenalty] = useState(0);
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [borrowingLimit, setBorrowingLimit] = useState(5);
  const [memberData, setMemberData] = useState(null);
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();

  // Clock update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch member data
  useEffect(() => {
    const fetchMemberData = async () => {
      try {
        const memberId = localStorage.getItem("memberId");
        const token = localStorage.getItem("token");

        // Member details
        const memberResp = await axios.get(
          `http://localhost:8080/api/membership/members/${memberId}`,
          { headers: { Authorization: token } }
        );
        setBorrowingLimit(memberResp.data.membershipPlan.borrowingLimit);
        setMemberData(memberResp.data);

        // Borrowing history
        const historyResp = await axios.get(
          `http://localhost:8080/api/transactions/member/${memberId}`,
          { headers: { Authorization: token } }
        );
        let filteredHistory = historyResp.data.map((record) => ({
          ...record,
          issuedBy: record.issuedBy === "LIBRARIAN" ? "Librarian" : "Self",
        }));
        setIssuedBooks(filteredHistory);

        // Penalties
        const penaltyResp = await axios.get(
          `http://localhost:8080/api/borrow/penalties/${memberId}`,
          { headers: { Authorization: token } }
        );
        const penaltyData = penaltyResp.data;
        setPenalties(penaltyData);
        const total = penaltyData.reduce((sum, p) => sum + p.amount, 0);
        setTotalPenalty(total);

        // Book requests
        const requestsResp = await axios.get(
          `http://localhost:8080/api/requests/member/${memberId}`,
          { headers: { Authorization: token } }
        );
        setRequests(requestsResp.data);

        // Refresh issued books if any request approved
        const hasApproved = requestsResp.data.some(
          (r) => r.status === "APPROVED"
        );
        if (hasApproved) {
          const latestHistoryResp = await axios.get(
            `http://localhost:8080/api/transactions/member/${memberId}`,
            { headers: { Authorization: token } }
          );
          filteredHistory = latestHistoryResp.data.map((record) => ({
            ...record,
            issuedBy:
              record.issuedBy === "LIBRARIAN" ? "Librarian" : "Self Borrowed",
          }));
          setIssuedBooks(filteredHistory);
        }
      } catch (err) {
        console.error("Failed to fetch member data:", err);
      }
    };

    fetchMemberData();
  }, []);

  const goToManageBooks = () => navigate("/book-catalog");

  const totalIssued = issuedBooks.filter(
    (b) => b.status === "BORROWED" || b.status === "OVERDUE"
  ).length;
  const dueBooksCount = totalIssued;

  const recentActivity = issuedBooks
    .sort((a, b) => new Date(b.borrowDate) - new Date(a.borrowDate))
    .slice(0, 3);

  const handleRenewMembership = async () => {
    if (!memberData) return;
    const memberId = memberData.id;
    const token = localStorage.getItem("token");

    try {
      const response = await axios.put(
        `http://localhost:8080/api/membership/members/${memberId}/renew`,
        {},
        { headers: { Authorization: token } }
      );
      setMemberData(response.data);
      alert(
        `Membership renewed! New expiry date: ${new Date(
          response.data.endDate
        ).toLocaleDateString()}`
      );
    } catch (err) {
      console.error("Failed to renew membership:", err);
      alert("Failed to renew membership. Please try again.");
    }
  };

  const handleViewRequests = () => {
    navigate("/book-requests");
  };

  return (
    <>
      <style>{`
        :root {
          --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          --secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          --success-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          --warning-gradient: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
          --danger-gradient: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
          --dark-gradient: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
        }

        .dashboard-bg {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          position: relative;
        }

        .dashboard-bg::before {
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

        .glass-morphism {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border-radius: 20px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .glass-morphism:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
          background: rgba(255, 255, 255, 0.2);
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(15px);
          border: none;
          border-radius: 24px;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--primary-gradient);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        .stat-card:hover::before {
          transform: scaleX(1);
        }

        .stat-card:hover {
          transform: translateY(-10px) scale(1.02);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
        }

        .icon-container {
          width: 70px;
          height: 70px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          margin-bottom: 1rem;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .icon-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
          transition: left 0.5s;
        }

        .stat-card:hover .icon-container::before {
          left: 100%;
        }

        .action-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 20px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          overflow: hidden;
          position: relative;
        }

        .action-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }

        .action-card:hover::before {
          left: 100%;
        }

        .action-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
          border-color: rgba(255, 255, 255, 0.5);
        }

        .activity-section {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .activity-item {
          background: rgba(255, 255, 255, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 16px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .activity-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.1), transparent);
          transition: left 0.3s;
        }

        .activity-item:hover::before {
          left: 100%;
        }

        .activity-item:hover {
          transform: translateX(8px);
          background: rgba(255, 255, 255, 0.8);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        .header-nav {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .badge-modern {
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 0.75rem;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .notification-dot {
          width: 12px;
          height: 12px;
          background: linear-gradient(135deg, #ff6b6b, #ee5a52);
          border-radius: 50%;
          position: absolute;
          top: 5px;
          right: 5px;
          border: 2px solid white;
          animation: pulse-notification 2s infinite;
        }

        @keyframes pulse-notification {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }

        .penalty-card {
          background: var(--danger-gradient);
          color: white;
          border-radius: 24px;
          box-shadow: 0 10px 30px rgba(255, 107, 107, 0.3);
        }

        .penalty-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(255, 107, 107, 0.4);
        }

        .welcome-text {
          background: linear-gradient(135deg, #d4d7e3ff, #331354ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 700;
        }

        .time-display {
          background: rgba(255, 255, 255, 0.2);
          padding: 8px 16px;
          border-radius: 20px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .brand-icon {
          background: linear-gradient(135deg, #667eea, #764ba2);
          width: 50px;
          height: 50px;
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid rgba(255, 255, 255, 0.5);
        }

        .section-header {
          position: relative;
          margin-bottom: 2rem;
        }

        .section-header::after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 0;
          width: 60px;
          height: 4px;
          background: var(--primary-gradient);
          border-radius: 2px;
        }

        .number-display {
          font-size: 2.5rem;
          font-weight: 800;
          background: var(--primary-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
        }

        .btn-modern {
          background: var(--primary-gradient);
          border: none;
          border-radius: 15px;
          padding: 12px 24px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .btn-modern:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
        }

        .stats-container {
          position: relative;
          z-index: 1;
        }

        .empty-state {
          text-align: center;
          padding: 3rem 1rem;
          color: #6c757d;
        }

        .empty-state-icon {
          font-size: 3rem;
          opacity: 0.5;
          margin-bottom: 1rem;
        }

        .progress-indicator {
          width: 100%;
          height: 6px;
          background: rgba(102, 126, 234, 0.1);
          border-radius: 3px;
          overflow: hidden;
          margin-top: 0.5rem;
        }

        .progress-bar {
          height: 100%;
          background: var(--primary-gradient);
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        .clickable-stat {
          cursor: pointer;
        }

        .clickable-stat:hover .number-display {
          transform: scale(1.1);
        }
      `}</style>

      <div className="dashboard-bg mt-5 pt-5">
        {/* Enhanced Header */}
        <nav className="navbar navbar-expand-lg header-nav sticky-top mt-5 pt-5">
          <div className="container">
            <div className="d-flex align-items-center">
              <div className="brand-icon me-3">📚</div>
              <div>
                <h4 className="mb-0 text-white fw-bold">LibraryHub</h4>
                <small className="text-white-50 fw-medium">Member Portal</small>
              </div>
            </div>

            <div className="d-flex align-items-center">
              <div className="time-display me-4 d-none d-md-block">
                <div className="d-flex align-items-center text-white small">
                  <span className="fw-medium">
                    {currentTime.toLocaleDateString()}
                  </span>
                  <span className="mx-2">•</span>
                  <span className="fw-medium">
                    {currentTime.toLocaleTimeString()}
                  </span>
                </div>
              </div>

              <div className="position-relative me-4">
                <button className="btn btn-link text-white p-2 position-relative">
                  <span style={{ fontSize: "1.3rem" }}>🔔</span>
                  <span className="notification-dot"></span>
                </button>
              </div>

              <div className="d-flex align-items-center">
                <div className="user-avatar me-3">
                  <span style={{ fontSize: "1.1rem" }}>👤</span>
                </div>
                <div>
                  <div className="text-white fw-semibold">{username}</div>
                  <small className="text-white-50">Member</small>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="container py-5">
          {/* Welcome Section */}
          <div className="row mb-5">
            <div className="col-12">
              <div className="text-center text-white mb-4">
                <h1 className="display-5 fw-bold mb-2">
                  Welcome back, <span className="welcome-text">{username}</span>
                  !
                </h1>
                <p className="lead opacity-75">
                  Manage your library experience with ease
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="row mb-5 stats-container">
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="stat-card h-100">
                <div className="card-body text-center p-4">
                  <div
                    className="icon-container mx-auto"
                    style={{
                      background:
                        "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                    }}
                  >
                    📚
                  </div>
                  <div className="number-display">{totalIssued}</div>
                  <div className="text-muted small mb-1">
                    of {borrowingLimit} books
                  </div>
                  <h6 className="fw-semibold text-dark mb-2">Books Issued</h6>
                  <div className="progress-indicator">
                    <div
                      className="progress-bar"
                      style={{
                        width: `${(totalIssued / borrowingLimit) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6 mb-4">
              <div className="stat-card h-100">
                <div className="card-body text-center p-4">
                  <div
                    className="icon-container mx-auto"
                    style={{
                      background:
                        "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
                    }}
                  >
                    📅
                  </div>
                  <div className="number-display">{dueBooksCount}</div>
                  <div className="text-muted small mb-1">books due</div>
                  <h6 className="fw-semibold text-dark mb-0">Due Books</h6>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6 mb-4">
              <div className="penalty-card stat-card h-100">
                <div className="card-body text-center p-4">
                  <div
                    className="icon-container mx-auto"
                    style={{ background: "rgba(255, 255, 255, 0.2)" }}
                  >
                    💰
                  </div>
                  <div className="number-display text-white">
                    ₹{totalPenalty}
                  </div>
                  <div className="text-white-50 small mb-3">total penalty</div>
                  <a
                    href="/member-penalty"
                    className="btn btn-light btn-sm fw-semibold"
                  >
                    View Details
                  </a>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6 mb-4">
              <div
                className="stat-card h-100 clickable-stat"
                onClick={handleViewRequests}
              >
                <div className="card-body text-center p-4">
                  <div
                    className="icon-container mx-auto"
                    style={{
                      background:
                        "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
                    }}
                  >
                    📋
                  </div>
                  <div className="number-display">{requests.length}</div>
                  <div className="text-muted small mb-1">total requests</div>
                  <h6 className="fw-semibold text-dark mb-2">Book Requests</h6>
                  <button
                    className="btn btn-primary btn-sm fw-semibold"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewRequests();
                    }}
                  >
                    View Requests
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Quick Actions */}
          <div className="row mb-5">
            <div className="col-12">
              <h3 className="section-header text-white fw-bold mb-4">
                Quick Actions
              </h3>
            </div>

            <div className="col-lg-4 col-md-6 mb-4">
              <div className="action-card h-100" onClick={goToManageBooks}>
                <div className="card-body p-4">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      <div
                        className="icon-container me-3"
                        style={{
                          background:
                            "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                          width: "60px",
                          height: "60px",
                        }}
                      >
                        📚
                      </div>
                      <div>
                        <h5 className="fw-bold mb-1">Explore Books</h5>
                        <p className="text-muted mb-0 small">
                          Browse our vast collection
                        </p>
                      </div>
                    </div>
                    <div className="text-primary">
                      <span style={{ fontSize: "1.5rem" }}>→</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6 mb-4">
              <div
                className="action-card h-100"
                onClick={() => navigate("/borrowing-history")}
              >
                <div className="card-body p-4">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      <div
                        className="icon-container me-3"
                        style={{
                          background:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          width: "60px",
                          height: "60px",
                        }}
                      >
                        📜
                      </div>
                      <div>
                        <h5 className="fw-bold mb-1">History</h5>
                        <p className="text-muted mb-0 small">
                          View borrowing history
                        </p>
                      </div>
                    </div>
                    <div className="text-primary">
                      <span style={{ fontSize: "1.5rem" }}>→</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6 mb-4">
              <div
                className="action-card h-100"
                onClick={handleRenewMembership}
              >
                <div className="card-body p-4">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      <div
                        className="icon-container me-3"
                        style={{
                          background:
                            "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
                          width: "60px",
                          height: "60px",
                        }}
                      >
                        💳
                      </div>
                      <div>
                        <h5 className="fw-bold mb-1">Renew Membership</h5>
                        <p className="text-muted mb-0 small">
                          Extend your membership
                        </p>
                      </div>
                    </div>
                    <div className="text-primary">
                      <span style={{ fontSize: "1.5rem" }}>→</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Recent Activity */}
          <div className="row mb-5">
            <div className="col-12">
              <div className="activity-section p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h3 className="section-header fw-bold mb-0">
                    Recent Activity
                  </h3>
                  <button className="btn btn-outline-primary btn-sm fw-semibold">
                    View All
                  </button>
                </div>

                {recentActivity.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">📚</div>
                    <h5>No recent activity</h5>
                    <p>Start exploring books to see your activity here</p>
                  </div>
                ) : (
                  <div className="row">
                    {recentActivity.map((record, idx) => (
                      <div key={idx} className="col-12 mb-3">
                        <div className="activity-item p-4">
                          <div className="d-flex align-items-center">
                            <div
                              className="icon-container me-3"
                              style={{
                                background:
                                  record.status === "BORROWED" ||
                                  record.status === "OVERDUE"
                                    ? "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
                                    : "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
                                width: "50px",
                                height: "50px",
                                fontSize: "1.5rem",
                              }}
                            >
                              {record.status === "BORROWED" ||
                              record.status === "OVERDUE"
                                ? "📖"
                                : "✅"}
                            </div>
                            <div className="flex-grow-1">
                              <h6 className="fw-semibold mb-1">
                                {record.status === "BORROWED" ||
                                record.status === "OVERDUE"
                                  ? `Borrowed "${record.book.title}"`
                                  : `Returned "${record.book.title}"`}
                              </h6>
                              <small className="text-muted">
                                <span className="me-3">
                                  📅{" "}
                                  {new Date(
                                    record.borrowDate
                                  ).toLocaleDateString()}
                                </span>
                                <span>👤 {record.issuedBy}</span>
                              </small>
                            </div>
                            <span
                              className={`badge-modern ${
                                record.status === "BORROWED"
                                  ? "bg-success"
                                  : record.status === "OVERDUE"
                                  ? "bg-danger"
                                  : "bg-primary"
                              }`}
                            >
                              {record.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default MemberDashboard;
