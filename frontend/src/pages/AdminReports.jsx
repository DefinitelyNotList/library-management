import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

function AdminReports() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [topBooks, setTopBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axiosInstance.get("/library/statistics"),
      axiosInstance.get("/library/top-books"),
    ])
      .then(([statsRes, topRes]) => {
        setStats(statsRes.data);
        setTopBooks(Array.isArray(topRes.data) ? topRes.data : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const maxBorrowed = topBooks.length > 0
    ? Math.max(...topBooks.map(b => Number(b.TimesBorrowed || b.timesBorrowed || 0)))
    : 1;

  const getBarWidth = (val) => Math.max(8, (val / maxBorrowed) * 100);

  const BAR_COLORS = [
    "linear-gradient(90deg,#667eea,#764ba2)",
    "linear-gradient(90deg,#f093fb,#f5576c)",
    "linear-gradient(90deg,#43e97b,#38f9d7)",
    "linear-gradient(90deg,#fa709a,#fee140)",
    "linear-gradient(90deg,#4facfe,#00f2fe)",
    "linear-gradient(90deg,#a18cd1,#fbc2eb)",
    "linear-gradient(90deg,#ffecd2,#fcb69f)",
    "linear-gradient(90deg,#a1c4fd,#c2e9fb)",
    "linear-gradient(90deg,#fd7474,#f9b16e)",
    "linear-gradient(90deg,#84fab0,#8fd3f4)",
  ];

  const getStat = (k1, k2) => stats ? (stats[k1] ?? stats[k2] ?? 0) : 0;

  const totalSlips = Number(getStat("TotalBorrowSlips", "totalBorrowSlips"));
  const currentlyBorrowing = Number(getStat("CurrentlyBorrowing", "currentlyBorrowing"));
  const overdueSlips = Number(getStat("OverdueSlips", "overdueSlips"));
  const returned = totalSlips - currentlyBorrowing - overdueSlips;

  // Donut chart via conic-gradient
  const donutTotal = currentlyBorrowing + overdueSlips + returned;
  const p1 = donutTotal > 0 ? (currentlyBorrowing / donutTotal) * 360 : 0;
  const p2 = donutTotal > 0 ? (overdueSlips / donutTotal) * 360 : 0;
  const donutStyle = donutTotal > 0
    ? `conic-gradient(#4facfe 0deg ${p1}deg, #ff6b6b ${p1}deg ${p1 + p2}deg, #43e97b ${p1 + p2}deg 360deg)`
    : "conic-gradient(#555 0deg 360deg)";

  return (
    <>
      <style>{`
        .reports-bg {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%);
          min-height: 100vh;
          padding-top: 90px;
          padding-bottom: 60px;
        }
        .glass-card {
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          color: white;
        }
        .stat-pill {
          background: rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 24px;
          text-align: center;
          border: 1px solid rgba(255,255,255,0.1);
          transition: transform 0.3s;
        }
        .stat-pill:hover { transform: translateY(-5px); }
        .bar-track {
          height: 32px;
          background: rgba(255,255,255,0.08);
          border-radius: 8px;
          overflow: hidden;
          position: relative;
        }
        .bar-fill {
          height: 100%;
          border-radius: 8px;
          transition: width 1.2s ease;
          display: flex;
          align-items: center;
          padding-left: 10px;
          font-size: 0.78rem;
          font-weight: 600;
          color: rgba(255,255,255,0.9);
          white-space: nowrap;
        }
        .donut-wrap {
          width: 180px;
          height: 180px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          position: relative;
        }
        .donut-inner {
          width: 110px;
          height: 110px;
          background: #16213e;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          position: absolute;
        }
        .legend-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          display: inline-block;
          margin-right: 6px;
        }
      `}</style>

      <div className="reports-bg">
        <div className="container">
          {/* Header */}
          <div className="d-flex align-items-center gap-3 mb-5">
            <button className="btn btn-outline-light rounded-pill px-4" onClick={() => navigate("/admin-dashboard")}>
              ← Quay lại
            </button>
            <div>
              <h2 className="text-white fw-bold mb-0">📊 Báo Cáo & Thống Kê</h2>
              <p className="text-white-50 mb-0">Tổng quan hệ thống thư viện</p>
            </div>
          </div>

          {loading ? (
            <div className="text-center text-white py-5">
              <div className="spinner-border" />
              <p className="mt-3">Đang tải dữ liệu...</p>
            </div>
          ) : (
            <>
              {/* Stats Overview */}
              {stats && (
                <div className="row g-3 mb-5">
                  {[
                    { emoji: "📚", label: "Tổng đầu sách", value: getStat("TotalBooks","totalBooks"), color: "#667eea" },
                    { emoji: "👥", label: "Độc giả", value: getStat("TotalReaders","totalReaders"), color: "#4facfe" },
                    { emoji: "👨‍🏫", label: "Thủ thư", value: getStat("TotalLibrarians","totalLibrarians"), color: "#43e97b" },
                    { emoji: "📜", label: "Tổng phiếu mượn", value: totalSlips, color: "#a18cd1" },
                    { emoji: "📗", label: "Đang mượn", value: currentlyBorrowing, color: "#4facfe" },
                    { emoji: "⚠️", label: "Quá hạn", value: overdueSlips, color: "#ff6b6b" },
                    { emoji: "💰", label: "Tiền phạt (VND)", value: Number(getStat("TotalFineCollected","totalFineCollected")).toLocaleString(), color: "#fee140" },
                  ].map((s, i) => (
                    <div key={i} className="col-md-3 col-6">
                      <div className="stat-pill">
                        <div style={{ fontSize: "2rem" }}>{s.emoji}</div>
                        <div style={{ color: s.color, fontSize: "1.6rem", fontWeight: 700 }}>{s.value}</div>
                        <div className="text-white-50" style={{ fontSize: "0.82rem" }}>{s.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="row g-4">
                {/* Top Borrowed Books Chart */}
                <div className="col-lg-7">
                  <div className="glass-card p-4 h-100">
                    <h5 className="fw-bold mb-4">🏆 Top Sách Được Mượn Nhiều Nhất</h5>
                    {topBooks.length === 0 ? (
                      <p className="text-white-50 text-center py-4">Chưa có dữ liệu mượn sách.</p>
                    ) : (
                      <div className="d-flex flex-column gap-3">
                        {topBooks.map((book, i) => {
                          const times = Number(book.TimesBorrowed || book.timesBorrowed || 0);
                          const title = book.Title || book.title || "—";
                          const author = book.AuthorName || book.authorName || "";
                          return (
                            <div key={i}>
                              <div className="d-flex justify-content-between mb-1">
                                <span style={{ fontSize: "0.88rem" }}>
                                  <span className="me-2 text-warning fw-bold">#{i + 1}</span>
                                  {title}
                                  {author && <span className="text-white-50"> — {author}</span>}
                                </span>
                                <span className="fw-bold" style={{ color: "#43e97b", minWidth: "40px", textAlign: "right" }}>
                                  {times}×
                                </span>
                              </div>
                              <div className="bar-track">
                                <div
                                  className="bar-fill"
                                  style={{
                                    width: `${getBarWidth(times)}%`,
                                    background: BAR_COLORS[i % BAR_COLORS.length],
                                  }}
                                >
                                  {times > 0 ? `${times} lần` : ""}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Borrow Status Donut */}
                <div className="col-lg-5">
                  <div className="glass-card p-4 h-100 text-center">
                    <h5 className="fw-bold mb-4">📈 Tỉ Lệ Trạng Thái Phiếu Mượn</h5>
                    <div className="donut-wrap" style={{ background: donutStyle }}>
                      <div className="donut-inner">
                        <div style={{ fontSize: "1.4rem", fontWeight: 700 }}>{totalSlips}</div>
                        <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.6)" }}>phiếu</div>
                      </div>
                    </div>
                    <div className="d-flex flex-column gap-2 mt-4 text-start px-3">
                      <div className="d-flex align-items-center justify-content-between">
                        <div>
                          <span className="legend-dot" style={{ background: "#4facfe" }} />
                          <span style={{ fontSize: "0.88rem" }}>Đang mượn</span>
                        </div>
                        <strong>{currentlyBorrowing}</strong>
                      </div>
                      <div className="d-flex align-items-center justify-content-between">
                        <div>
                          <span className="legend-dot" style={{ background: "#ff6b6b" }} />
                          <span style={{ fontSize: "0.88rem" }}>Quá hạn</span>
                        </div>
                        <strong>{overdueSlips}</strong>
                      </div>
                      <div className="d-flex align-items-center justify-content-between">
                        <div>
                          <span className="legend-dot" style={{ background: "#43e97b" }} />
                          <span style={{ fontSize: "0.88rem" }}>Đã trả</span>
                        </div>
                        <strong>{returned >= 0 ? returned : 0}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default AdminReports;
