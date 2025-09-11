// src/components/layout/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth.jsx";

const Navbar = () => {
  const { isAuthenticated, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate("/"); // Redirect to home after logout
  };

  // Links shown when user/admin is logged in
  const authLinks = (
    <>
      <Link to={isAdmin ? "/admin/dashboard" : "/user/dashboard"}>
        Dashboard
      </Link>
      <a onClick={onLogout} href="#!" style={{ marginLeft: "10px" }}>
        Logout
      </a>
    </>
  );

  // Links shown when no one is logged in
  const guestLinks = (
    <>
      <Link to="/user/register">User Register</Link>
      <Link to="/user/login" style={{ marginLeft: "10px" }}>
        User Login
      </Link>
      <Link to="/admin/register" style={{ marginLeft: "10px" }}>
        Admin Register
      </Link>
      <Link to="/admin/login" style={{ marginLeft: "10px" }}>
        Admin Login
      </Link>
    </>
  );

  return (
    <nav style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
      <h1 style={{ display: "inline", marginRight: "20px" }}>
        <Link to="/">GeoFace Attend</Link>
      </h1>
      <span>{isAuthenticated ? authLinks : guestLinks}</span>
    </nav>
  );
};

export default Navbar;
