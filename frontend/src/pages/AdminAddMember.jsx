import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

function AdminAddMember() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    planId: "",
  });
  const [loading, setLoading] = useState(false);

  // Fetch membership plans
  useEffect(() => {
    axiosInstance
      .get("/membership/plans")
      .then((res) => setPlans(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.planId) {
      alert("Please select a membership plan");
      return;
    }

    setLoading(true);

    axiosInstance
      .post(`/membership/members/add/${formData.planId}`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      })
      .then(() => {
        alert("Member added successfully!");
        navigate("/admin/members-list");
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to add member.");
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="container py-5 mt-5 pt-5">
      <div className="row justify-content-center  mt-4 pt-4">
        <div className="col-md-6">
          <div className="card shadow rounded-4 p-4">
            <h3 className="card-title mb-4 text-center">➕ Add New Member</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter member's full name"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter member's email"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Temporary Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Set a temporary password"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label">Membership Plan</label>
                <select
                  name="planId"
                  value={formData.planId}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Select a plan</option>
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} ({plan.type}) - ₹{plan.fees}
                    </option>
                  ))}
                </select>
              </div>

              <div className="d-grid">
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={loading}
                >
                  {loading ? "Adding Member..." : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminAddMember;
