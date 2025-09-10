import React from "react";
import { Link } from "react-router-dom";

export default function Navbar(){
  return (
    <nav className="nav container card">
      <div className="brand">MAHIN Attendance</div>
      <div className="links">
        <Link to="/">Home</Link>
        <Link to="/admin-auth">Admin</Link>
        <Link to="/user-auth">User</Link>
      </div>
    </nav>
  );
}
