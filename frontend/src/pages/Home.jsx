import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Welcome to Smart Attendance System</h1>
      <p>
        This is a demo MERN stack app with face recognition, geolocation, and
        session-based attendance tracking.
      </p>
      <p>
        Please <Link to="/register">Register</Link> (for employees) or{" "}
        <Link to="/login">Login</Link> to continue.
      </p>
      <p>
        Admin users can <Link to="/admin">manage sessions</Link>, while
        employees can <Link to="/employee">verify attendance</Link>.
      </p>
    </div>
  );
}
