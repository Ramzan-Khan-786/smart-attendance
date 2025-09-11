// src/pages/admin/AdminLogin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth.jsx";
import api from "../api/index.jsx"; // updated path for ES6 modules

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { login } = useAuth();
  const navigate = useNavigate();

  // Update form state on input change
  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Handle form submission
  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login/admin", formData);
      login(res.data.token, { name: "Admin" }, true); // Admin login
      navigate("/admin/dashboard"); // Redirect to admin dashboard
    } catch (err) {
      alert(err.response?.data?.msg || "Login failed");
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      style={{
        maxWidth: "400px",
        margin: "50px auto",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "5px",
      }}
    >
      <h2>Admin Login</h2>
      <div style={{ marginBottom: "10px" }}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={onChange}
          required
          style={{ width: "100%", padding: "8px" }}
        />
      </div>
      <div style={{ marginBottom: "10px" }}>
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={onChange}
          required
          style={{ width: "100%", padding: "8px" }}
        />
      </div>
      <button
        type="submit"
        style={{ padding: "10px 20px", width: "100%", cursor: "pointer" }}
      >
        Login
      </button>
    </form>
  );
};

export default AdminLogin;
