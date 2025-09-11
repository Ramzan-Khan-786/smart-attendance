// src/components/locations/AddLocation.jsx
import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import api from "../../api/index.jsx"; // updated path for ES6 module

// Import marker images for Vite
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

// Configure default Leaflet icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

// Component to pick location on map
const LocationPicker = ({ onLocationSelect }) => {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect(e.latlng);
    },
  });

  return position === null ? null : <Marker position={position} />;
};

// Main AddLocation component
const AddLocation = ({ onLocationAdded }) => {
  const [name, setName] = useState("");
  const [location, setLocation] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !location) {
      alert("Please provide a name and select a location on the map.");
      return;
    }
    try {
      await api.post("/admin/locations", {
        name,
        latitude: location.lat,
        longitude: location.lng,
      });
      setName("");
      setLocation(null);
      onLocationAdded();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ marginBottom: "10px" }}>
        <input
          type="text"
          placeholder="Location Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ marginRight: "10px" }}
        />
        <button type="submit">Add Location</button>
      </form>
      <p>Click on the map to select a location.</p>
      <MapContainer
        center={[20.5937, 78.9629]} // India center
        zoom={5}
        style={{ height: "300px", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationPicker onLocationSelect={setLocation} />
      </MapContainer>
    </div>
  );
};

export default AddLocation;
