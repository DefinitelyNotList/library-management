import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("username");

    if (token && user) {
      setIsLoggedIn(true);
      setUsername(user);
    } else {
      setIsLoggedIn(false);
      setUsername("");
    }
  }, [localStorage.getItem("token")]);

  const logout = () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (confirmed) {
      localStorage.clear();
      alert("Logout successful!");
      setIsLoggedIn(false);
      setUsername("");
      navigate("/");
    }
  };

  return (
    <>
      <nav
        className="navbar navbar-expand-lg shadow-lg fixed-top"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          padding: "1rem 0",
        }}
      >
        <div className="container-fluid px-4">
          {/* Brand Logo */}
          <Link
            className="navbar-brand fs-3 fw-bold text-white d-flex align-items-center"
            to="/"
            style={{
              textDecoration: "none",
              transition: "all 0.3s ease",
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
            }}
            onMouseOver={(e) => {
              e.target.style.transform = "scale(1.05)";
              e.target.style.textShadow = "0 0 20px rgba(255,255,255,0.5)";
            }}
            onMouseOut={(e) => {
              e.target.style.transform = "scale(1)";
              e.target.style.textShadow = "";
            }}
          >
            <div
              className="d-flex align-items-center justify-content-center me-3 rounded-circle"
              style={{
                width: "50px",
                height: "50px",
                background: "linear-gradient(135deg, #fff 0%, #f0f0f0 100%)",
                color: "#667eea",
                fontSize: "1.5rem",
                boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
              }}
            >
              📚
            </div>
            <span
              style={{
                background: "linear-gradient(135deg, #fff 0%, #e0e7ff 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Librario
            </span>
          </Link>

          {/* Mobile Toggle Button */}
          <button
            className="navbar-toggler border-0 shadow-none"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarContent"
            style={{
              padding: "0.5rem",
              borderRadius: "12px",
              background: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
              transition: "all 0.3s ease",
            }}
            onMouseOver={(e) => {
              e.target.style.background = "rgba(255, 255, 255, 0.2)";
              e.target.style.transform = "scale(1.1)";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "rgba(255, 255, 255, 0.1)";
              e.target.style.transform = "scale(1)";
            }}
          >
            <span
              className="navbar-toggler-icon"
              style={{
                filter: "brightness(0) invert(1)",
              }}
            ></span>
          </button>

          {/* Navigation Menu */}
          <div className="collapse navbar-collapse" id="navbarContent">
            <ul className="navbar-nav ms-auto align-items-center">
              {!isLoggedIn ? (
                <>
                  {/* Login Link */}
                  <li className="nav-item me-2">
                    <Link
                      className="nav-link text-white fw-semibold px-3 py-2 rounded-pill d-flex align-items-center"
                      to="/"
                      style={{
                        transition: "all 0.3s ease",
                        background: "rgba(255, 255, 255, 0.1)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                      }}
                      onMouseOver={(e) => {
                        e.target.style.background = "rgba(255, 255, 255, 0.2)";
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.boxShadow =
                          "0 8px 25px rgba(0, 0, 0, 0.2)";
                      }}
                      onMouseOut={(e) => {
                        e.target.style.background = "rgba(255, 255, 255, 0.1)";
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = "";
                      }}
                    >
                      <span className="me-2">🔐</span>Login
                    </Link>
                  </li>

                  {/* Register Link */}
                  <li className="nav-item me-2">
                    <Link
                      className="nav-link text-white fw-semibold px-3 py-2 rounded-pill d-flex align-items-center"
                      to="/register"
                      style={{
                        transition: "all 0.3s ease",
                        background: "rgba(255, 255, 255, 0.1)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                      }}
                      onMouseOver={(e) => {
                        e.target.style.background = "rgba(255, 255, 255, 0.2)";
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.boxShadow =
                          "0 8px 25px rgba(0, 0, 0, 0.2)";
                      }}
                      onMouseOut={(e) => {
                        e.target.style.background = "rgba(255, 255, 255, 0.1)";
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = "";
                      }}
                    >
                      <span className="me-2">👤</span>Register
                    </Link>
                  </li>

                  {/* Reset Password Link */}
                  <li className="nav-item">
                    <Link
                      className="nav-link text-white fw-semibold px-3 py-2 rounded-pill d-flex align-items-center"
                      to="/reset-password"
                      style={{
                        transition: "all 0.3s ease",
                        background: "rgba(255, 255, 255, 0.1)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                      }}
                      onMouseOver={(e) => {
                        e.target.style.background = "rgba(255, 255, 255, 0.2)";
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.boxShadow =
                          "0 8px 25px rgba(0, 0, 0, 0.2)";
                      }}
                      onMouseOut={(e) => {
                        e.target.style.background = "rgba(255, 255, 255, 0.1)";
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = "";
                      }}
                    >
                      <span className="me-2">🔒</span>Reset Password
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  {/* Welcome Badge */}
                  <li className="nav-item me-3">
                    <div
                      className="d-flex align-items-center px-4 py-2 rounded-pill"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 248, 255, 0.95) 100%)",
                        backdropFilter: "blur(15px)",
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                        animation: "glow 2s ease-in-out infinite alternate",
                      }}
                    >
                      <div
                        className="d-flex align-items-center justify-content-center me-3 rounded-circle"
                        style={{
                          width: "35px",
                          height: "35px",
                          background:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          color: "white",
                          fontSize: "1rem",
                        }}
                      >
                        👋
                      </div>
                      <div>
                        <div
                          className="fw-bold"
                          style={{
                            background:
                              "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                            fontSize: "0.9rem",
                          }}
                        >
                          Welcome back!
                        </div>
                        <div
                          className="fw-bold"
                          style={{
                            color: "#667eea",
                            fontSize: "1rem",
                          }}
                        >
                          {username}
                        </div>
                      </div>
                    </div>
                  </li>

                  {/* Logout Button */}
                  <li className="nav-item">
                    <button
                      className="btn fw-semibold px-4 py-2 rounded-pill d-flex align-items-center"
                      onClick={logout}
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(220, 53, 69, 0.9) 0%, rgba(255, 105, 135, 0.9) 100%)",
                        color: "white",
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                        backdropFilter: "blur(10px)",
                        transition: "all 0.3s ease",
                        boxShadow: "0 4px 15px rgba(220, 53, 69, 0.3)",
                      }}
                      onMouseOver={(e) => {
                        e.target.style.transform =
                          "translateY(-3px) scale(1.05)";
                        e.target.style.boxShadow =
                          "0 12px 35px rgba(220, 53, 69, 0.4)";
                        e.target.style.background =
                          "linear-gradient(135deg, rgba(220, 53, 69, 1) 0%, rgba(255, 105, 135, 1) 100%)";
                      }}
                      onMouseOut={(e) => {
                        e.target.style.transform = "translateY(0) scale(1)";
                        e.target.style.boxShadow =
                          "0 4px 15px rgba(220, 53, 69, 0.3)";
                        e.target.style.background =
                          "linear-gradient(135deg, rgba(220, 53, 69, 0.9) 0%, rgba(255, 105, 135, 0.9) 100%)";
                      }}
                    >
                      <span className="me-2">🚪</span>Logout
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>

      {/* Enhanced Styles */}
      <style>{`
        /* Glow animation for welcome badge */
        @keyframes glow {
          from {
            box-shadow: 0 8px 32px rgba(102, 126, 234, 0.1);
          }
          to {
            box-shadow: 0 12px 40px rgba(102, 126, 234, 0.2);
          }
        }

        /* Navbar brand hover effect */
        .navbar-brand:hover {
          text-decoration: none !important;
        }

        /* Mobile responsive adjustments */
        @media (max-width: 991px) {
          .navbar-nav {
            padding-top: 1rem;
            text-align: center;
          }
          
          .navbar-nav .nav-item {
            margin-bottom: 0.5rem;
          }
          
          .navbar-nav .nav-link {
            justify-content: center;
            margin: 0.25rem 0;
          }
          
          .navbar-brand {
            font-size: 1.5rem !important;
          }
          
          .navbar-brand .me-3 {
            width: 40px !important;
            height: 40px !important;
            font-size: 1.2rem !important;
          }
        }

        @media (max-width: 576px) {
          .navbar-brand {
            font-size: 1.25rem !important;
          }
          
          .navbar-brand .me-3 {
            width: 35px !important;
            height: 35px !important;
            font-size: 1rem !important;
            margin-right: 0.75rem !important;
          }
          
          .nav-link {
            font-size: 0.9rem;
            padding: 0.5rem 1rem !important;
          }
          
          .btn {
            font-size: 0.9rem;
            padding: 0.5rem 1rem !important;
          }
        }

        /* Focus states for accessibility */
        .nav-link:focus,
        .btn:focus {
          outline: 2px solid rgba(255, 255, 255, 0.5);
          outline-offset: 2px;
        }

        /* Smooth transitions */
        .nav-link,
        .btn,
        .navbar-brand {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Backdrop blur fallback */
        @supports not (backdrop-filter: blur(10px)) {
          .navbar {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          }
          
          .nav-link,
          .navbar-toggler {
            background: rgba(255, 255, 255, 0.15) !important;
          }
        }

        /* Text selection styling */
        ::selection {
          background: rgba(255, 255, 255, 0.3);
          color: white;
        }

        /* Improved button active state */
        .btn:active {
          transform: translateY(1px) scale(0.98) !important;
        }

        /* Enhanced dropdown shadow for mobile */
        .navbar-collapse {
          border-radius: 0 0 20px 20px;
          background: inherit;
          padding: 0 1rem 1rem;
          margin-top: 0.5rem;
        }

        /* Custom scrollbar for mobile menu */
        .navbar-collapse::-webkit-scrollbar {
          width: 4px;
        }
        .navbar-collapse::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
        }
        .navbar-collapse::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 2px;
        }
      `}</style>
    </>
  );
}

export default Navbar;
