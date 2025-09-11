// src/pages/Home.jsx
import React from "react";

const Home = () => {
  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "50px auto",
        padding: "20px",
        textAlign: "center",
        border: "1px solid #ccc",
        borderRadius: "8px",
        backgroundColor: "#f9f9f9",
      }}
    >
      <h2>Welcome to GeoFace Attendance System</h2>
      <p>
        This is a real-time attendance system using facial recognition and
        geofencing.
      </p>
      <p>
        <b>Users:</b> Please register and login to mark your attendance when a
        session is active.
      </p>
      <p>
        <b>Admins:</b> Please login to manage locations and attendance sessions.
      </p>
    </div>
  );
};

export default Home;
