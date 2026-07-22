import { useEffect, useMemo, useState } from "react";
import { OverlayTrigger, Spinner, Tooltip } from "react-bootstrap";
import axiosInstance from "../utils/axiosInstance";

export default function LibrariansList() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [view, setView] = useState("table");

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await axiosInstance.get("/users");
      const allUsers = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.content)
        ? res.data.content
        : [];
      const librarians = allUsers.filter((u) => u.role === "LIBRARIAN");
      setRows(librarians);
    } catch (e) {
      console.error(e);
      setErr("Failed to load librarians.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const needle = q.toLowerCase().trim();
    if (!needle) return rows;
    return rows.filter(
      (r) =>
        r.name?.toLowerCase().includes(needle) ||
        r.email?.toLowerCase().includes(needle)
    );
  }, [rows, q]);

  return (
    <div
      className="container "
      style={{ marginTop: "120px", marginBottom: "100px" }}
    >
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 mt-4 pt-4">
        <h3 className="fw-bold mb-0 text-primary">📋 Librarians</h3>
        <div className="d-flex gap-2 align-items-center flex-wrap">
          <input
            className="form-control"
            placeholder="Search name or email…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ minWidth: 260 }}
          />
          <button
            className="btn btn-primary d-flex align-items-center gap-1"
            onClick={load}
            disabled={loading}
          >
            {loading && <Spinner animation="border" size="sm" />}⟳ Refresh
          </button>
          <div className="btn-group ms-2">
            <button
              className={`btn btn-outline-primary ${
                view === "table" ? "active" : ""
              }`}
              onClick={() => setView("table")}
            >
              Table View
            </button>
            <button
              className={`btn btn-outline-primary ${
                view === "card" ? "active" : ""
              }`}
              onClick={() => setView("card")}
            >
              Card View
            </button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {err && <div className="alert alert-danger">{err}</div>}

      {/* Loading */}
      {loading ? (
        <div className="d-flex justify-content-center my-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-muted my-5">
          <p className="fs-5">No librarians found.</p>
        </div>
      ) : view === "table" ? (
        <div className="table-responsive shadow-sm rounded-4">
          <table className="table table-hover table-striped align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr
                  key={r.id || r.email || i}
                  className="table-hover-effect"
                  style={{
                    transition: "all 0.2s",
                  }}
                >
                  <td>{i + 1}</td>
                  <td>{r.name || "-"}</td>
                  <td>
                    {r.email ? (
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>{r.email}</Tooltip>}
                      >
                        <span
                          className="text-truncate d-inline-block"
                          style={{ maxWidth: 250 }}
                        >
                          {r.email}
                        </span>
                      </OverlayTrigger>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>
                    <span className="badge bg-primary">{r.role}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="row g-3">
          {filtered.map((r, i) => (
            <div className="col-md-4 col-sm-6" key={r.id || r.email || i}>
              <div
                className="card shadow-sm h-100 card-hover"
                style={{
                  transition: "all 0.3s",
                  cursor: "pointer",
                }}
              >
                <div className="card-body d-flex flex-column justify-content-center align-items-center text-center">
                  <div
                    className="rounded-circle bg-secondary mb-3"
                    style={{
                      width: 60,
                      height: 60,
                      lineHeight: "60px",
                      color: "#fff",
                      fontWeight: "bold",
                      fontSize: 24,
                    }}
                  >
                    {r.name ? r.name[0].toUpperCase() : "L"}
                  </div>
                  <h5 className="card-title mb-1">{r.name || "-"}</h5>
                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip>{r.email}</Tooltip>}
                  >
                    <p
                      className="card-text text-truncate"
                      style={{ maxWidth: 200 }}
                    >
                      {r.email || "-"}
                    </p>
                  </OverlayTrigger>
                  <span className="badge bg-primary">{r.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inline styles for hover effects */}
      <style>
        {`
          .table-hover-effect:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          }
          .card-hover:hover {
            transform: translateY(-5px) scale(1.02);
            box-shadow: 0 8px 20px rgba(0,0,0,0.15);
          }
        `}
      </style>
    </div>
  );
}
