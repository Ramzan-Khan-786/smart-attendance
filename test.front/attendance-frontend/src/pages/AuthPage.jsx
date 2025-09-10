import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "../services/api";

function AdminForm({ mode, onSuccess }) {
  const [form, setForm] = useState({ email: "", password: "", adminId: "" });
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (mode === "login") {
        const res = await api.adminLogin(form);
        localStorage.setItem("token", res.data.token);
        onSuccess("/admin/dashboard");
      } else {
        const res = await api.adminRegister(form);
        localStorage.setItem("token", res.data.token);
        onSuccess("/admin/dashboard");
      }
    } catch (err) {
      alert(err?.response?.data?.message || "Error");
    }
  };

  return (
    <form onSubmit={submit}>
      <div className="form-row">
        <label>Email</label>
        <input name="email" onChange={change} required />
      </div>
      <div className="form-row">
        <label>Password</label>
        <input name="password" type="password" onChange={change} required />
      </div>
      <div className="form-row">
        <label>Admin ID</label>
        <input name="adminId" onChange={change} required />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <button className="btn" type="submit">
          {mode === "login" ? "Login" : "Register"}
        </button>
        {mode === "login" && (
          <button
            type="button"
            className="btn"
            style={{ background: "#10b981" }}
            onClick={() => {
              // Demo admin login (bypasses API)
              localStorage.setItem("token", "demo-admin-token");
              onSuccess("/admin/dashboard");
            }}
          >
            Demo Login
          </button>
        )}
      </div>
    </form>
  );
}

function UserForm({ mode, onSuccess }) {
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [file, setFile] = useState(null);
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (mode === "login") {
        const res = await api.userLogin(form);
        localStorage.setItem("token", res.data.token);
        onSuccess("/user/dashboard");
      } else {
        const fd = new FormData();
        fd.append("email", form.email);
        fd.append("password", form.password);
        fd.append("name", form.name);
        if (file) fd.append("photo", file);
        const res = await api.userRegister(fd);
        localStorage.setItem("token", res.data.token);
        onSuccess("/user/dashboard");
      }
    } catch (err) {
      alert(err?.response?.data?.message || "Error");
    }
  };

  return (
    <form onSubmit={submit}>
      <div className="form-row">
        <label>Name</label>
        <input name="name" onChange={change} required />
      </div>
      <div className="form-row">
        <label>Email</label>
        <input name="email" onChange={change} required />
      </div>
      <div className="form-row">
        <label>Password</label>
        <input name="password" type="password" onChange={change} required />
      </div>
      {mode === "register" && (
        <div className="form-row">
          <label>Upload selfie (for verification)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <button className="btn" type="submit">
          {mode === "login" ? "Login" : "Register"}
        </button>
        {mode === "login" && (
          <button
            type="button"
            className="btn"
            style={{ background: "#10b981" }}
            onClick={() => {
              // Demo user login (bypasses API)
              localStorage.setItem("token", "demo-user-token");
              onSuccess("/user/dashboard");
            }}
          >
            Demo Login
          </button>
        )}
      </div>
    </form>
  );
}

export default function AuthPage({ variant = "admin" }) {
  const [panel, setPanel] = useState("login");
  const navigate = useNavigate();

  return (
    <div className="auth-wrap">
      <div className="auth-box">
        <div className="auth-left">
          <h2>{variant === "admin" ? "Admin Portal" : "User Portal"}</h2>
          <p>
            Secure {variant} authentication. Use the toggle to switch between
            Login and Register.
          </p>
        </div>
        <div className="auth-right">
          <div className="toggle-header">
            <button
              className={panel === "login" ? "active" : ""}
              onClick={() => setPanel("login")}
            >
              Login
            </button>
            <button
              className={panel === "register" ? "active" : ""}
              onClick={() => setPanel("register")}
            >
              Register
            </button>
          </div>

          {variant === "admin" ? (
            <AdminForm mode={panel} onSuccess={(path) => navigate(path)} />
          ) : (
            <UserForm mode={panel} onSuccess={(path) => navigate(path)} />
          )}
        </div>
      </div>
    </div>
  );
}
