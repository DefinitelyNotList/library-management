import { useEffect, useMemo, useState } from "react";
import { OverlayTrigger, Spinner, Tooltip } from "react-bootstrap";
import axiosInstance from "../utils/axiosInstance";

export default function LibrariansList() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [view, setView] = useState("table");

  // Edit State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState({
    id: null,
    name: "",
    email: "",
    role: "LIBRARIAN",
    password: "",
  });

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

  const handleOpenEdit = (user) => {
    setEditingUser({
      id: user.id,
      name: user.name || "",
      email: user.email || "",
      role: user.role || "LIBRARIAN",
      password: "",
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put(`/users/${editingUser.id}`, editingUser);
      alert("✅ Librarian updated successfully!");
      setShowEditModal(false);
      load();
    } catch (error) {
      console.error("Failed to update librarian:", error);
      alert("❌ Failed to update librarian.");
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this librarian?")) return;
    try {
      await axiosInstance.delete(`/users/${id}`);
      alert("✅ Librarian deleted successfully!");
      load();
    } catch (error) {
      console.error("Failed to delete librarian:", error);
      alert("❌ Failed to delete librarian.");
    }
  };

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
                <th className="text-center">Actions</th>
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
                  <td className="text-center">
                    <button
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => handleOpenEdit(r)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDeleteUser(r.id)}
                    >
                      🗑️ Delete
                    </button>
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
                      className="card-text text-truncate mb-2"
                      style={{ maxWidth: 200 }}
                    >
                      {r.email || "-"}
                    </p>
                  </OverlayTrigger>
                  <span className="badge bg-primary mb-3">{r.role}</span>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleOpenEdit(r)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDeleteUser(r.id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Librarian Modal */}
      {showEditModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <form onSubmit={handleSaveEdit}>
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-bold">✏️ Edit Librarian Information</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowEditModal(false)}
                  ></button>
                </div>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingUser.name}
                      onChange={(e) =>
                        setEditingUser({ ...editingUser, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      value={editingUser.email}
                      onChange={(e) =>
                        setEditingUser({ ...editingUser, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Role</label>
                    <select
                      className="form-select"
                      value={editingUser.role}
                      onChange={(e) =>
                        setEditingUser({ ...editingUser, role: e.target.value })
                      }
                    >
                      <option value="LIBRARIAN">LIBRARIAN</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="MEMBER">MEMBER</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      New Password (leave blank to keep unchanged)
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Enter new password if changing"
                      value={editingUser.password}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          password: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary fw-semibold">
                    ✅ Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
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
