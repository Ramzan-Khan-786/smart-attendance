import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import EmployeeDashboard from "./pages/EmployeeDashboard.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: 10 }}>
        <Link to="/">Home</Link> | <Link to="/register">Register</Link> |{" "}
        <Link to="/login">Login</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/employee" element={<EmployeeDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
