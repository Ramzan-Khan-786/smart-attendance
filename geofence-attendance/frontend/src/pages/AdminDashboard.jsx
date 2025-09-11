// src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import api from "../api/index.jsx"; // updated ES6 path
import AddLocation from "../components/Admin/AddLocation.jsx";
import SessionControl from "../components/Admin/SessionControl.jsx";
import Reports from "../components/Admin/Reports.jsx";

const AdminDashboard = () => {
  const [locations, setLocations] = useState([]);
  const [presentUsers, setPresentUsers] = useState([]);
  const [activeSession, setActiveSession] = useState(null);

  // Setup Socket.IO for live updates
  useEffect(() => {
    const socket = io("http://localhost:5000");

    socket.on("user-verified", ({ attendance }) => {
      setPresentUsers((prevUsers) => [...prevUsers, attendance]);
    });

    socket.on("session-started", () => {
      fetchPresentUsers();
    });

    socket.on("session-ended", () => {
      setPresentUsers([]);
      setActiveSession(null);
    });

    return () => socket.disconnect();
  }, []);

  // Fetch locations from backend
  const fetchLocations = async () => {
    try {
      const res = await api.get("/admin/locations");
      setLocations(res.data);
    } catch (err) {
      console.error("Error fetching locations:", err);
    }
  };

  // Fetch active session attendance
  const fetchPresentUsers = async () => {
    try {
      const res = await api.get("/admin/sessions/active/attendance");
      setPresentUsers(res.data);
    } catch (err) {
      setPresentUsers([]);
    }
  };

  // Fetch locations and attendance on mount
  useEffect(() => {
    fetchLocations();
    fetchPresentUsers();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Admin Dashboard</h1>
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          marginTop: "20px",
        }}
      >
        {/* Left column: Locations and Session Control */}
        <div style={{ width: "45%" }}>
          <h2>Locations</h2>
          <AddLocation onLocationAdded={fetchLocations} />
          <ul>
            {locations.map((l) => (
              <li key={l._id}>{l.name}</li>
            ))}
          </ul>

          <h2>Session Control</h2>
          <SessionControl
            locations={locations}
            setActiveSession={setActiveSession}
          />
        </div>

        {/* Right column: Live Attendance and Reports */}
        <div style={{ width: "45%" }}>
          <h2>Live Attendance</h2>
          <ul>
            {presentUsers.map((att) => (
              <li key={att._id}>{att.user.name} - Verified</li>
            ))}
          </ul>

          <h2>Reports</h2>
          <Reports />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
