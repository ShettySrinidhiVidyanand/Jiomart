import { Link } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import "./SignUp.css";

function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = (e) => {
  e.preventDefault();

  axios.post('http://localhost:5000/SignUp', {
    name,
    email,
    phone
  })
  .then(res => {
    alert(res.data.message);
  })
  .catch(err => {
    console.log(err);
    alert(err.response?.data?.message || "Signup failed");
  });
};

  return (
    <div className="signup-container">
      <div className="signup-card">

        <h2>Instant account setup</h2>

        <form onSubmit={handleSubmit}>
          <label>Name *</label>
          <input
            type="text"
            placeholder="Enter your first name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label>Email *</label>
          <input type="email" placeholder="Enter your email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required />    

          <label>Phone Number</label>
          <input type="tel" placeholder="Enter your phone number" 
          value={phone} 
          onChange={(e) => setPhone(e.target.value)} />

          <button type="submit" className="btn">
            Get Started
          </button>
        </form>

        <Link to="/Login">
          <p style={{ marginTop: "15px", cursor: "pointer", color: "blue" }}>
            Already have an account? Login
          </p>
        </Link>

      </div>
    </div>
  );
}

export default SignUp;