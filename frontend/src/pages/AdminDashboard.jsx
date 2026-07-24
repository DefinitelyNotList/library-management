import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

function AdminDashboard() {
  const username = localStorage.getItem("username") || "Admin";
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [stats, setStats] = useState({
    TotalBooks: 0,
    TotalReaders: 0,
    TotalLibrarians: 0,
    TotalBorrowSlips: 0,
    CurrentlyBorrowing: 0,
    OverdueSlips: 0,
    TotalFineCollected: 0,
  });

  useEffect(() => {
    setIsLoaded(true);
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axiosInstance.get("/library/statistics");
      if (res.data) {
        setStats(res.data);
      }
    } catch (e) {
      console.warn("Could not load library statistics:", e);
    }
  };

  const getStat = (key1, key2) => stats[key1] ?? stats[key2] ?? 0;

  return (
    <>
      <style jsx>{`
        .dashboard-container {
          background: linear-gradient(
            135deg,
            #f8f9fa 0%,
            #e3f2fd 50%,
            #f3e5f5 100%
          );
          min-height: 100vh;
        }

        .fade-in {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s ease-out;
        }

        .fade-in.loaded {
          opacity: 1;
          transform: translateY(0);
        }

        .stagger-1 {
          transition-delay: 0.1s;
        }
        .stagger-2 {
          transition-delay: 0.2s;
        }
        .stagger-3 {
          transition-delay: 0.3s;
        }
        .stagger-4 {
          transition-delay: 0.4s;
        }

        .hero-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          position: relative;
          overflow: hidden;
        }

        .hero-header::before {
          content: "";
          position: absolute;
          top: -50%;
          right: -30%;
          width: 600px;
          height: 600px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
        }

        .card-hover {
          transition: all 0.4s ease;
          border: none !important;
          background: white;
        }

        .card-hover:hover {
          transform: translateY(-8px);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.12) !important;
        }

        .icon-bg {
          width: 60px;
          height: 60px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          font-size: 1.8rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .btn-modern {
          font-weight: 600;
          letter-spacing: 0.5px;
          padding: 8px 20px;
          transition: all 0.3s ease;
        }

        .action-btn-enhanced {
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .action-btn-enhanced:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2) !important;
        }

        .decorative-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
        }

        .bg-circle {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.2;
          animation: float 8s ease-in-out infinite;
        }

        .bg-circle-1 {
          width: 400px;
          height: 400px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          top: 10%;
          left: 5%;
        }

        .bg-circle-2 {
          width: 300px;
          height: 300px;
          background: linear-gradient(135deg, #f093fb, #f5576c);
          top: 60%;
          right: 5%;
          animation-delay: 3s;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>

      <div className="decorative-bg">
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>
      </div>

      <div className="dashboard-container mt-4 pt-4">
        <div className="container" style={{ marginTop: "90px" }}>
          {/* Header */}
          <div className={`fade-in ${isLoaded ? "loaded" : ""}`}>
            <div className="hero-header rounded-4 p-4 mb-4 shadow-sm position-relative">
              <div className="d-flex flex-wrap align-items-center justify-content-between">
                <div>
                  <h2 className="fw-bold text-light mb-1">
                    🛠️ Admin Dashboard
                  </h2>
                  <div className="text-white-50">
                    Welcome back, <strong>{username}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Live DB Statistics Grid */}
          <div className={`fade-in ${isLoaded ? "loaded" : ""} stagger-1 mb-4`}>
            <div className="row g-3">
              <div className="col-md-2 col-6">
                <div className="card border-0 shadow-sm rounded-4 text-center p-3 bg-white">
                  <span className="fs-3">📚</span>
                  <h4 className="fw-bold text-dark mb-0 mt-2">
                    {getStat("TotalBooks", "totalBooks")}
                  </h4>
                  <small className="text-muted">Total Books</small>
                </div>
              </div>
              <div className="col-md-2 col-6">
                <div className="card border-0 shadow-sm rounded-4 text-center p-3 bg-white">
                  <span className="fs-3">👥</span>
                  <h4 className="fw-bold text-primary mb-0 mt-2">
                    {getStat("TotalReaders", "totalReaders")}
                  </h4>
                  <small className="text-muted">Readers</small>
                </div>
              </div>
              <div className="col-md-2 col-6">
                <div className="card border-0 shadow-sm rounded-4 text-center p-3 bg-white">
                  <span className="fs-3">👨‍🏫</span>
                  <h4 className="fw-bold text-success mb-0 mt-2">
                    {getStat("TotalLibrarians", "totalLibrarians")}
                  </h4>
                  <small className="text-muted">Librarians</small>
                </div>
              </div>
              <div className="col-md-2 col-6">
                <div className="card border-0 shadow-sm rounded-4 text-center p-3 bg-white">
                  <span className="fs-3">📜</span>
                  <h4 className="fw-bold text-info mb-0 mt-2">
                    {getStat("CurrentlyBorrowing", "currentlyBorrowing")}
                  </h4>
                  <small className="text-muted">Active Loans</small>
                </div>
              </div>
              <div className="col-md-2 col-6">
                <div className="card border-0 shadow-sm rounded-4 text-center p-3 bg-white">
                  <span className="fs-3">⚠️</span>
                  <h4 className="fw-bold text-danger mb-0 mt-2">
                    {getStat("OverdueSlips", "overdueSlips")}
                  </h4>
                  <small className="text-muted">Overdue Slips</small>
                </div>
              </div>
              <div className="col-md-2 col-6">
                <div className="card border-0 shadow-sm rounded-4 text-center p-3 bg-white">
                  <span className="fs-3">💰</span>
                  <h4 className="fw-bold text-warning mb-0 mt-2">
                    {Number(getStat("TotalFineCollected", "totalFineCollected")).toLocaleString()}
                  </h4>
                  <small className="text-muted">Fines (VND)</small>
                </div>
              </div>
            </div>
          </div>

          {/* Simple Cards with View All - EXACTLY as your original */}
          {/* Admin Cards */}
          <div className="row g-4 mb-5 justify-content-center">
            <div className="col-md-5">
              <div className={`fade-in ${isLoaded ? "loaded" : ""} stagger-1`}>
                <div className="card card-hover shadow-sm border-0 rounded-4 h-100 text-center p-4">
                  <div className="icon-bg text-white">👨‍🏫</div>
                  <h5 className="fw-bold text-success">Librarians</h5>
                  <button
                    className="btn btn-outline-success btn-sm rounded-pill mt-3 btn-modern"
                    onClick={() => navigate("/admin/librarians")}
                  >
                    View All
                  </button>
                </div>
              </div>
            </div>
            <div className="col-md-5">
              <div className={`fade-in ${isLoaded ? "loaded" : ""} stagger-2`}>
                <div className="card card-hover shadow-sm border-0 rounded-4 h-100 text-center p-4">
                  <div className="icon-bg text-white">👥</div>
                  <h5 className="fw-bold text-primary">Members</h5>
                  <button
                    className="btn btn-outline-primary btn-sm rounded-pill mt-3 btn-modern"
                    onClick={() => navigate("/admin/members-list")}
                  >
                    View All
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Actions */}
          <div className={`fade-in ${isLoaded ? "loaded" : ""} stagger-3`}>
            <div className="d-flex flex-wrap justify-content-center gap-3 mb-5">
              <button
                className="btn btn-warning px-4 py-2 rounded-pill shadow-sm action-btn-enhanced"
                onClick={() => navigate("/admin/add-librarian")}
              >
                ➕ Add Librarian
              </button>
              <button
                className="btn btn-warning px-4 py-2 rounded-pill shadow-sm action-btn-enhanced"
                onClick={() => navigate("/admin/add-member")}
              >
                ➕ Add Member
              </button>
              <button
                className="btn btn-info text-white px-4 py-2 rounded-pill shadow-sm action-btn-enhanced"
                onClick={() => navigate("/admin/reports")}
              >
                📊 Reports & Analytics
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminDashboard;
