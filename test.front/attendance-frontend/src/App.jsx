import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import AuthPage from "./pages/AuthPage";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import Navbar from "./components/Navbar";

export default function App(){
  return (
    <div className="app">
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/admin-auth" element={<AuthPage variant="admin" />} />
          <Route path="/user-auth" element={<AuthPage variant="user" />} />
          <Route path="/admin/dashboard" element={<AdminDashboard/>} />
          <Route path="/user/dashboard" element={<UserDashboard/>} />
        </Routes>
      </main>
    </div>
  );
}
