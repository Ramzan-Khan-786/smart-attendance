import React, { useEffect, useState } from "react";
import API from "../services/api";
import { io } from "socket.io-client";

export default function AdminDashboard() {
  const [locations, setLocations] = useState([]);
  const [name, setName] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [radius, setRadius] = useState(50);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    fetchLocations();
    const s = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:4000", {
      auth: { token: localStorage.getItem("token") },
    });
    setSocket(s);
    return () => s.disconnect();
  }, []);

  const fetchLocations = async () => {
    try {
      const res = await API.get("/locations", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setLocations(res.data);
    } catch (err) {
      console.error(err);
      alert("Fetch locations failed");
    }
  };

  const addLocation = async () => {
    try {
      const res = await API.post(
        "/locations",
        {
          name,
          center: { lat: parseFloat(lat), lng: parseFloat(lng) },
          radiusMeters: Number(radius),
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      alert("Location added");
      fetchLocations();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Add failed");
    }
  };

  const startSession = async (loc) => {
    try {
      const res = await API.post(
        `/sessions/${loc._id}/start`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      // emit via socket to notify clients
      socket.emit("start_session", { session: res.data, location: loc });
      alert("Session started. Share session id: " + res.data._id);
    } catch (err) {
      alert("Start failed: " + (err.response?.data?.error || err.message));
    }
  };

  const stopSession = async (sessionId) => {
    try {
      const res = await API.post(
        `/sessions/${sessionId}/stop`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      socket.emit("stop_session", res.data);
      alert("Session stopped. Excel URL returned (base64). Save it if needed.");
    } catch (err) {
      alert("Stop failed: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin Dashboard</h2>
      <h3>Add location</h3>
      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <br />
      <input
        placeholder="lat"
        value={lat}
        onChange={(e) => setLat(e.target.value)}
      />
      <br />
      <input
        placeholder="lng"
        value={lng}
        onChange={(e) => setLng(e.target.value)}
      />
      <br />
      <input
        placeholder="radius (m)"
        value={radius}
        onChange={(e) => setRadius(e.target.value)}
      />
      <br />
      <button onClick={addLocation}>Add</button>

      <h3>Locations</h3>
      <ul>
        {locations.map((l) => (
          <li key={l._id}>
            {l.name} — {l.center?.lat},{l.center?.lng} ({l.radiusMeters}m)
            <button onClick={() => startSession(l)}>Start Session</button>
          </li>
        ))}
      </ul>

      <hr />
      <h3>Stop session (enter session id)</h3>
      <StopSessionForm onStop={stopSession} />
    </div>
  );
}

function StopSessionForm({ onStop }) {
  const [id, setId] = React.useState("");
  return (
    <div>
      <input
        placeholder="session id"
        value={id}
        onChange={(e) => setId(e.target.value)}
      />
      <button onClick={() => onStop(id)}>Stop</button>
    </div>
  );
}
