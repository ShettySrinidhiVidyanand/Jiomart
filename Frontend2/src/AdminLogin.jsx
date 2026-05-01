import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";

function AdminLogin() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
  e.preventDefault();

  try {
    const res = await axios.post(
  `${import.meta.env.VITE_API_URL}/AdminLogin`,
  {
    email: email.trim().toLowerCase(),
    password: password.trim()
  }
);

    console.log(res.data.message);

    if (res.status === 200) {
      localStorage.setItem("role", "admin");

      navigate("/AdminDashboard");
    }

  } catch (err) {
    console.error(err.response?.data?.message || "Invalid Admin Credentials");
  }
};

  return (
    <div className="page">
      <section className="card">

        <h2>Admin Login</h2>
        <p>Enter admin credentials to continue</p>

        <form onSubmit={handleAdminLogin}>

          <label>Admin Email</label>
          <input
            className="input-box"
            type="email"
            placeholder="Enter admin email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            className="input-box"
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="signin-btn">
            Login
          </button>

        </form>

      </section>
    </div>
  );
}

export default AdminLogin;
