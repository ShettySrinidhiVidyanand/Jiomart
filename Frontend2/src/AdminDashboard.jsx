import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

function AdminDashboard() {

  const navigate = useNavigate();

  return (
    <div className="admin-page">

      <h2 className="admin-title">Admin Dashboard</h2>

      <div className="dashboard-grid">

        <div className="dashboard-box">
          <h3>Add Products</h3>
          <p>Create new products for your store.</p>
          <button onClick={() => navigate("/AddProduct")}>
            Add Product
          </button>
        </div>

        <div className="dashboard-box">
          <h3>Manage Products</h3>
          <p>Edit or delete existing products.</p>
          <button onClick={() => navigate("/ManageProduct")}>
            Manage Products
          </button>
        </div>

        <div className="dashboard-box">
          <h3>Manage Orders</h3>
          <p>Edit or delete existing orders.</p>
          <button onClick={() => navigate("/ManageOrders")}>
            Manage Orders
          </button>
        </div>

      </div>

    </div>
  );
}

export default AdminDashboard;