import React, { useState, useEffect } from "react";
import * as api from "../services/api";
import MapPicker from "../components/MapPicker";

export default function AdminDashboard() {
  const [locations, setLocations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [newLocName, setNewLocName] = useState("");
  const [newLocCoords, setNewLocCoords] = useState(null);
  const [geofenceActive, setGeofenceActive] = useState(false);

  useEffect(() => {
    fetchLocations();
  }, []);

  async function fetchLocations() {
    try {
      const res = await api.getLocations();
      setLocations(res.data);
    } catch (err) {
      console.warn(err);
    }
  }

  async function addLocation() {
    if (!newLocName || !newLocCoords) return alert("Name and coords required");
    try {
      await api.addLocation({
        name: newLocName,
        lat: newLocCoords[0],
        lng: newLocCoords[1],
      });
      setNewLocName("");
      setNewLocCoords(null);
      fetchLocations();
    } catch (err) {
      alert("error adding");
    }
  }

  async function startGeofence() {
    if (!selected) return alert("select location");
    try {
      await api.startGeofence({ locationId: selected });
      setGeofenceActive(true);
      alert("Geofence started");
    } catch (err) {
      alert("error starting");
    }
  }

  async function closeGeofence() {
    try {
      await api.closeGeofence();
      setGeofenceActive(false);
      alert("Geofence closed and attendance exported.");
    } catch (err) {
      alert("error closing");
    }
  }

  async function pickCurrentLocation() {
    if (!navigator.geolocation) return alert("No geolocation");
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setNewLocCoords([p.coords.latitude, p.coords.longitude]);
      },
      () => alert("Please allow location access")
    );
  }

  return (
    <div className="container">
      <section className="card" style={{ marginBottom: 12 }}>
        <h2>Admin Dashboard</h2>
        <p style={{ color: "#555" }}>
          Manage saved locations and start/stop geofence sessions.
        </p>
      </section>

      <section className="card" style={{ marginBottom: 12 }}>
        <h3>Pre-saved Locations</h3>
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginTop: 8,
          }}
        >
          {locations.map((l) => (
            <button
              key={l._id}
              onClick={() => setSelected(l._id)}
              className={`small ${selected === l._id ? "btn" : ""}`}
              style={{ border: "1px solid #eee" }}
            >
              {l.name} ({l.lat.toFixed(4)},{l.lng.toFixed(4)})
            </button>
          ))}
        </div>
      </section>

      <section className="card" style={{ marginBottom: 12 }}>
        <h3>Add Custom Location</h3>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: 12 }}
        >
          <div>
            <div className="form-row">
              <label>Name</label>
              <input
                value={newLocName}
                onChange={(e) => setNewLocName(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button className="btn small" onClick={pickCurrentLocation}>
                Use current location
              </button>
              <button className="btn small" onClick={addLocation}>
                Add location
              </button>
            </div>
            {newLocCoords && (
              <p style={{ marginTop: 8 }}>
                Selected: {newLocCoords[0].toFixed(5)},{" "}
                {newLocCoords[1].toFixed(5)}
              </p>
            )}
          </div>
          <div>
            <MapPicker
              value={newLocCoords}
              onChange={(v) => setNewLocCoords(v)}
            />
          </div>
        </div>
      </section>

      <section className="card">
        <h3>Geofence Controls</h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            className="btn small"
            onClick={startGeofence}
            disabled={geofenceActive}
          >
            Start Geofence
          </button>
          <button
            className="btn small"
            onClick={closeGeofence}
            disabled={!geofenceActive}
          >
            Close Geofence
          </button>
        </div>
      </section>
    </div>
  );
}
