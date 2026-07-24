import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../utils/axiosInstance";

export default function MembersList() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Edit User State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState({
    id: null,
    name: "",
    email: "",
    role: "MEMBER",
    password: "",
  });

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await axiosInstance.get("/users");
      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.content)
        ? res.data.content
        : [];
      const membersOnly = list.filter(
        (u) => u.role === "MEMBER" || u.role === "READER"
      );
      setRows(membersOnly);
    } catch (e) {
      console.error(e);
      setErr("Failed to load members.");
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
      role: user.role || "MEMBER",
      password: "",
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put(`/users/${editingUser.id}`, editingUser);
      alert("✅ User information updated successfully!");
      setShowEditModal(false);
      load();
    } catch (error) {
      console.error("Failed to update user:", error);
      alert("❌ Failed to update user information.");
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axiosInstance.delete(`/users/${id}`);
      alert("✅ User deleted successfully!");
      load();
    } catch (error) {
      console.error("Failed to delete user:", error);
      alert("❌ Failed to delete user.");
    }
  };

  const computed = useMemo(() => {
    const now = new Date();
    const isActive = (m) => {
      if (m.membershipStatus) return m.membershipStatus === "ACTIVE";
      if (m.membershipEndDate)
        return new Date(m.membershipEndDate).getTime() >= now.getTime();
      if (m.membershipPlan?.duration && m.joinedAt) {
        const start = new Date(m.joinedAt);
        const end = new Date(start);
        end.setDate(end.getDate() + Number(m.membershipPlan.duration || 0));
        return end.getTime() >= now.getTime();
      }
      return false;
    };

    const needle = q.toLowerCase().trim();

    return rows
      .map((m) => ({
        ...m,
        _status: isActive(m) ? "ACTIVE" : "EXPIRED",
      }))
      .filter((m) =>
        needle
          ? (m.name || "").toLowerCase().includes(needle) ||
            (m.email || "").toLowerCase().includes(needle)
          : true
      )
      .filter((m) => (status === "ALL" ? true : m._status === status));
  }, [rows, q, status]);

  return (
    <div className="container" style={{ marginTop: "150px" }}>
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm border-0 rounded-4 h-100 text-center p-4">
            <h5 className="fw-bold text-warning">👥 Members</h5>
          </div>
        </div>

        <div className="d-flex gap-2">
          <select
            className="form-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{ minWidth: 160 }}
          >
            <option value="ALL">All</option>
            <option value="ACTIVE">Active</option>
            <option value="EXPIRED">Expired</option>
          </select>
          <input
            className="form-control"
            placeholder="Search name or email…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ minWidth: 260 }}
          />
          <button
            className="btn btn-outline-primary"
            onClick={load}
            disabled={loading}
          >
            ⟳ Refresh
          </button>
        </div>
      </div>

      {err && <div className="alert alert-danger">{err}</div>}
      {loading ? (
        <div className="text-muted">Loading…</div>
      ) : computed.length === 0 ? (
        <div className="text-muted">No members found.</div>
      ) : (
        <div className="table-responsive">
          <table className="table align-middle table-hover">
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
              {computed.map((m, i) => (
                <tr key={m.id || m.email || i}>
                  <td>{i + 1}</td>
                  <td>{m.name || "-"}</td>
                  <td>{m.email || "-"}</td>
                  <td>
                    <span className="badge bg-info">{m.role || "MEMBER"}</span>
                  </td>
                  <td className="text-center">
                    <button
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => handleOpenEdit(m)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDeleteUser(m.id)}
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <form onSubmit={handleSaveEdit}>
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-bold">✏️ Edit Member Information</h5>
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
                      <option value="MEMBER">MEMBER</option>
                      <option value="LIBRARIAN">LIBRARIAN</option>
                      <option value="ADMIN">ADMIN</option>
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
    </div>
  );
}
