import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const username = localStorage.getItem("username") || "Admin";
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

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
          transform: translateY(-10px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15) !important;
        }

        .icon-bg {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          margin: 0 auto 1rem;
          transition: all 0.4s ease;
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
        }

        .card-hover:hover .icon-bg {
          transform: rotate(5deg) scale(1.05);
        }

        .btn-modern {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          font-weight: 600;
        }

        .btn-modern::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          transition: left 0.5s;
        }

        .btn-modern:hover::before {
          left: 100%;
        }

        .btn-modern:hover {
          transform: translateY(-2px);
        }

        .action-btn-enhanced {
          transition: all 0.3s ease;
          font-weight: 600;
          position: relative;
          overflow: hidden;
        }

        .action-btn-enhanced:hover {
          transform: translateY(-3px);
        }

        .floating-btn {
          position: fixed;
          bottom: 30px;
          right: 30px;
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 50%;
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
          font-size: 1.5rem;
          color: white;
          transition: all 0.3s ease;
          z-index: 1000;
          animation: float 3s ease-in-out infinite;
        }

        .floating-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 15px 35px rgba(102, 126, 234, 0.6);
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .decorative-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: -1;
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
      `}</style>

      <div className="decorative-bg">
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>
      </div>

      <div className="dashboard-container mt-4 pt-4">
        <div className="container" style={{ marginTop: "90px" }}>
          {/* Header - EXACTLY as your original */}
          <div className={`fade-in ${isLoaded ? "loaded" : ""}`}>
            <div className="hero-header rounded-4 p-4 mb-5 shadow-sm position-relative">
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

          {/* Simple Cards with View All - EXACTLY as your original */}
          <div className="row g-4 mb-5">
            <div className="col-md-4">
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
            <div className="col-md-4">
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
            <div className="col-md-4">
              <div className={`fade-in ${isLoaded ? "loaded" : ""} stagger-3`}>
                <div className="card card-hover shadow-sm border-0 rounded-4 h-100 text-center p-4">
                  <div className="icon-bg text-white">💳</div>
                  <h5 className="fw-bold text-warning">Membership Plans</h5>
                  <button
                    className="btn btn-outline-warning btn-sm rounded-pill mt-3 btn-modern"
                    onClick={() => navigate("/admin/membership-plans")}
                  >
                    View All
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Actions - EXACTLY as your original */}
          <div className={`fade-in ${isLoaded ? "loaded" : ""} stagger-4`}>
            <div className="d-flex flex-wrap justify-content-center gap-3 mb-5">
              <button
                className="btn btn-info px-4 py-2 rounded-pill shadow-sm action-btn-enhanced"
                onClick={() => navigate("/admin/members")}
              >
                📚 Membership Management
              </button>
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
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button className="floating-btn" title="Quick Actions">
        ⚡
      </button>
    </>
  );
}

export default AdminDashboard;
