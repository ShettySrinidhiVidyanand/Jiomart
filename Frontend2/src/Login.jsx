import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);

  const sendOtp = async () => {

    try {

      const res = await axios.post(
  `${import.meta.env.VITE_API_URL}/Login`,
  { email }
);

      alert(res.data.message);

      setShowOtp(true);

    } catch (err) {

      console.error(err);

    }

  };

  const verifyOtp = async () => {
  try {
    const res = await axios.post(
  `${import.meta.env.VITE_API_URL}/VerifyOTP`,
  { email, otp }
);

    alert(res.data.message||"Success");

    const user = res.data.user;

    localStorage.setItem("token", "loggedin");

    localStorage.setItem("user", JSON.stringify({
      userId: user.userId, 
      name: user.name,
      email: user.email
    }));

    navigate("/");

  } catch (err) {
    alert(err.response?.data?.message);
  }
};
  return (
    <div className="page">

      <section className="card">

        <h2>Email Login</h2>

        <input
          className="input-box"
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />

        <button
          className="signin-btn"
          onClick={sendOtp}
        >
          Send OTP
        </button>

        {showOtp && (
          <>
            <input
              className="input-box"
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e)=>setOtp(e.target.value)}
            />

            <button
              className="signin-btn"
              onClick={verifyOtp}
            >
              Verify OTP
            </button>
          </>
        )}
        <p 
          style={{ marginTop: "10px", cursor: "pointer", color: "#9fc1d1", }} 
          onClick={() => navigate("/AdminLogin")} > 
          Are you Admin? 
        </p>

      </section>

    </div>
  );
}

export default Login;
