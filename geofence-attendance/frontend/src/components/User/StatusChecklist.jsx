// src/components/attendance/StatusChecklist.jsx
import React from "react";

const StatusChecklist = ({ isInside, isVerified, isMarked }) => {
  return (
    <div
      style={{
        padding: "10px",
        border: "1px solid #ccc",
        borderRadius: "5px",
        width: "250px",
      }}
    >
      <h4>Your Status</h4>
      <ul style={{ listStyleType: "none", padding: 0 }}>
        <li>
          <input type="checkbox" checked={isInside} readOnly /> Inside Geofence
        </li>
        <li>
          <input type="checkbox" checked={isVerified} readOnly /> Camera
          Verified
        </li>
        <li>
          <input type="checkbox" checked={isMarked} readOnly /> Attendance
          Marked
        </li>
      </ul>
    </div>
  );
};

export default StatusChecklist;
