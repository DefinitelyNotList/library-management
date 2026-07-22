import { useEffect, useState } from "react";
import { Button, Card, Form, Modal, Spinner, Table } from "react-bootstrap";
import axiosInstance from "../utils/axiosInstance";

function MembershipPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentPlan, setCurrentPlan] = useState({
    id: null,
    type: "BASIC",
    fees: "",
    borrowingLimit: "",
    duration: "",
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await axiosInstance.get("/membership/plans");
      setPlans(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setCurrentPlan({
      id: null,
      type: "BASIC",
      fees: "",
      borrowingLimit: "",
      duration: "",
    });
  };

  const handleShow = (plan = null) => {
    if (plan) setCurrentPlan(plan);
    setShowModal(true);
  };

  const handleChange = (e) => {
    setCurrentPlan({ ...currentPlan, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentPlan.id) {
        await axiosInstance.put(
          `/membership/plans/${currentPlan.id}`,
          currentPlan
        );
      } else {
        await axiosInstance.post("/membership/plans", currentPlan);
      }
      fetchPlans();
      handleClose();
    } catch (err) {
      console.error(err);
    }
  };

  const deletePlan = async (id) => {
    try {
      await axiosInstance.delete(`/membership/plans/${id}`);
      fetchPlans();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 pt-5 mt-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );

  return (
    <div className="container my-5 mt-5 pt-5 ">
      <Card className="shadow-lg border-0 rounded-4 p-5 mt-5">
        <div className="d-flex justify-content-between align-items-center mb-4 mt-4">
          <h2 className="fw-bold text-primary">📋 Membership Plans</h2>
          <Button variant="success" onClick={() => handleShow()}>
            ➕ Add New Plan
          </Button>
        </div>

        {plans.length === 0 ? (
          <p className="text-center text-muted">No plans available yet.</p>
        ) : (
          <Table hover responsive className="align-middle">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Fees</th>
                <th>Borrowing Limit</th>
                <th>Duration (days)</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan.id}>
                  <td>{plan.id}</td>
                  <td>
                    <span
                      className={`badge ${
                        plan.type === "PREMIUM"
                          ? "bg-warning text-dark"
                          : "bg-secondary"
                      }`}
                    >
                      {plan.type}
                    </span>
                  </td>
                  <td>₹ {plan.fees}</td>
                  <td>{plan.borrowingLimit}</td>
                  <td>{plan.duration}</td>
                  <td className="text-center">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleShow(plan)}
                    >
                      ✏️ Edit
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => deletePlan(plan.id)}
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

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={handleClose} centered>
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton className="bg-primary text-white">
            <Modal.Title>
              {currentPlan.id ? "Edit Membership Plan" : "Add Membership Plan"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Type</Form.Label>
              <Form.Select
                name="type"
                value={currentPlan.type}
                onChange={handleChange}
              >
                <option value="BASIC">BASIC</option>
                <option value="PREMIUM">PREMIUM</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Fees (₹)</Form.Label>
              <Form.Control
                type="number"
                name="fees"
                value={currentPlan.fees}
                onChange={handleChange}
                required
                placeholder="Enter fees"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Borrowing Limit</Form.Label>
              <Form.Control
                type="number"
                name="borrowingLimit"
                value={currentPlan.borrowingLimit}
                onChange={handleChange}
                required
                placeholder="Max books allowed"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Duration (days)</Form.Label>
              <Form.Control
                type="number"
                name="duration"
                value={currentPlan.duration}
                onChange={handleChange}
                required
                placeholder="Membership duration"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" variant="success">
              {currentPlan.id ? "Update Plan" : "Add Plan"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default MembershipPlans;
