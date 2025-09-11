// src/components/reports/Reports.jsx
import React, { useState, useEffect } from "react";
import api from "../../api/index.jsx"; // updated path for ES6 module

const Reports = () => {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await api.get("/admin/sessions/previous");
        setSessions(res.data);
      } catch (err) {
        console.error("Error fetching sessions:", err);
      }
    };
    fetchSessions();
  }, []);

  const handleDownload = (path) => {
    const filename = path.split("/").pop();
    window.open(
      `http://localhost:5000/api/admin/sessions/download/${filename}`,
      "_blank"
    );
  };

  return (
    <div>
      <h3>Previous Session Reports</h3>
      <ul>
        {sessions.map((session) => (
          <li key={session._id} style={{ marginBottom: "10px" }}>
            <strong>{session.name}</strong> -{" "}
            {new Date(session.startTime).toLocaleString()}
            <button
              onClick={() => handleDownload(session.excelPath)}
              style={{ marginLeft: "10px" }}
            >
              Download Excel
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Reports;
