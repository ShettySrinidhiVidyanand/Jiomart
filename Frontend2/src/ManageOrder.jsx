import { useEffect, useState } from "react";
import axios from "axios";
import "./ManageOrder.css";

function ManageOrder() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get("https://jiomart-backend-w3pb.onrender.com/orders");
      setOrders(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const deleteOrder = async (id) => {
    try {
      await axios.delete(`https://jiomart-backend-w3pb.onrender.com/order/${id}`);
      fetchOrders();
    } catch (err) {
      console.log(err);
    }
  };

  const updateStatus = async (order, newStatus) => {
    try {
      await axios.put(`https://jiomart-backend-w3pb.onrender.com/order/${order._id}`, {
        paymentMethod: order.paymentMethod,
        address: order.address,
        status: newStatus,
        changeStatus: newStatus
      });
      fetchOrders();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="manage-container">
      <h2>Manage Orders</h2>

      <table className="order-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Product</th>
            <th>Price</th>
            <th>Qty</th>
            <th>Shipping Details</th>
            <th>Payment</th>
            <th>Status</th>
            <th>Change Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {orders.length > 0 ? (
            orders.map((order) =>
              order.items.map((item, i) => (
                <tr key={`${order._id}-${i}`}>
                  <td>
                    <img
                      src={`http://localhost:5000/uploads/${item.image}`}
                      width="60"
                      alt={item.name}
                    />
                  </td>
                  <td>{item.name}</td>
                  <td>₹{item.price}</td>
                  <td>{item.quantity}</td>
                  <td>
                    <b>{order.address?.name}</b><br />
                    {order.address?.phone}<br />
                    {order.address?.pincode}<br />
                    {order.address?.address}

                  </td>
                  <td>{order.paymentMethod}</td>
                  <td>{order.status}</td>
                  <td>
                    <select
                      value={order.changeStatus}
                      onChange={(e) => updateStatus(order, e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </td>
                  <td>
                    <button onClick={() => deleteOrder(order._id)}>Delete</button>
                  </td>
                </tr>
              ))
            )
          ) : (
            <tr>
              <td colSpan="9" style={{ textAlign: "center" }}>
                No Orders Found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ManageOrder;
