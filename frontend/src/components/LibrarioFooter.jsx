import { useState } from "react";

const LibrarioFooter = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = () => {
    if (email) {
      alert(`Thank you for subscribing with email: ${email}`);
      setEmail("");
    }
  };

  return (
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
              Stay updated with our latest features and library management tips.
            </p>
            <div className="d-flex">
              <input
                type="email"
                className="form-control rounded-start-pill"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ border: "none" }}
              />
              <button
                onClick={handleSubscribe}
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
          <p style={{ opacity: "0.6", fontFamily: "'Open Sans', sans-serif" }}>
            © 2025 Librario. All Rights Reserved. Made with ❤️ for libraries
            worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default LibrarioFooter;
