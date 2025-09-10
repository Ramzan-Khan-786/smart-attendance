import React, { useEffect, useState } from "react";
import * as api from "../services/api";
import CameraCapture from "../components/CameraCapture";

export default function UserDashboard() {
  const [sessions, setSessions] = useState([]);
  const [status, setStatus] = useState("");
  const [selfVerifyOpen, setSelfVerifyOpen] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  async function fetchSessions() {
    try {
      const res = await api.getActiveSessions();
      setSessions(res.data);
    } catch (err) {
      console.warn(err);
    }
  }

  async function checkLocation(session) {
    if (!navigator.geolocation) return alert("Allow location");
    navigator.geolocation.getCurrentPosition(
      async (p) => {
        try {
          const res = await api.checkInsideGeofence({
            lat: p.coords.latitude,
            lng: p.coords.longitude,
            sessionId: session._id,
          });
          setStatus(res.data.message);
        } catch (err) {
          console.warn(err);
        }
      },
      () => alert("Allow location access")
    );
  }

  async function onCapture(blob) {
    const fd = new FormData();
    fd.append("image", blob, "selfie.jpg");
    try {
      const res = await api.uploadSelfie(fd);
      alert(res.data.message || "Verification result received");
      setSelfVerifyOpen(false);
    } catch (err) {
      alert(err?.response?.data?.message || "verify error");
    }
  }

  return (
    <div className="container">
      <section className="card">
        <h2>User Dashboard</h2>
        <p style={{ color: "#555" }}>
          See active sessions and verify attendance. If camera auto-recognition
          fails, use self-verify.
        </p>
      </section>

      <section className="card" style={{ marginTop: 12 }}>
        <h3>Active Sessions</h3>
        {sessions.length === 0 && <p>No active sessions right now.</p>}
        <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
          {sessions.map((s) => (
            <div
              key={s._id}
              style={{
                padding: 12,
                border: "1px solid #eee",
                borderRadius: 8,
              }}
            >
              <strong>{s.name}</strong>
              <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                <button className="btn small" onClick={() => checkLocation(s)}>
                  Check location
                </button>
                <button
                  className="btn small"
                  onClick={() => setSelfVerifyOpen(true)}
                >
                  Self-Verify
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {selfVerifyOpen && (
        <section className="card" style={{ marginTop: 12 }}>
          <h3>Self-Verify (Take a selfie)</h3>
          <CameraCapture onCapture={onCapture} />
        </section>
      )}
    </div>
  );
}
