import React, { useEffect, useState } from "react";
import axios from "axios";
import {//
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer,
  Legend
} from "recharts";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    paidPayments: 0,
    pending: 0,
    shipped: 0,
    delivered: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin-stats`);
    setStats(res.data);
  };

  const pieData = [//
    { name: "Pending", value: stats.pending },
    { name: "Shipped", value: stats.shipped },
    { name: "Delivered", value: stats.delivered },
  ];

  const barData = [
    { name: "Users", count: stats.totalUsers },
    { name: "Orders", count: stats.totalOrders },
    { name: "Payments", count: stats.paidPayments },
  ];

  return (
    <div className="dashboard">

      <h1>Admin Dashboard</h1>

      <div className="top-buttons">
  <button onClick={() => navigate("/AddProduct")}> Add Product</button>
  <button onClick={() => navigate("/ManageProduct")}> Manage Products</button>
  <button onClick={() => navigate("/ManageOrder")}> Manage Orders</button>
   <button onClick={() => navigate("/")}>Logout</button>
</div>

      <div className="cards">

        <div className="card blue">
          <h3>Total Users</h3>
          <p>{stats.totalUsers}</p>
        </div>

        <div className="card pink">
          <h3>Total Orders</h3>
          <p>{stats.totalOrders}</p>
        </div>

        <div className="card green">
          <h3>Revenue</h3>
          <p>₹{stats.totalRevenue}</p>
        </div>

        <div className="card orange">
          <h3>Payments</h3>
          <p>{stats.paidPayments}</p>
        </div>

      </div>

      <div className="charts">

        <div className="chart-box">
          <h3>Overview</h3>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#00b894" />
            </BarChart>
          </ResponsiveContainer>

        </div>

        <div className="chart-box">
          <h3>Order Status</h3>

          <ResponsiveContainer width="100%" height={300}>
  <PieChart>
    <Pie
      data={pieData}
      dataKey="value"
      cx="50%"
      cy="50%"
      outerRadius={100}
      label={({ name, percent }) =>
        `${name} ${(percent * 100).toFixed(0)}%`
      }
    >
      <Cell fill="#f39c12" />
      <Cell fill="#3498db" />
      <Cell fill="#2ecc71" />
    </Pie>
    <Tooltip />
    <Legend />
  </PieChart>
</ResponsiveContainer>

        </div>

      </div>

      {/*<div className="buttons">
        <button onClick={() => navigate("/add-product")}>Add Product</button>
        <button onClick={() => navigate("/manage-products")}>Manage Products</button>
        <button onClick={() => navigate("/manage-orders")}>Manage Orders</button>
      </div>*/}

    </div>
  );
}

export default AdminDashboard;
