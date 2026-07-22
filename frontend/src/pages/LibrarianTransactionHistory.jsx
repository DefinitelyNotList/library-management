import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function LibrarianTransactionHistory() {
  const { bookId } = useParams();
  const [transactions, setTransactions] = useState([]);
  const navigate = useNavigate();

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    if (!token) return {};
    return {
      Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
    };
  };

  useEffect(() => {
    fetchTransactions();
  }, [bookId]);

  const fetchTransactions = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/transactions/book/${bookId}`,
        { headers: getAuthHeader() }
      );
      setTransactions(res.data);
    } catch (err) {
      console.error("Error fetching transactions:", err);
    }
  };

  return (
    <div
      className="container"
      style={{ marginTop: "120px", paddingTop: "20px" }}
    >
      <h2 className="mb-4 text-center text-primary fw-bold">
        📜 Transaction History
      </h2>
      <button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>
        ⬅️ Back
      </button>

      {transactions.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-striped table-bordered shadow-sm">
            <thead className="table-light">
              <tr>
                <th>Member</th>
                <th>Status</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Return Date</th>
                <th>Fine</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => (
                <tr
                  key={txn.id}
                  className={
                    txn.status === "BORROWED" &&
                    new Date(txn.dueDate) < new Date()
                      ? "table-danger"
                      : ""
                  }
                >
                  <td>
                    {txn.member?.user?.name} <br />
                    <small className="text-muted">
                      {txn.member?.user?.email}
                    </small>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        txn.status === "BORROWED"
                          ? "bg-warning text-dark"
                          : txn.status === "RETURNED"
                          ? "bg-success"
                          : "bg-secondary"
                      }`}
                    >
                      {txn.status}
                    </span>
                  </td>
                  <td>{txn.issueDate}</td>
                  <td>{txn.dueDate}</td>
                  <td>{txn.returnDate || "-"}</td>
                  <td>{txn.fine > 0 ? `₹${txn.fine}` : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-muted">No transactions found.</p>
      )}
    </div>
  );
}

export default LibrarianTransactionHistory;
