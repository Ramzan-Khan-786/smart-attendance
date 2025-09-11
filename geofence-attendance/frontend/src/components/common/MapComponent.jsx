// src/components/map/MapComponent.jsx
import React from "react";
import { MapContainer, TileLayer, Marker, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const MapComponent = ({ center, geofence, userPosition }) => {
  return (
    <MapContainer
      center={center}
      zoom={15}
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {geofence && (
        <Circle
          center={[geofence.lat, geofence.lng]}
          radius={500} // Adjust radius as needed
          color="blue"
        />
      )}
      {userPosition && (
        <Marker position={[userPosition.lat, userPosition.lng]} />
      )}
    </MapContainer>
  );
};

export default MapComponent;
