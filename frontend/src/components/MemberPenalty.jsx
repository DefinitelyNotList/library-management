import axios from "axios";
import { useEffect, useState } from "react";

function MemberPenalty() {
  const [penalties, setPenalties] = useState([]);
  const [clearedPenalties, setClearedPenalties] = useState([]);
  const [overduePenalties, setOverduePenalties] = useState([]);
  const [totalPenalty, setTotalPenalty] = useState(0);
  const [totalOverduePenalty, setTotalOverduePenalty] = useState(0);

  useEffect(() => {
    fetchPenalties();
    fetchOverduePenalties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchOverduePenalties = async () => {
    try {
      const memberId = localStorage.getItem("memberId");
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `http://localhost:8080/api/borrow/penalties/${memberId}`,
        { headers: { Authorization: token } }
      );

      const overdueData = Array.isArray(response.data)
        ? response.data
        : [response.data];
      setOverduePenalties(overdueData);

      const totalOverdue = overdueData.reduce(
        (sum, p) => sum + Number(p.amount || 0),
        0
      );
      setTotalOverduePenalty(totalOverdue);
    } catch (error) {
      console.error("Error fetching overdue penalties:", error);
      // Don't show alert for overdue penalties as it might not exist for all users
    }
  };

  const fetchPenalties = async () => {
    try {
      const memberId = localStorage.getItem("memberId");
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `http://localhost:8080/api/transactions/member/${memberId}`,
        { headers: { Authorization: token } }
      );

      const transactions = Array.isArray(response.data) ? response.data : [];

      const unpaid = transactions
        .filter((t) => t.fine > 0 && t.status !== "PAID")
        .map((t) => ({
          id: t.id,
          title: t.book?.title || "Unknown Book",
          author: t.book?.author || "Unknown Author",
          amount: t.fine,
          status: "OUTSTANDING",
        }));

      setPenalties(unpaid);

      const cleared = transactions
        .filter((t) => t.status === "PAID")
        .map((t) => ({
          id: t.id,
          title: t.book?.title || "Unknown Book",
          author: t.book?.author || "Unknown Author",
          amount: t.fine,
        }));

      setClearedPenalties(cleared);

      const total = unpaid.reduce((sum, p) => sum + Number(p.amount || 0), 0);
      setTotalPenalty(total + totalOverduePenalty);
    } catch (error) {
      console.error(error);
      alert("Cannot fetch penalties");
    }
  };

  return (
    <>
      {/* Bootstrap CSS */}
      <link
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.2/css/bootstrap.min.css"
        rel="stylesheet"
      />
      <link
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        rel="stylesheet"
      />

      <style>{`
        .gradient-bg {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .penalty-card {
          transition: all 0.3s ease;
          border: none;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .penalty-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        .total-penalty-card {
          background: linear-gradient(135deg, #ff6b6b, #ee5a24);
          color: white;
          border: none;
        }
      `}</style>

      <div className="gradient-bg mt-5 pt-5" style={{ paddingTop: "100px" }}>
        {/* Header */}
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <nav className="navbar navbar-expand-lg glass-card shadow-sm">
                <div className="container">
                  <div className="navbar-brand d-flex align-items-center">
                    <div className="bg-primary p-2 rounded-3 me-3">
                      <i className="fas fa-exclamation-circle text-white fs-4"></i>
                    </div>
                    <div className="mt-5 pt-5">
                      <h4 className="mb-0 text-dark fw-bold">My Penalties</h4>
                      <small className="text-muted">
                        Overview of outstanding library fines
                      </small>
                    </div>
                  </div>
                  <a
                    href="/member-dashboard"
                    className="btn btn-outline-secondary"
                  >
                    <i className="fas fa-arrow-left me-2"></i>Back to Dashboard
                  </a>
                </div>
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container my-5">
          {/* Total Penalty Card */}
          <div className="row justify-content-center mb-4">
            <div className="col-lg-8">
              <div className="card total-penalty-card shadow-lg rounded-4">
                <div className="card-body p-4">
                  <div className="row align-items-center">
                    <div className="col-12">
                      <h6 className="text-white-50 mb-2">
                        Total Outstanding Amount
                      </h6>
                      <h1 className="display-4 fw-bold mb-2">
                        ₹{totalPenalty}
                      </h1>
                      <p className="text-white-50 mb-0">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        {penalties.length + overduePenalties.length} pending
                        item(s)
                      </p>
                      <p className="text-white-50 mb-0 mt-2">
                        <i className="fas fa-info-circle me-2"></i>
                        Please settle outstanding fines with the librarian at
                        the front desk.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Overdue Penalties Section */}
          {overduePenalties.length > 0 && (
            <div className="row mb-4">
              <div className="col-12">
                <div className="glass-card rounded-4 p-4 border-warning border-2">
                  <div className="d-flex align-items-center mb-4">
                    <i className="fas fa-clock text-warning me-3 fs-4"></i>
                    <h3 className="mb-0 text-dark fw-bold">
                      Overdue Penalties
                    </h3>
                    <span className="badge bg-warning text-dark ms-3 px-3 py-2">
                      {overduePenalties.length} overdue books
                    </span>
                  </div>
                  <div className="row">
                    {overduePenalties.map((overdue) => (
                      <div
                        key={overdue.borrowedBookId}
                        className="col-lg-6 mb-4"
                      >
                        <div className="card penalty-card h-100 rounded-4 border-warning">
                          <div className="card-body p-4">
                            <div className="row">
                              <div className="col-8">
                                <h5 className="card-title fw-bold text-dark mb-2">
                                  {overdue.title}
                                </h5>
                                <p className="text-muted mb-2">
                                  <i className="fas fa-user me-2"></i>by{" "}
                                  {overdue.author}
                                </p>
                                <div className="row g-2 mb-3">
                                  <div className="col-12">
                                    <small className="text-muted">
                                      <i className="fas fa-calendar-times me-1 text-danger"></i>
                                      Due:{" "}
                                      {new Date(
                                        overdue.dueDate
                                      ).toLocaleDateString()}
                                    </small>
                                  </div>
                                  <div className="col-12">
                                    <small className="text-muted">
                                      <i className="fas fa-calendar-day me-1 text-primary"></i>
                                      Today: {new Date().toLocaleDateString()}
                                    </small>
                                  </div>
                                  <div className="col-12">
                                    <small className="text-warning fw-semibold">
                                      <i className="fas fa-exclamation-triangle me-1"></i>
                                      {overdue.daysOverdue} days overdue (₹
                                      {overdue.perDay}/day)
                                    </small>
                                  </div>
                                </div>
                                <span className="badge bg-warning-subtle text-warning px-3 py-2">
                                  <i className="fas fa-clock me-1"></i>
                                  Overdue
                                </span>
                              </div>
                              <div className="col-4 text-end">
                                <h2 className="text-warning fw-bold mb-3">
                                  ₹{overdue.amount}
                                </h2>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Regular Penalties Grid */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="d-flex align-items-center mb-4">
                <i className="fas fa-exclamation-circle text-danger me-3 fs-4"></i>
                <h3 className="mb-0 text-dark fw-bold">Regular Penalties</h3>
              </div>
            </div>
          </div>

          <div className="row">
            {penalties.length === 0 && overduePenalties.length === 0 ? (
              <div className="col-12 text-center py-5">
                <div className="glass-card p-5 rounded-4">
                  <i
                    className="fas fa-check-circle text-success mb-3"
                    style={{ fontSize: "4rem" }}
                  ></i>
                  <h3 className="text-dark mb-3">No Penalties!</h3>
                  <p className="text-muted">
                    You're all caught up, nothing outstanding right now.
                  </p>
                </div>
              </div>
            ) : (
              penalties.map((penalty) => (
                <div key={penalty.id} className="col-lg-6 mb-4">
                  <div className="card penalty-card h-100 rounded-4">
                    <div className="card-body p-4">
                      <div className="row">
                        <div className="col-8">
                          <h5 className="card-title fw-bold text-dark mb-2">
                            {penalty.title}
                          </h5>
                          <p className="text-muted mb-3">
                            <i className="fas fa-user me-2"></i>by{" "}
                            {penalty.author}
                          </p>
                          <div className="d-flex align-items-center mb-3">
                            <span className="badge bg-danger-subtle text-danger px-3 py-2">
                              <i className="fas fa-exclamation-circle me-1"></i>
                              Outstanding
                            </span>
                          </div>
                        </div>
                        <div className="col-4 text-end">
                          <h2 className="text-danger fw-bold mb-3">
                            ₹{penalty.amount}
                          </h2>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cleared Penalties */}
          {clearedPenalties.length > 0 && (
            <div className="row mt-5">
              <div className="col-12">
                <div className="glass-card rounded-4 p-4">
                  <div className="d-flex align-items-center mb-4">
                    <i className="fas fa-receipt text-primary me-3 fs-4"></i>
                    <h3 className="mb-0 text-dark fw-bold">
                      Cleared Penalties
                    </h3>
                  </div>
                  <div className="row">
                    {clearedPenalties.map((item) => (
                      <div key={item.id} className="col-lg-4 col-md-6 mb-3">
                        <div className="card border-success border-2 h-100">
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <h6 className="fw-bold text-dark mb-1">
                                {item.title}
                              </h6>
                              <span className="badge bg-success">
                                <i className="fas fa-check me-1"></i>Cleared
                              </span>
                            </div>
                            <p className="text-muted small mb-2">
                              by {item.author}
                            </p>
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
      </div>

      {/* Bootstrap JS */}
      <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.2/js/bootstrap.bundle.min.js"></script>
    </>
  );
}

export default MemberPenalty;
