// frontend/src/pages/UserDashboard.jsx
import React, { useEffect, useState } from "react";
import MapArea from "../components/MapArea";
import api from "../services/api";
import { pointInCircle, pointInPolygon } from "../utils/geo";
import { io } from "socket.io-client";

export default function UserDashboard() {
  const [active, setActive] = useState(null);
  const [status, setStatus] = useState("idle"); // idle, inside, outside, checked-in
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    fetchActive();
    const s = io(window.location.origin);
    setSocket(s);
    s.on("connect", () => console.log("user socket connected", s.id));
    s.on("geofence:updated", () => fetchActive());
    s.on("attendance:checked-in", (payload) => {
      if (active && String(payload.sessionId) === String(active._id)) {
        // another user checked in — no need to do anything special
      }
    });
    return () => s.disconnect();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const iv = setInterval(fetchActive, 5000);
    return () => clearInterval(iv);
  }, []);

  async function fetchActive() {
    try {
      const r = await api.get("/geofence/active");
      setActive(r.data || null);
      if (r.data) {
        // attempt to check-in if inside
        tryAutoCheckin(r.data);
      } else {
        setStatus("idle");
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function tryAutoCheckin(activeGeofence) {
    if (!navigator.geolocation) {
      setStatus("no-geolocation");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        let inside = false;
        const gf = activeGeofence.geofence;
        if (gf.coords.type === "circle") {
          inside = pointInCircle(
            { lat, lng },
            gf.coords.center,
            gf.coords.radius || 50
          );
        } else if (gf.coords.type === "polygon") {
          inside = pointInPolygon({ lat, lng }, gf.coords.polygon || []);
        }

        if (inside) {
          setStatus("inside");
          // call backend checkin
          try {
            const res = await api.post("/attendance/checkin", { lat, lng });
            if (res.data?.success) {
              setStatus("checked-in");
            } else {
              setStatus("checkin-failed");
            }
          } catch (err) {
            setStatus("checkin-failed");
            console.error(err);
          }
        } else {
          setStatus("outside");
        }
      },
      (err) => {
        console.error(err);
        setStatus("geo-permission-denied");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div style={{ padding: 12 }}>
      <h2>User Dashboard</h2>

      {active ? (
        <div style={{ marginBottom: 8 }}>
          <div>
            <strong>Session:</strong> {active.sessionName}
          </div>
          <div>
            <strong>Admin:</strong> {active.activatedByName}
          </div>
          <div style={{ marginTop: 6 }}>Status: {status}</div>
        </div>
      ) : (
        <div style={{ color: "#666", marginBottom: 8 }}>No active geofence</div>
      )}

      <MapArea center={[19.386, 72.858]} activeGeofence={active} />
    </div>
  );
}
