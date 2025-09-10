import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix default icon issue in Vite
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function LocationMarker({ position, onChange }) {
  useMapEvents({
    click(e) {
      onChange([e.latlng.lat, e.latlng.lng]);
    },
  });
  if (!position) return null;
  return <Marker position={position}></Marker>;
}

export default function MapPicker({ value, onChange }) {
  const [center, setCenter] = useState(value || [20.5937, 78.9629]);

  useEffect(() => {
    if (value) setCenter(value);
  }, [value]);

  return (
    <div>
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: 350 }}
        className="map-area"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationMarker
          position={value}
          onChange={(v) => {
            onChange(v);
            setCenter(v);
          }}
        />
      </MapContainer>
      <p style={{ marginTop: 8, fontSize: 13, color: "#444" }}>
        Click on map to pick location. You can also auto-fill using browser
        location.
      </p>
    </div>
  );
}
