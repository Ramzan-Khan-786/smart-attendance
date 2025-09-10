// frontend/src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import MapArea from "../components/MapArea";
import api from "../services/api";
import { io } from "socket.io-client";

export default function AdminDashboard() {
  const [locations, setLocations] = useState([]);
  const [active, setActive] = useState(null);
  const [selectedGeo, setSelectedGeo] = useState(null);
  const [sessionName, setSessionName] = useState("");
  const [presentUsers, setPresentUsers] = useState([]);
  const [me, setMe] = useState({});
  const [drawMode, setDrawMode] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    fetchInitial();
    const s = io(window.location.origin); // adjust if socket server on different origin
    setSocket(s);

    s.on("connect", () => console.log("socket connected", s.id));
    s.on("geofence:updated", (data) => {
      // refresh active geofence
      fetchActive();
    });
    s.on("attendance:checked-in", (payload) => {
      // if payload.sessionId === active._id then add to presentUsers
      if (!active) return;
      if (String(payload.sessionId) === String(active._id)) {
        setPresentUsers((prev) => {
          const exists = prev.find(
            (p) => String(p._id) === String(payload.user._id)
          );
          if (exists) return prev;
          return [...prev, { ...payload.user, checkInAt: payload.checkInAt }];
        });
      }
    });

    return () => {
      s.disconnect();
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const iv = setInterval(() => {
      fetchActive();
    }, 5000);
    return () => clearInterval(iv);
  }, []);

  async function fetchInitial() {
    try {
      const res = await api.get("/geofence/list");
      setLocations(res.data || []);
      const meRes = await api.get("/users/me");
      setMe(meRes.data || {});
      await fetchActive();
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchActive() {
    try {
      const r = await api.get("/geofence/active");
      setActive(r.data || null);
      if (r.data) {
        const p = await api.get(`/attendance/present?sessionId=${r.data._id}`);
        setPresentUsers(p.data || []);
      } else {
        setPresentUsers([]);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleStart() {
    if (!selectedGeo || !sessionName)
      return alert("Choose a location and enter a session name");
    try {
      await api.post("/geofence/start", {
        geofenceId: selectedGeo._id,
        sessionName,
      });
      await fetchActive();
      if (socket) socket.emit("geofence:updated", { action: "started" });
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  }

  async function handleStop() {
    try {
      await api.post("/geofence/stop");
      await fetchActive();
      if (socket) socket.emit("geofence:updated", { action: "stopped" });
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  }

  async function handleCreateCustom(coords) {
    // coords: { type: 'circle', center:{lat,lng}, radius } OR {type:'polygon', polygon:[{lat,lng}...]}
    try {
      const name = prompt("Name for this location (eg: Gate A - Ground floor)");
      if (!name) return alert("Name required");
      const res = await api.post("/geofence/create", { name, coords });
      // refresh list & auto-select
      setLocations((prev) => [res.data, ...prev]);
      setSelectedGeo(res.data);
      setDrawMode(false);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  }

  const isOwner =
    active && active.activatedBy && active.activatedBy._id === me._id;
  const anyActive = !!active;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "380px 1fr",
        gap: 18,
        padding: 18,
      }}
    >
      <div style={{ padding: 12 }}>
        <h2>Admin Dashboard</h2>

        <section style={{ marginTop: 12 }}>
          <h4>Presaved locations</h4>
          <div
            style={{
              maxHeight: 220,
              overflowY: "auto",
              border: "1px solid #eee",
              borderRadius: 6,
            }}
          >
            {locations.map((l) => (
              <div
                key={l._id}
                style={{ padding: 8, borderBottom: "1px solid #fafafa" }}
              >
                <div style={{ fontWeight: 600 }}>{l.name}</div>
                <div style={{ fontSize: 12, color: "#666" }}>
                  {l.coords.type}
                </div>
                <div style={{ marginTop: 6 }}>
                  <button onClick={() => setSelectedGeo(l)}>Choose</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginTop: 14 }}>
          <h4>Add custom location</h4>
          <div style={{ marginBottom: 8 }}>
            <button
              onClick={() => setDrawMode((v) => !v)}
              style={{ marginRight: 8 }}
            >
              {drawMode ? "Cancel drawing" : "Draw on map"}
            </button>
            <span style={{ color: "#666" }}>
              {" "}
              Use draw tool on the map to add circle/polygon
            </span>
          </div>
        </section>

        <section style={{ marginTop: 14 }}>
          <h4>Geofence control</h4>
          <div>
            <label>Session name</label>
            <input
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="Session name"
            />
          </div>
          <div style={{ marginTop: 8 }}>
            <button
              onClick={handleStart}
              disabled={anyActive && !isOwner}
              style={{
                opacity: anyActive && !isOwner ? 0.45 : 1,
                marginRight: 8,
              }}
            >
              Start geofence
            </button>

            <button
              onClick={handleStop}
              disabled={!anyActive || !isOwner}
              style={{ opacity: !anyActive || !isOwner ? 0.45 : 1 }}
            >
              Close geofence
            </button>
          </div>

          {active && (
            <div
              style={{
                marginTop: 10,
                padding: 8,
                background: "#f3f8ff",
                borderRadius: 6,
              }}
            >
              <div>
                <strong>Active:</strong> {active.sessionName}
              </div>
              <div>By: {active.activatedByName}</div>
              <div>Started: {new Date(active.startedAt).toLocaleString()}</div>
            </div>
          )}
        </section>

        <section style={{ marginTop: 14 }}>
          <h4>Who is present till now</h4>
          <div
            style={{
              maxHeight: 180,
              overflowY: "auto",
              border: "1px solid #eee",
              borderRadius: 6,
              padding: 8,
            }}
          >
            {presentUsers.length ? (
              presentUsers.map((u) => (
                <div
                  key={u._id}
                  style={{ padding: 6, borderBottom: "1px solid #fafafa" }}
                >
                  <div style={{ fontWeight: 600 }}>{u.name}</div>
                  <div style={{ fontSize: 12, color: "#666" }}>
                    {u.employeeId || ""} •{" "}
                    {new Date(u.checkInAt).toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: "#666" }}>No check-ins yet</div>
            )}
          </div>
        </section>
      </div>

      <div>
        <MapArea
          center={[19.386, 72.858]}
          activeGeofence={active}
          drawMode={drawMode}
          onCreateGeofence={handleCreateCustom}
        />
      </div>
    </div>
  );
}
