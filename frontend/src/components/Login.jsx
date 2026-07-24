import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:8080/api/users/login",
        { email, password }
      );

      const { token, username, role, memberId } = response.data;

      // Store login info
      localStorage.setItem("token", token);
      localStorage.setItem("username", username);
      localStorage.setItem("role", role);

      // ✅ Store memberId only for MEMBER role
      if (role === "MEMBER") {
        localStorage.setItem("memberId", memberId);
      } else {
        localStorage.removeItem("memberId"); // ensure no leftover
      }

      if (!memberId) {
        console.warn(
          "⚠️ Member ID not found in localStorage. Are you logged in as MEMBER?"
        );
      }

      alert(`Login successful!\nWelcome, ${username}!\nRole: ${role}`);
      setMessage("Login successful!");

      // Redirect based on role
      if (role === "ADMIN") navigate("/admin-dashboard");
      else if (role === "LIBRARIAN") navigate("/librarian-dashboard");
      else if (role === "MEMBER") navigate("/member-dashboard");
      else setMessage("Unknown role.");
    } catch (err) {
      const errMsg = err.response?.data?.message || (typeof err.response?.data === 'string' ? err.response?.data : null) || "Server error";
      setMessage("Login failed: " + errMsg);
    }
  };

  // Floating books animation
  const FloatingBook = ({ delay, duration, size = 40 }) => (
    <div
      style={{
        position: "absolute",
        fontSize: `${size}px`,
        opacity: 0.1,
        animation: `float ${duration}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        color: "#ffffff",
        zIndex: 0,
      }}
    >
      📚
    </div>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "100px 20px 20px 20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* CSS Keyframes */}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            25% { transform: translateY(-20px) rotate(5deg); }
            50% { transform: translateY(-10px) rotate(-3deg); }
            75% { transform: translateY(-15px) rotate(2deg); }
          }
          
          @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          
          @keyframes shimmer {
            0% { background-position: -200px 0; }
            100% { background-position: 200px 0; }
          }
          
          .login-form {
            animation: slideInUp 0.8s ease-out;
          }
          
          .form-group {
            animation: slideInUp 0.8s ease-out;
          }
          
          .form-group:nth-child(1) { animation-delay: 0.1s; }
          .form-group:nth-child(2) { animation-delay: 0.2s; }
          .form-group:nth-child(3) { animation-delay: 0.3s; }
          
          .shimmer-input {
            background: linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.1) 100%);
            background-size: 200px 100%;
            animation: shimmer 2s infinite;
          }
          
          .login-button:hover {
            animation: pulse 0.5s ease-in-out;
          }
        `}
      </style>

      {/* Floating Books Background */}
      <FloatingBook delay={0} duration={6} size={30} />
      <FloatingBook delay={1} duration={8} size={45} />
      <FloatingBook delay={2} duration={5} size={35} />
      <FloatingBook delay={3} duration={7} size={40} />
      <FloatingBook delay={4} duration={6} size={50} />

      {/* Additional floating elements */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "15%",
          fontSize: "25px",
          opacity: 0.1,
          animation: "float 4s ease-in-out infinite",
        }}
      >
        📖
      </div>
      <div
        style={{
          position: "absolute",
          top: "20%",
          right: "20%",
          fontSize: "30px",
          opacity: 0.1,
          animation: "float 5s ease-in-out infinite",
          animationDelay: "1s",
        }}
      >
        📝
      </div>
      <div
        style={{
          position: "absolute",
          bottom: "15%",
          left: "10%",
          fontSize: "35px",
          opacity: 0.1,
          animation: "float 6s ease-in-out infinite",
          animationDelay: "2s",
        }}
      >
        🏛️
      </div>
      <div
        style={{
          position: "absolute",
          bottom: "25%",
          right: "15%",
          fontSize: "28px",
          opacity: 0.1,
          animation: "float 4.5s ease-in-out infinite",
          animationDelay: "0.5s",
        }}
      >
        ⭐
      </div>

      {/* Main Login Card */}
      <div
        className="login-form"
        style={{
          backdropFilter: "blur(20px)",
          backgroundColor: "rgba(255, 255, 255, 0.15)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "20px",
          padding: "40px",
          width: "100%",
          maxWidth: "450px",
          color: "#fff",
          boxShadow:
            "0 15px 35px rgba(0, 0, 0, 0.1), 0 5px 15px rgba(0, 0, 0, 0.07)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Header Section */}
        <div className="text-center mb-4">
          <div
            style={{
              fontSize: "4rem",
              marginBottom: "10px",
              animation: "pulse 2s ease-in-out infinite",
            }}
          >
            📚
          </div>
          <h2
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: "600",
              marginBottom: "8px",
              background: "linear-gradient(135deg, #fff 0%, #e8f4fd 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Welcome Back
          </h2>
          <p
            style={{
              opacity: 0.8,
              fontSize: "0.95rem",
              fontFamily: "'Open Sans', sans-serif",
            }}
          >
            Your gateway to knowledge awaits
          </p>
        </div>

        {/* Alert Message */}
        {message && (
          <div
            className="alert"
            style={{
              background: message.includes("successful")
                ? "rgba(40, 167, 69, 0.2)"
                : "rgba(220, 53, 69, 0.2)",
              border: `1px solid ${
                message.includes("successful")
                  ? "rgba(40, 167, 69, 0.3)"
                  : "rgba(220, 53, 69, 0.3)"
              }`,
              borderRadius: "10px",
              color: "#fff",
              padding: "12px",
              marginBottom: "20px",
              fontSize: "0.9rem",
            }}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email Input */}
          <div className="form-group mb-3 mt-2">
            <label
              style={{
                fontSize: "0.9rem",
                fontWeight: "500",
                marginBottom: "8px",
                display: "block",
              }}
            >
              Email
            </label>
            <input
              type="email"
              className="form-control shimmer-input"
              placeholder="Enter email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "12px",
                color: "#fff",
                padding: "12px 16px",
                fontSize: "0.95rem",
                transition: "all 0.3s ease",
                backdropFilter: "blur(5px)",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(255, 255, 255, 0.4)";
                e.target.style.backgroundColor = "rgba(255, 255, 255, 0.15)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(255, 255, 255, 0.2)";
                e.target.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
              }}
            />
          </div>

          {/* Password Input */}
          <div className="form-group mb-4">
            <label
              style={{
                fontSize: "0.9rem",
                fontWeight: "500",
                marginBottom: "8px",
                display: "block",
              }}
            >
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                className="form-control shimmer-input"
                placeholder="Enter password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "12px",
                  color: "#fff",
                  padding: "12px 45px 12px 16px",
                  fontSize: "0.95rem",
                  transition: "all 0.3s ease",
                  backdropFilter: "blur(5px)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "rgba(255, 255, 255, 0.4)";
                  e.target.style.backgroundColor = "rgba(255, 255, 255, 0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(255, 255, 255, 0.2)";
                  e.target.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "#fff",
                  cursor: "pointer",
                  opacity: 0.7,
                  transition: "opacity 0.3s ease",
                }}
                onMouseOver={(e) => (e.target.style.opacity = "1")}
                onMouseOut={(e) => (e.target.style.opacity = "0.7")}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            className="btn w-100 mb-3 login-button"
            type="submit"
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
              borderRadius: "12px",
              padding: "14px",
              fontSize: "1rem",
              fontWeight: "600",
              color: "#fff",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseOver={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.4)";
            }}
            onMouseOut={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.3)";
            }}
          >
            Login
          </button>

          {/* Footer Links */}
          <div className="text-center">
            <a
              href="/forgot-password"
              className="text-light d-block"
              style={{
                textDecoration: "none",
                marginBottom: "12px",
                opacity: 0.9,
                fontSize: "0.9rem",
                transition: "all 0.3s ease",
              }}
              onMouseOver={(e) => {
                e.target.style.opacity = "1";
                e.target.style.textDecoration = "underline";
              }}
              onMouseOut={(e) => {
                e.target.style.opacity = "0.9";
                e.target.style.textDecoration = "none";
              }}
            >
              Forgot Password?
            </a>
            <span
              className="text-light"
              style={{ fontSize: "0.9rem", opacity: 0.9 }}
            >
              New user?{" "}
              <a
                href="/register"
                className="text-light"
                style={{
                  textDecoration: "none",
                  fontWeight: "500",
                  transition: "all 0.3s ease",
                }}
                onMouseOver={(e) => {
                  e.target.style.textDecoration = "underline";
                  e.target.style.opacity = "1";
                }}
                onMouseOut={(e) => {
                  e.target.style.textDecoration = "none";
                  e.target.style.opacity = "0.9";
                }}
              >
                Register here
              </a>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
