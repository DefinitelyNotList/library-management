import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../utils/axiosInstance";

export default function MembersList() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

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
              </tr>
            </thead>
            <tbody>
              {computed.map((m, i) => (
                <tr key={m.id || m.email || i}>
                  <td>{i + 1}</td>
                  <td>{m.name || "-"}</td>
                  <td>{m.email || "-"}</td>
                  <td> {m.role || "-"} </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
