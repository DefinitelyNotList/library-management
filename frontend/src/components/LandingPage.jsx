import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: "📖",
      title: "Book Catalog",
      description:
        "Easily search, add, and manage books with our intuitive catalog system.",
      color: "#0D9488",
    },
    {
      icon: "👥",
      title: "Membership Plans",
      description:
        "Manage readers with customizable borrowing limits and membership tiers.",
      color: "#1E3A8A",
    },
    {
      icon: "🔔",
      title: "Smart Notifications",
      description: "Get automated reminders for due dates and overdue books.",
      color: "#7C3AED",
    },
    {
      icon: "📊",
      title: "Analytics Dashboard",
      description:
        "Track usage patterns and library trends with detailed analytics.",
      color: "#DC2626",
    },
  ];

  const testimonials = [
    {
      text: "📚 Managing books has never been this easy! The interface is intuitive and saves us hours every day.",
      author: "Sarah Johnson",
      position: "Head Librarian, City Library",
      rating: 5,
    },
    {
      text: "⚡ Quick and efficient system for members! I can easily find and reserve books online.",
      author: "Mike Chen",
      position: "Student, Computer Science",
      rating: 5,
    },
    {
      text: "🎯 The analytics dashboard helps us make data-driven decisions for book procurement.",
      author: "Emily Davis",
      position: "Library Administrator",
      rating: 5,
    },
  ];

  return (
    <div className="landing-page">
      {/* Header / Navbar */}
      <nav
        className="navbar navbar-expand-lg fixed-top"
        style={{
          background:
            scrollY > 50 ? "rgba(255, 255, 255, 0.95)" : "transparent",
          backdropFilter: scrollY > 50 ? "blur(10px)" : "none",
          boxShadow: scrollY > 50 ? "0 2px 20px rgba(0, 0, 0, 0.1)" : "none",
          transition: "all 0.3s ease",
          padding: "1rem 0",
        }}
      >
        <div className="container">
          <Link
            className="navbar-brand d-flex align-items-center"
            to="/"
            style={{
              fontSize: "1.8rem",
              fontWeight: "bold",
              color: scrollY > 50 ? "#1E3A8A" : "white",
              textDecoration: "none",
              transition: "all 0.3s ease",
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            <span className="me-2">📚</span>
            <em>Librario</em>
          </Link>

          <button
            className="navbar-toggler border-0"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            style={{ boxShadow: "none" }}
          >
            <span
              className="navbar-toggler-icon"
              style={{
                filter: scrollY > 50 ? "invert(1)" : "brightness(0) invert(1)",
              }}
            ></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              {["Home", "About", "Features", "Contact"].map((item) => (
                <li key={item} className="nav-item">
                  <a
                    className="nav-link fw-semibold px-3"
                    href={`#${item.toLowerCase()}`}
                    style={{
                      color: scrollY > 50 ? "#1E3A8A" : "white",
                      transition: "all 0.3s ease",
                      position: "relative",
                    }}
                    onMouseOver={(e) => {
                      e.target.style.color = "#0D9488";
                      e.target.style.transform = "translateY(-2px)";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.color = scrollY > 50 ? "#1E3A8A" : "white";
                      e.target.style.transform = "translateY(0)";
                    }}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>

            <div className="d-flex gap-2">
              <Link
                to="/login"
                className="btn btn-outline-primary rounded-pill px-4"
                style={{
                  borderColor: scrollY > 50 ? "#1E3A8A" : "white",
                  color: scrollY > 50 ? "#1E3A8A" : "white",
                  transition: "all 0.3s ease",
                }}
                onMouseOver={(e) => {
                  e.target.style.background = "#1E3A8A";
                  e.target.style.color = "white";
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow =
                    "0 8px 25px rgba(30, 58, 138, 0.3)";
                }}
                onMouseOut={(e) => {
                  e.target.style.background = "transparent";
                  e.target.style.color = scrollY > 50 ? "#1E3A8A" : "white";
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "none";
                }}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="btn btn-primary rounded-pill px-4"
                style={{
                  background:
                    "linear-gradient(135deg, #0D9488 0%, #1E3A8A 100%)",
                  border: "none",
                  transition: "all 0.3s ease",
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = "translateY(-2px) scale(1.05)";
                  e.target.style.boxShadow =
                    "0 10px 30px rgba(13, 148, 136, 0.4)";
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = "translateY(0) scale(1)";
                  e.target.style.boxShadow = "none";
                }}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        id="home"
        className="hero-section d-flex align-items-center"
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #0D9488 0%, #1E3A8A 50%, #7C3AED 100%)",
          backgroundSize: "400% 400%",
          animation: "gradientShift 8s ease-in-out infinite",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Animated Background Elements */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "10%",
            width: "100px",
            height: "100px",
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: "50%",
            animation: "float 6s ease-in-out infinite",
          }}
        ></div>
        <div
          style={{
            position: "absolute",
            top: "60%",
            right: "15%",
            width: "80px",
            height: "80px",
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: "50%",
            animation: "float 4s ease-in-out infinite reverse",
          }}
        ></div>
        <div
          style={{
            position: "absolute",
            top: "20%",
            right: "25%",
            fontSize: "4rem",
            opacity: "0.1",
            animation: "float 5s ease-in-out infinite",
          }}
        >
          📚
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "20%",
            left: "20%",
            fontSize: "3rem",
            opacity: "0.1",
            animation: "float 7s ease-in-out infinite reverse",
          }}
        >
          📖
        </div>

        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <div
                className="hero-content text-white"
                style={{
                  animation: "slideInLeft 1s ease-out",
                }}
              >
                <h1
                  className="display-2 fw-bold mb-4"
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    lineHeight: "1.2",
                    textShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
                  }}
                >
                  Simplify Your Library Management
                </h1>
                <p
                  className="lead fs-4 mb-5"
                  style={{
                    fontFamily: "'Open Sans', sans-serif",
                    opacity: "0.9",
                    lineHeight: "1.6",
                  }}
                >
                  Track books, manage members, and organize your library smarter
                  than ever with our comprehensive management system.
                </p>
                <div className="d-flex gap-3 flex-wrap">
                  <Link
                    to="/login"
                    className="btn btn-light btn-lg rounded-pill px-5 py-3"
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: "600",
                      transition: "all 0.3s ease",
                      boxShadow: "0 8px 25px rgba(255, 255, 255, 0.2)",
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = "translateY(-3px) scale(1.05)";
                      e.target.style.boxShadow =
                        "0 15px 35px rgba(255, 255, 255, 0.3)";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = "translateY(0) scale(1)";
                      e.target.style.boxShadow =
                        "0 8px 25px rgba(255, 255, 255, 0.2)";
                    }}
                  >
                    🚀 Login Now
                  </Link>
                  <Link
                    to="/register"
                    className="btn btn-outline-light btn-lg rounded-pill px-5 py-3"
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: "600",
                      transition: "all 0.3s ease",
                    }}
                    onMouseOver={(e) => {
                      e.target.style.background = "rgba(255, 255, 255, 0.1)";
                      e.target.style.transform = "translateY(-3px) scale(1.05)";
                      e.target.style.backdropFilter = "blur(10px)";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = "transparent";
                      e.target.style.transform = "translateY(0) scale(1)";
                      e.target.style.backdropFilter = "none";
                    }}
                  >
                    📝 Register
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div
                className="hero-illustration text-center"
                style={{
                  animation: "slideInRight 1s ease-out",
                }}
              >
                <div
                  className="illustration-container"
                  style={{
                    fontSize: "20rem",
                    animation: "float 3s ease-in-out infinite",
                    filter: "drop-shadow(0 10px 30px rgba(0, 0, 0, 0.3))",
                  }}
                >
                  📚
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-5" style={{ background: "#f8fafc" }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2
              className="display-4 fw-bold mb-4"
              style={{
                fontFamily: "'Poppins', sans-serif",
                background: "linear-gradient(135deg, #1E3A8A 0%, #0D9488 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Powerful Features
            </h2>
            <p
              className="lead text-muted"
              style={{ fontFamily: "'Open Sans', sans-serif" }}
            >
              Everything you need to manage your library efficiently
            </p>
          </div>

          <div className="row g-4">
            {features.map((feature, index) => (
              <div key={index} className="col-md-6 col-lg-3">
                <div
                  className="card h-100 border-0 shadow-sm"
                  style={{
                    borderRadius: "20px",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    animation: `slideInUp 0.6s ease-out ${index * 0.1}s both`,
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform =
                      "translateY(-10px) scale(1.02)";
                    e.currentTarget.style.boxShadow =
                      "0 20px 40px rgba(0, 0, 0, 0.15)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0) scale(1)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 15px rgba(0, 0, 0, 0.1)";
                  }}
                >
                  <div className="card-body text-center p-5">
                    <div
                      className="feature-icon mb-4 mx-auto d-flex align-items-center justify-content-center rounded-circle"
                      style={{
                        width: "80px",
                        height: "80px",
                        background: `linear-gradient(135deg, ${feature.color}, ${feature.color}aa)`,
                        fontSize: "2.5rem",
                        color: "white",
                        boxShadow: `0 8px 25px ${feature.color}40`,
                      }}
                    >
                      {feature.icon}
                    </div>
                    <h4
                      className="fw-bold mb-3"
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        color: "#1E3A8A",
                      }}
                    >
                      {feature.title}
                    </h4>
                    <p
                      className="text-muted"
                      style={{
                        fontFamily: "'Open Sans', sans-serif",
                        lineHeight: "1.6",
                      }}
                    >
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-5" style={{ background: "white" }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <div className="about-illustration text-center mb-5 mb-lg-0">
                <div
                  style={{
                    fontSize: "15rem",
                    animation: "float 4s ease-in-out infinite",
                    filter: "drop-shadow(0 10px 30px rgba(0, 0, 0, 0.1))",
                  }}
                >
                  🎓
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="about-content">
                <h2
                  className="display-4 fw-bold mb-4"
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    background:
                      "linear-gradient(135deg, #1E3A8A 0%, #0D9488 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  About Librario
                </h2>
                <p
                  className="lead mb-4"
                  style={{
                    fontFamily: "'Open Sans', sans-serif",
                    lineHeight: "1.8",
                    color: "#64748b",
                  }}
                >
                  Librario is built to make library operations seamless for
                  admins, librarians, and members. Our comprehensive platform
                  streamlines every aspect of library management.
                </p>
                <div className="row g-4">
                  <div className="col-6">
                    <div className="text-center">
                      <h3 className="fw-bold text-primary">10K+</h3>
                      <p className="text-muted mb-0">Books Managed</p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="text-center">
                      <h3 className="fw-bold text-primary">500+</h3>
                      <p className="text-muted mb-0">Active Libraries</p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="text-center">
                      <h3 className="fw-bold text-primary">50K+</h3>
                      <p className="text-muted mb-0">Happy Members</p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="text-center">
                      <h3 className="fw-bold text-primary">99.9%</h3>
                      <p className="text-muted mb-0">Uptime</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        className="py-5"
        style={{
          background: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
        }}
      >
        <div className="container">
          <div className="text-center mb-5">
            <h2
              className="display-4 fw-bold mb-4"
              style={{
                fontFamily: "'Poppins', sans-serif",
                background: "linear-gradient(135deg, #1E3A8A 0%, #0D9488 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              What Our Users Say
            </h2>
          </div>

          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div
                className="testimonial-card card border-0 shadow-lg"
                style={{
                  borderRadius: "25px",
                  background: "white",
                  transition: "all 0.5s ease",
                }}
              >
                <div className="card-body p-5 text-center">
                  <div className="mb-4">
                    {[...Array(testimonials[currentTestimonial].rating)].map(
                      (_, i) => (
                        <span
                          key={i}
                          style={{ color: "#FFD700", fontSize: "1.5rem" }}
                        >
                          ⭐
                        </span>
                      )
                    )}
                  </div>
                  <blockquote
                    className="mb-4"
                    style={{
                      fontSize: "1.3rem",
                      fontFamily: "'Open Sans', sans-serif",
                      lineHeight: "1.6",
                      color: "#475569",
                    }}
                  >
                    "{testimonials[currentTestimonial].text}"
                  </blockquote>
                  <div>
                    <h5
                      className="fw-bold mb-1"
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        color: "#1E3A8A",
                      }}
                    >
                      {testimonials[currentTestimonial].author}
                    </h5>
                    <p className="text-muted mb-0">
                      {testimonials[currentTestimonial].position}
                    </p>
                  </div>
                </div>
              </div>

              {/* Testimonial Indicators */}
              <div className="text-center mt-4">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    className="btn btn-sm rounded-circle mx-1"
                    style={{
                      width: "12px",
                      height: "12px",
                      background:
                        index === currentTestimonial ? "#1E3A8A" : "#cbd5e1",
                      border: "none",
                      transition: "all 0.3s ease",
                    }}
                    onClick={() => setCurrentTestimonial(index)}
                  ></button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-5"
        style={{
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          color: "white",
        }}
      >
        <div className="container">
          <div className="row">
            <div className="col-lg-4 mb-4">
              <div className="d-flex align-items-center mb-3">
                <span style={{ fontSize: "2rem" }}>📚</span>
                <h3
                  className="ms-2 mb-0"
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: "bold",
                  }}
                >
                  <em>Librario</em>
                </h3>
              </div>
              <p
                style={{
                  fontFamily: "'Open Sans', sans-serif",
                  opacity: "0.8",
                }}
              >
                Making library management simple, efficient, and enjoyable for
                everyone.
              </p>
              <div className="d-flex gap-3">
                {["📘", "🐦", "💼"].map((icon, index) => (
                  <a
                    key={index}
                    href="#"
                    className="text-white"
                    style={{
                      fontSize: "1.5rem",
                      transition: "all 0.3s ease",
                      textDecoration: "none",
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = "translateY(-3px) scale(1.2)";
                      e.target.style.opacity = "0.7";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = "translateY(0) scale(1)";
                      e.target.style.opacity = "1";
                    }}
                  >
                    {icon}
                  </a>
                ))}
              </div>
            </div>
            <div className="col-lg-2 col-md-3 mb-4">
              <h5
                className="fw-bold mb-3"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Company
              </h5>
              <ul className="list-unstyled">
                {["About", "Features", "Pricing", "Contact"].map((item) => (
                  <li key={item} className="mb-2">
                    <a
                      href={`#${item.toLowerCase()}`}
                      className="text-white"
                      style={{
                        textDecoration: "none",
                        opacity: "0.8",
                        transition: "all 0.3s ease",
                      }}
                      onMouseOver={(e) => {
                        e.target.style.opacity = "1";
                        e.target.style.paddingLeft = "8px";
                      }}
                      onMouseOut={(e) => {
                        e.target.style.opacity = "0.8";
                        e.target.style.paddingLeft = "0";
                      }}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-lg-2 col-md-3 mb-4">
              <h5
                className="fw-bold mb-3"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Legal
              </h5>
              <ul className="list-unstyled">
                {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(
                  (item) => (
                    <li key={item} className="mb-2">
                      <a
                        href="#"
                        className="text-white"
                        style={{
                          textDecoration: "none",
                          opacity: "0.8",
                          transition: "all 0.3s ease",
                        }}
                        onMouseOver={(e) => {
                          e.target.style.opacity = "1";
                          e.target.style.paddingLeft = "8px";
                        }}
                        onMouseOut={(e) => {
                          e.target.style.opacity = "0.8";
                          e.target.style.paddingLeft = "0";
                        }}
                      >
                        {item}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>
            <div className="col-lg-4 col-md-6 mb-4">
              <h5
                className="fw-bold mb-3"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Newsletter
              </h5>
              <p
                style={{
                  opacity: "0.8",
                  fontFamily: "'Open Sans', sans-serif",
                }}
              >
                Stay updated with our latest features and library management
                tips.
              </p>
              <div className="d-flex">
                <input
                  type="email"
                  className="form-control rounded-start-pill"
                  placeholder="Enter your email"
                  style={{ border: "none" }}
                />
                <button
                  className="btn btn-primary rounded-end-pill px-4"
                  style={{
                    background:
                      "linear-gradient(135deg, #0D9488 0%, #1E3A8A 100%)",
                    border: "none",
                  }}
                >
                  Subscribe
                </button>
              </div>
            </div>
          </div>
          <hr style={{ opacity: "0.2", margin: "3rem 0 2rem" }} />
          <div className="text-center">
            <p
              style={{ opacity: "0.6", fontFamily: "'Open Sans', sans-serif" }}
            >
              © 2025 Librario. All Rights Reserved. Made with ❤️ for libraries
              worldwide.
            </p>
          </div>
        </div>
      </footer>

      {/* Enhanced Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700;800&family=Open+Sans:wght@300;400;600;700&display=swap');

        /* Global Animations */
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(100px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #0D9488, #1E3A8A);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #0891b2, #1e40af);
        }

        /* Button hover effects */
        .btn {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .btn:focus {
          box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.3);
        }

        /* Card hover effects */
        .card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Navigation link underline effect */
        .nav-link::after {
          content: '';
          position: absolute;
          width: 0;
          height: 2px;
          bottom: -5px;
          left: 50%;
          background: linear-gradient(135deg, #0D9488, #1E3A8A);
          transition: all 0.3s ease;
          transform: translateX(-50%);
        }

        .nav-link:hover::after {
          width: 100%;
        }

        /* Hero section parallax effect */
        .hero-section {
          position: relative;
        }

        /* Feature cards enhanced styling */
        .feature-icon {
          transition: all 0.3s ease;
        }

        .card:hover .feature-icon {
          transform: scale(1.1) rotate(5deg);
        }

        /* Testimonial card animation */
        .testimonial-card {
          transform: translateY(0);
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .display-2 {
            font-size: 2.5rem !important;
          }
          
          .display-4 {
            font-size: 2rem !important;
          }
          
          .hero-section .illustration-container {
            font-size: 8rem !important;
          }
          
          .about-content .col-6 {
            margin-bottom: 1rem;
          }
          
          .navbar-nav {
            text-align: center;
            margin-top: 1rem;
          }
          
          .hero-content .d-flex {
            flex-direction: column;
            align-items: center;
          }
          
          .hero-content .btn {
            width: 100%;
            max-width: 300px;
            margin-bottom: 0.5rem;
          }
        }

        @media (max-width: 576px) {
          .display-2 {
            font-size: 2rem !important;
          }
          
          .display-4 {
            font-size: 1.5rem !important;
          }
          
          .hero-section .illustration-container {
            font-size: 6rem !important;
          }
          
          .feature-icon {
            width: 60px !important;
            height: 60px !important;
            font-size: 2rem !important;
          }
          
          .card-body {
            padding: 2rem !important;
          }
          
          .hero-section {
            padding: 2rem 0;
          }
        }

        /* Loading animation for lazy elements */
        .fade-in-on-scroll {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s ease;
        }

        .fade-in-on-scroll.visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* Enhanced button styles */
        .btn-primary {
          position: relative;
          overflow: hidden;
        }

        .btn-primary::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }

        .btn-primary:hover::before {
          left: 100%;
        }

        /* Newsletter input focus */
        .form-control:focus {
          border-color: #0D9488;
          box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
        }

        /* Social media hover effects */
        .social-icon {
          transition: all 0.3s ease;
        }

        .social-icon:hover {
          transform: translateY(-3px) scale(1.2);
          filter: brightness(1.2);
        }

        /* Typography enhancements */
        h1, h2, h3, h4, h5, h6 {
          font-family: 'Poppins', sans-serif;
        }

        p, span, a {
          font-family: 'Open Sans', sans-serif;
        }

        /* Selection styling */
        ::selection {
          background: rgba(13, 148, 136, 0.3);
          color: #1E3A8A;
        }

        /* Focus visibility */
        *:focus {
          outline: 2px solid #0D9488;
          outline-offset: 2px;
        }

        /* Image lazy loading placeholder */
        img {
          transition: opacity 0.3s ease;
        }

        img[loading="lazy"] {
          opacity: 0;
        }

        img[loading="lazy"].loaded {
          opacity: 1;
        }

        /* Improved contrast for accessibility */
        .text-muted {
          color: #64748b !important;
        }

        /* Enhanced shadows */
        .shadow-sm {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
        }

        .shadow {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12) !important;
        }

        .shadow-lg {
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.16) !important;
        }
      `}</style>
    </div>
  );
}

export default LandingPage;
