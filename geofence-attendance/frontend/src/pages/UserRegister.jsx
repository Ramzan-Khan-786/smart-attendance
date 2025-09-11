// src/pages/user/UserRegister.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FaceApiLoader from "../components/common/FaceApiLoader.jsx";
import api from "../api/index.jsx"; // updated ES6 path

const UserRegister = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [descriptor, setDescriptor] = useState(null);
  const navigate = useNavigate();

  // Update form data
  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Submit registration
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!descriptor) {
      alert("Please capture your face photo first.");
      return;
    }
    try {
      const res = await api.post("/auth/register/user", {
        ...formData,
        faceDescriptor: descriptor,
      });
      localStorage.setItem("token", res.data.token);
      alert("Registration successful!");
      navigate("/user/dashboard");
    } catch (err) {
      alert(err.response?.data?.msg || "Registration failed");
    }
  };

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "50px auto",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "5px",
      }}
    >
      <h2>User Registration</h2>
      <form onSubmit={onSubmit}>
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

      <h3 style={{ marginTop: "20px" }}>Capture Your Face</h3>
      <FaceApiLoader onDescriptorCaptured={setDescriptor} />
    </div>
  );
};

export default UserRegister;
