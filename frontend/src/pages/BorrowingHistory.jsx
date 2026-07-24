import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

function BorrowingHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      let readerId = localStorage.getItem("memberId") || localStorage.getItem("userId");
      if (!readerId) {
        const username = localStorage.getItem("username");
        if (username) {
          const usersRes = await axiosInstance.get("/users");
          const me = usersRes.data.find(u =>
            u.username === username || u.email === username || u.name === username
          );
          if (me) { readerId = me.id || me.userId; localStorage.setItem("memberId", readerId); }
        }
      }
      if (!readerId) { setLoading(false); return; }
      const res = await axiosInstance.get(`/library/borrows/history?readerId=${readerId}`);
      setHistory(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("Error fetching borrow history:", e);
    } finally {
      setLoading(false);
    }
  };

  const statusOf = (r) => {
    const s = r.SlipStatus || r.slipStatus || "";
    return s.toLowerCase();
  };

  const filtered = history.filter((r) => {
    const status = statusOf(r);
    const title = (r.BookTitle || r.bookTitle || "").toLowerCase();
    const matchFilter =
      filter === "ALL" ||
      (filter === "Borrowing" && status === "borrowing") ||
      (filter === "Returned" && status === "returned") ||
      (filter === "Overdue" && status === "overdue");
    const matchSearch = !searchTerm || title.includes(searchTerm.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts = {
    total: history.length,
    borrowing: history.filter(r => statusOf(r) === "borrowing").length,
    returned: history.filter(r => statusOf(r) === "returned").length,
    overdue: history.filter(r => statusOf(r) === "overdue").length,
  };

  const statusBadge = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "returned") return { bg: "#28a745", text: "✅ Đã trả" };
    if (s === "overdue") return { bg: "#dc3545", text: "⚠️ Quá hạn" };
    return { bg: "#fd7e14", text: "📖 Đang mượn" };
  };

  const formatDate = (val) => {
    if (!val) return "—";
    try { return new Date(val).toLocaleDateString("vi-VN"); } catch { return val; }
  };

  const fine = (r) => {
    const f = Number(r.FineAmount || r.fineAmount || 0);
    return f > 0 ? `💰 ${f.toLocaleString()} VND` : null;
  };

  return (
    <>
      <style>{`
        .history-bg {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          padding-top: 90px;
          padding-bottom: 60px;
        }
        .history-bg::before {
          content: '';
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background:
            radial-gradient(circle at 20% 80%, rgba(120,119,198,0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255,119,198,0.15) 0%, transparent 50%);
          pointer-events: none;
          z-index: 0;
        }
        .z1 { position: relative; z-index: 1; }
        .stats-pill {
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 20px;
          padding: 20px;
          text-align: center;
          color: white;
          transition: transform 0.3s;
        }
        .stats-pill:hover { transform: translateY(-5px); }
        .card-clean {
          background: #fff;
          border-radius: 16px;
          border: 1px solid #e9ecef;
          padding: 22px;
          margin-bottom: 14px;
          transition: all 0.3s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          position: relative;
          overflow: hidden;
        }
        .card-clean::before {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 4px; height: 100%;
          opacity: 0;
          transition: opacity 0.3s;
        }
        .card-clean.status-borrowing::before { background: #fd7e14; opacity: 1; }
        .card-clean.status-returned::before { background: #28a745; opacity: 1; }
        .card-clean.status-overdue::before { background: #dc3545; opacity: 1; }
        .card-clean:hover { transform: translateY(-4px); box-shadow: 0 10px 25px rgba(0,0,0,0.12); }
        .filter-btn { border-radius: 50px; font-weight: 600; transition: all 0.3s; }
        .filter-btn.active { background: white; color: #667eea; }
        .date-chip {
          background: rgba(102,126,234,0.08);
          border-radius: 8px;
          padding: 6px 12px;
          font-size: 0.82rem;
          color: #495057;
        }
        .date-chip strong { color: #667eea; }
        .status-badge {
          display: inline-block;
          padding: 5px 14px;
          border-radius: 50px;
          font-weight: 700;
          font-size: 0.8rem;
          color: white;
          letter-spacing: 0.3px;
        }
      `}</style>

      <div className="history-bg">
        <div className="container z1">
          {/* Header */}
          <div className="d-flex align-items-center gap-3 mb-4">
            <button className="btn btn-outline-light rounded-pill px-4" onClick={() => navigate(-1)}>
              ← Quay lại
            </button>
            <div>
              <h3 className="text-white fw-bold mb-0">📋 Lịch Sử Mượn Sách</h3>
              <small className="text-white-50">Toàn bộ lịch sử mượn/trả sách của bạn</small>
            </div>
          </div>

          {/* Stats */}
          <div className="row g-3 mb-4">
            {[
              { label: "Tổng phiếu", val: counts.total, color: "white" },
              { label: "Đang mượn", val: counts.borrowing, color: "#fd7e14" },
              { label: "Đã trả", val: counts.returned, color: "#43e97b" },
              { label: "Quá hạn", val: counts.overdue, color: "#ff6b6b" },
            ].map((s, i) => (
              <div key={i} className="col-md-3 col-6">
                <div className="stats-pill">
                  <div style={{ fontSize: "1.8rem", fontWeight: 800, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: "0.82rem", opacity: 0.85 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Filter & Search */}
          <div className="bg-white rounded-4 p-4 mb-4 shadow-sm">
            <div className="row align-items-center g-3">
              <div className="col-md-6">
                <input
                  className="form-control rounded-pill border-0 bg-light"
                  placeholder="🔍 Tìm theo tên sách..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="col-md-6 d-flex flex-wrap gap-2">
                {["ALL", "Borrowing", "Returned", "Overdue"].map(f => (
                  <button
                    key={f}
                    className={`btn btn-sm filter-btn ${filter === f ? "active btn-primary shadow-sm" : "btn-outline-secondary"}`}
                    onClick={() => setFilter(f)}
                  >
                    {f === "ALL" ? `Tất cả (${counts.total})` :
                     f === "Borrowing" ? `📖 Đang mượn (${counts.borrowing})` :
                     f === "Returned" ? `✅ Đã trả (${counts.returned})` :
                     `⚠️ Quá hạn (${counts.overdue})`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* List */}
          {loading ? (
            <div className="text-center text-white py-5">
              <div className="spinner-border" />
              <p className="mt-3">Đang tải...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-white py-5">
              <div style={{ fontSize: "3.5rem", opacity: 0.4 }}>📚</div>
              <h5 className="mt-3">Không có dữ liệu</h5>
              <p className="text-white-50">Bạn chưa có lịch sử mượn sách nào.</p>
              <button className="btn btn-light rounded-pill px-4 mt-2" onClick={() => navigate("/book-catalog")}>
                Khám phá sách ngay
              </button>
            </div>
          ) : (
            filtered.map((r, i) => {
              const slipStatus = (r.SlipStatus || r.slipStatus || "").toLowerCase();
              const badge = statusBadge(slipStatus);
              const fineText = fine(r);
              const condition = r.BookCondition || r.bookCondition;
              return (
                <div key={i} className={`card-clean status-${slipStatus}`}>
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <h6 className="fw-bold mb-1" style={{ color: "#2c3e50", fontSize: "1.05rem" }}>
                        📖 {r.BookTitle || r.bookTitle || "—"}
                      </h6>
                      {(r.ReaderName || r.readerName) && (
                        <small className="text-muted">👤 {r.ReaderName || r.readerName}</small>
                      )}
                      <div className="d-flex flex-wrap gap-2 mt-2">
                        <span className="date-chip">
                          <strong>Ngày mượn:</strong> {formatDate(r.BorrowDate || r.borrowDate)}
                        </span>
                        <span className="date-chip">
                          <strong>Hạn trả:</strong> {formatDate(r.DueDate || r.dueDate)}
                        </span>
                        <span className="date-chip">
                          <strong>Đã trả:</strong> {formatDate(r.ReturnDate || r.returnDate)}
                        </span>
                        {condition && (
                          <span className="date-chip">
                            <strong>Tình trạng:</strong> {condition}
                          </span>
                        )}
                        {fineText && (
                          <span className="date-chip" style={{ color: "#dc3545" }}>
                            <strong>{fineText}</strong>
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="ms-3 text-end">
                      <span className="status-badge" style={{ background: badge.bg }}>
                        {badge.text}
                      </span>
                      <div className="mt-2">
                        <small className="text-muted">#{r.BorrowSlipId || r.borrowSlipId}</small>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}

export default BorrowingHistory;
