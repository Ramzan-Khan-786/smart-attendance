// src/components/sessions/SessionControl.jsx
import React, { useState } from "react";
import api from "../../api/index.jsx"; // updated path for ES6 module

const SessionControl = ({ locations }) => {
  const [sessionName, setSessionName] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [activeSession, setActiveSession] = useState(null);

  const handleStart = async () => {
    if (!sessionName || !selectedLocation) {
      alert("Please enter a session name and select a location.");
      return;
    }
    try {
      const res = await api.post("/admin/sessions/start", {
        name: sessionName,
        locationId: selectedLocation,
      });
      setActiveSession(res.data);
      setSessionName("");
      setSelectedLocation("");
    } catch (err) {
      console.error("Error starting session:", err);
    }
  };

  const handleEnd = async () => {
    try {
      const res = await api.put(`/admin/sessions/end/${activeSession._id}`);
      alert(`Session ended. Report generated at ${res.data.session.excelPath}`);
      setActiveSession(null);
    } catch (err) {
      console.error("Error ending session:", err);
    }
  };

  return (
    <div>
      {!activeSession ? (
        <div>
          <input
            type="text"
            placeholder="Session Name"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            style={{ marginRight: "10px" }}
          />
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            style={{ marginRight: "10px" }}
          >
            <option value="">Select a Location</option>
            {locations.map((loc) => (
              <option key={loc._id} value={loc._id}>
                {loc.name}
              </option>
            ))}
          </select>
          <button onClick={handleStart}>Start Session</button>
        </div>
      ) : (
        <div>
          <p>
            Session "<strong>{activeSession.name}</strong>" is active.
          </p>
          <button onClick={handleEnd}>End Session</button>
        </div>
      )}
    </div>
  );
};

export default SessionControl;
