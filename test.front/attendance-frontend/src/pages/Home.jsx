import React from "react";

export default function Home() {
  return (
    <div className="container">
      <section className="card">
        <h1 style={{ marginBottom: 8 }}>Automated Attendance Tracking</h1>
        <p style={{ color: "#555", marginBottom: 12 }}>
          System with Admin / User flows: geofencing + camera verification +
          export. (Admin creates sessions/geofences, users auto-verify inside
          geofence; fallback self-verify available).
        </p>

        <h3>How to use</h3>
        <ol style={{ marginLeft: 18 }}>
          <li>Admin: Register → Dashboard → Add locations → Start geofence.</li>
          <li>
            User: Register (upload selfie) → See active sessions → If inside
            geofence, camera runs and verifies attendance.
          </li>
        </ol>
      </section>
    </div>
  );
}
