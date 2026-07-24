import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

const GENRE_EMOJI = {
  "Văn học": "📖", "Tiểu thuyết": "📚", "Khoa học": "🔬", "Lập trình": "💻",
  "Lịch sử": "🏛️", "Kinh tế": "💹", "Tâm lý": "🧠", "Thiếu nhi": "🌟",
  "Giáo dục": "🎓", "Triết học": "🤔", "Nghệ thuật": "🎨", "Khoa học viễn tưởng": "🚀",
  "Trinh thám": "🔍", "Kỹ năng": "⚡", default: "📕"
};

function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [requestDone, setRequestDone] = useState(false);
  const role = localStorage.getItem("role");
  // Backend converts DB role 'READER' → 'MEMBER' in JWT response
  const isLoggedIn = !!localStorage.getItem("token");
  const isReader = role === "MEMBER" || role === "READER";
  const isAdmin = role === "ADMIN";
  const isLibrarian = role === "LIBRARIAN";

  useEffect(() => {
    fetchBook();
  }, [id]);

  const fetchBook = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/books/${id}`);
      setBook(res.data);
    } catch (e) {
      setError("Không tìm thấy sách.");
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async () => {
    if (!isLoggedIn) { navigate("/login"); return; }
    if (!isReader) {
      alert("⚠️ Chỉ độc giả mới có thể gửi yêu cầu mượn sách.");
      return;
    }
    try {
      setRequesting(true);
      let memberId = localStorage.getItem("memberId") || localStorage.getItem("userId");
      if (!memberId) {
        const usersRes = await axiosInstance.get("/users");
        const username = localStorage.getItem("username");
        const me = usersRes.data.find(u =>
          u.username === username || u.email === username || u.name === username
        );
        if (me) {
          memberId = me.id || me.userId;
          localStorage.setItem("memberId", memberId);
        }
      }
      if (!memberId) {
        alert("⚠️ Không xác định được tài khoản. Vui lòng đăng nhập lại.");
        return;
      }
      await axiosInstance.post(`/requests/member/${memberId}/book/${id}`);
      setRequestDone(true);
    } catch (e) {
      alert("❌ " + (e.response?.data?.message || "Gửi yêu cầu thất bại."));
    } finally {
      setRequesting(false);
    }
  };

  const isAvail = book && (book.availableCopies > 0 || (book.status || "").toLowerCase().includes("avail"));
  const coverEmoji = book ? (GENRE_EMOJI[book.genre] || GENRE_EMOJI.default) : "📕";

  return (
    <>
      <style>{`
        .book-detail-hero {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
          min-height: 100vh;
          padding-top: 90px;
        }
        .book-cover-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 24px;
          width: 240px;
          height: 320px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 8rem;
          box-shadow: 0 30px 60px rgba(0,0,0,0.4);
          margin: 0 auto;
          animation: float 4s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50% { transform: translateY(-15px) rotate(2deg); }
        }
        .glass-card {
          background: rgba(255,255,255,0.07);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 20px;
          color: white;
        }
        .info-pill {
          background: rgba(255,255,255,0.12);
          border-radius: 50px;
          padding: 8px 18px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin: 4px;
          font-size: 0.9rem;
          color: rgba(255,255,255,0.9);
        }
        .avail-badge {
          background: linear-gradient(135deg, #43e97b, #38f9d7);
          color: #1a1a2e;
          border-radius: 50px;
          padding: 6px 18px;
          font-weight: 700;
          font-size: 0.85rem;
        }
        .unavail-badge {
          background: linear-gradient(135deg, #ff6b6b, #ee5a52);
          color: white;
          border-radius: 50px;
          padding: 6px 18px;
          font-weight: 700;
          font-size: 0.85rem;
        }
        .btn-request {
          background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
          color: #1a1a2e;
          border: none;
          border-radius: 50px;
          padding: 14px 36px;
          font-weight: 700;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 10px 30px rgba(67,233,123,0.3);
        }
        .btn-request:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(67,233,123,0.5);
        }
        .btn-request:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        .divider { border-color: rgba(255,255,255,0.15); }
        .quantity-bar {
          height: 8px;
          background: rgba(255,255,255,0.15);
          border-radius: 10px;
          overflow: hidden;
        }
        .quantity-fill {
          height: 100%;
          background: linear-gradient(90deg, #43e97b, #38f9d7);
          border-radius: 10px;
          transition: width 1s ease;
        }
      `}</style>

      <div className="book-detail-hero">
        <div className="container py-5">
          {/* Back Button */}
          <button
            className="btn btn-outline-light rounded-pill mb-4 px-4"
            onClick={() => navigate(-1)}
          >
            ← Quay lại
          </button>

          {loading && (
            <div className="text-center text-white py-5">
              <div className="spinner-border" role="status" />
              <p className="mt-3">Đang tải...</p>
            </div>
          )}
          {error && <div className="alert alert-danger">{error}</div>}

          {book && (
            <div className="row g-5 align-items-start">
              {/* Left: Cover */}
              <div className="col-lg-4 text-center">
                <div className="book-cover-card">{coverEmoji}</div>
                <div className="mt-4">
                  {isAvail
                    ? <span className="avail-badge">✅ Còn sách</span>
                    : <span className="unavail-badge">❌ Hết sách</span>
                  }
                </div>

                {/* Quantity bar */}
                {book.totalCopies > 0 && (
                  <div className="mt-3 px-3">
                    <small className="text-white-50 d-block mb-1">
                      {book.availableCopies}/{book.totalCopies} cuốn còn sẵn
                    </small>
                    <div className="quantity-bar">
                      <div
                        className="quantity-fill"
                        style={{ width: `${(book.availableCopies / book.totalCopies) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Request button */}
                <div className="mt-4">
                  {requestDone ? (
                    <div className="alert alert-success rounded-4 text-center">
                      ✅ Đã gửi yêu cầu mượn!<br />
                      <small>Thủ thư sẽ xác nhận sớm.</small>
                    </div>
                  ) : isReader && isAvail ? (
                    <button
                      className="btn-request w-100"
                      onClick={handleRequest}
                      disabled={requesting}
                    >
                      {requesting ? "⏳ Đang gửi..." : "📖 Yêu Cầu Mượn Sách"}
                    </button>
                  ) : isReader && !isAvail ? (
                    <button className="btn btn-secondary rounded-pill w-100 py-3" disabled>
                      🚫 Hết sách
                    </button>
                  ) : !isLoggedIn ? (
                    <button className="btn btn-outline-light rounded-pill w-100 py-3" onClick={() => navigate("/login")}>
                      🔑 Đăng nhập để mượn sách
                    </button>
                  ) : null}
                </div>
              </div>

              {/* Right: Details */}
              <div className="col-lg-8">
                <div className="glass-card p-5">
                  <h1 className="fw-bold mb-2" style={{ fontSize: "2rem" }}>{book.title}</h1>
                  {book.author && (
                    <p className="text-white-50 mb-4" style={{ fontSize: "1.15rem" }}>
                      ✍️ {book.author}
                    </p>
                  )}

                  <hr className="divider" />

                  <div className="row g-3 my-2">
                    <div className="col-sm-6">
                      <div className="info-pill">
                        <span>🏷️</span>
                        <span><strong>Thể loại:</strong> {book.genre || "Chưa phân loại"}</span>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="info-pill">
                        <span>🏢</span>
                        <span><strong>NXB:</strong> {book.publisher || "—"}</span>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="info-pill">
                        <span>📅</span>
                        <span><strong>Năm XB:</strong> {book.year || "—"}</span>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="info-pill">
                        <span>🔖</span>
                        <span><strong>ISBN:</strong> {book.isbn || "—"}</span>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="info-pill">
                        <span>📦</span>
                        <span><strong>Tổng số:</strong> {book.totalCopies ?? "—"} cuốn</span>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="info-pill">
                        <span>✅</span>
                        <span><strong>Còn lại:</strong> {book.availableCopies ?? "—"} cuốn</span>
                      </div>
                    </div>
                  </div>

                  <hr className="divider" />

                  <div className="d-flex flex-wrap gap-2 mt-3">
                    <span className={`badge rounded-pill px-4 py-2 fs-6 ${isAvail ? "bg-success" : "bg-danger"}`}>
                      {isAvail ? "📗 Available" : "📕 Out of stock"}
                    </span>
                    {book.genre && (
                      <span className="badge rounded-pill px-4 py-2 fs-6" style={{ background: "rgba(102,126,234,0.5)" }}>
                        {book.genre}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default BookDetailPage;
