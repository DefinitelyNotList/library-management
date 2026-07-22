// src/pages/Members.jsx
import { useEffect, useState } from "react";
import { Button, Card, Form, Modal, Spinner, Table } from "react-bootstrap";
import axiosInstance from "../utils/axiosInstance";

function Members() {
  const [members, setMembers] = useState([]);
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [currentMember, setCurrentMember] = useState({
    id: null,
    userId: "",
    planId: "",
  });

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [history, setHistory] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [membersRes, usersRes, plansRes] = await Promise.all([
        axiosInstance.get("/membership/members"),
        axiosInstance.get("/users"),
        axiosInstance.get("/membership/plans"),
      ]);
      setMembers(membersRes.data);
      setUsers(usersRes.data);
      setPlans(plansRes.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setCurrentMember({ id: null, userId: "", planId: "" });
  };

  const handleShow = (member = null) => {
    if (member) {
      setCurrentMember({
        id: member.id,
        userId: member.user.id,
        planId: member.membershipPlan.id,
      });
    }
    setShowModal(true);
  };

  const handleChange = (e) => {
    setCurrentMember({ ...currentMember, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentMember.id) {
        await axiosInstance.put(
          `/membership/members/${currentMember.id}/update/${currentMember.planId}`
        );
      } else {
        await axiosInstance.post(
          `/membership/members/assign/${currentMember.userId}/${currentMember.planId}`
        );
      }
      fetchData();
      handleClose();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteMember = async (id) => {
    try {
      await axiosInstance.delete(`/membership/members/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const calculatePenalty = (dueDate, returnDate) => {
    const due = new Date(dueDate);
    const returned = returnDate ? new Date(returnDate) : new Date();
    const lateDays = Math.max(
      0,
      Math.ceil((returned - due) / (1000 * 60 * 60 * 24))
    );
    return lateDays > 0 ? lateDays * 10 : 0; // ₹10 per day
  };

  const viewHistory = async (member) => {
    try {
      const res = await axiosInstance.get(`/borrow/history/${member.id}`);

      const mapped = res.data.map((item) => ({
        bookTitle: item.book.title,
        issuedDate: item.borrowDate,
        returnDate: item.returnDate || "Not Returned",
        penalty: calculatePenalty(item.dueDate, item.returnDate),
      }));

      setHistory(mapped);
      setSelectedMember(member);
      setShowHistoryModal(true);
    } catch (err) {
      console.error(err);
    }
  };

  const closeHistoryModal = () => {
    setShowHistoryModal(false);
    setHistory([]);
    setSelectedMember(null);
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );

  return (
    <div className="container my-5  mt-5 pt-5">
      <Card className="shadow-lg border-0 rounded-4 p-4  mt-5 pt-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold text-primary">👥 Members</h2>
          <Button variant="success" onClick={() => handleShow()}>
            ➕ Assign Membership
          </Button>
        </div>

        {members.length === 0 ? (
          <p className="text-center text-muted">No members assigned yet.</p>
        ) : (
          <Table hover responsive className="align-middle">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Membership Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id}>
                  <td>{member.id}</td>
                  <td>{member.user.name}</td>
                  <td>
                    <span
                      className={`badge ${
                        member.membershipPlan.type === "PREMIUM"
                          ? "bg-warning text-dark"
                          : "bg-secondary"
                      }`}
                    >
                      {member.membershipPlan.type}
                    </span>
                  </td>
                  <td>{member.startDate}</td>
                  <td>{member.endDate}</td>
                  <td>
                    <span
                      className={`badge ${
                        member.status === "ACTIVE" ? "bg-success" : "bg-danger"
                      }`}
                    >
                      {member.status}
                    </span>
                  </td>
                  <td className="text-center">
                    <Button
                      variant="outline-info"
                      size="sm"
                      className="me-2"
                      onClick={() => viewHistory(member)}
                    >
                      📜 History
                    </Button>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleShow(member)}
                    >
                      ✏️ Edit
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => deleteMember(member.id)}
                    >
                      🗑️ Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {/* Assign / Edit Membership Modal */}
      <Modal show={showModal} onHide={handleClose} centered>
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton className="bg-primary text-white">
            <Modal.Title>
              {currentMember.id ? "Update Membership" : "Assign Membership"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>User</Form.Label>
              <Form.Select
                name="userId"
                value={currentMember.userId}
                onChange={handleChange}
                required
                disabled={!!currentMember.id}
              >
                <option value="">Select User</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Membership Plan</Form.Label>
              <Form.Select
                name="planId"
                value={currentMember.planId}
                onChange={handleChange}
                required
              >
                <option value="">Select Plan</option>
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.type}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" variant="success">
              {currentMember.id ? "Update" : "Assign"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Borrowing History Modal */}
      <Modal show={showHistoryModal} onHide={closeHistoryModal} centered>
        <Modal.Header closeButton className="bg-dark text-white">
          <Modal.Title>
            Borrowing History - {selectedMember?.user.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {history.length === 0 ? (
            <p className="text-muted text-center">
              No borrowing history available.
            </p>
          ) : (
            <Table hover responsive className="align-middle">
              <thead className="table-light">
                <tr>
                  <th>Book</th>
                  <th>Issued Date</th>
                  <th>Return Date</th>
                  <th>Penalty</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item, index) => (
                  <tr key={index}>
                    <td>{item.bookTitle}</td>
                    <td>{item.issuedDate}</td>
                    <td>{item.returnDate}</td>
                    <td>
                      {item.penalty > 0 ? (
                        <span className="text-danger fw-bold">
                          ₹ {item.penalty}
                        </span>
                      ) : (
                        <span className="text-success">No Penalty</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeHistoryModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Members;
