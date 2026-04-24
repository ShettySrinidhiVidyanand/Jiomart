import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Nav.css";

function Nav() {
  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      navigate(`/search?q=${search}`);
    }
  };

  const handleProfileClick = () => {
    if (user) {
      navigate("/profile");  
    } else {
      navigate("/signup");    
    }
  };

  return (
    <>
      <header className="header">

        <img
          src="/Jiomart-logo.svg"
          alt="Logo"
          className="logo-image"
          onClick={() => navigate("/")}
          style={{ cursor: "pointer" }}
        />

        <div className="search-box">
          <input
            type="text"
            placeholder="Search in JioMart"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>

        <div className="nav-icons">

          <img
            src="/cart-icon.svg"
            alt="Cart"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/cart")}
          />

          <img
            src="/new-ds2-profile-icon.svg"
            alt="Profile"
            style={{ cursor: "pointer" }}
            onClick={handleProfileClick}
          />

        </div>

      </header>

      <div className="pincode-section">
        Scheduled Delivery to
        <input type="text" placeholder="Enter Pincode" />
      </div>
    </>
  );
}

export default Nav;