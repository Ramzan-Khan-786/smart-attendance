// src/pages/admin/AdminRegister.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/index.jsx"; // updated ES6 path

const AdminRegister = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  // Update form state on input change
  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Handle form submission
  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/register/admin", formData);
      alert("Registration successful! Please login.");
      navigate("/admin/login");
    } catch (err) {
      alert(err.response?.data?.msg || "Registration failed");
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
      <h2>Admin Registration</h2>
      <div style={{ marginBottom: "10px" }}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={onChange}
          required
          style={{ width: "100%", padding: "8px" }}
        />
      </div>
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
        Register
      </button>
    </form>
  );
};

export default AdminRegister;
