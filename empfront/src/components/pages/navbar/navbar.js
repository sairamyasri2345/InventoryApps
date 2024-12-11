
import React from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div style={{ padding: "10px", background: "#007bff", color: "#fff" }}>
      <span>Admin Dashboard</span>
      <button onClick={handleLogout} style={{ float: "right", background: "red", color: "#fff", border: "none", padding: "5px 10px", cursor: "pointer" }}>
        Logout
      </button>
    </div>
  );
};

export default Navbar;
