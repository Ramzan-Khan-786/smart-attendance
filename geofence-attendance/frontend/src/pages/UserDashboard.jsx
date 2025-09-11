// src/pages/user/UserDashboard.jsx
import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import MapComponent from "../components/common/MapComponent.jsx";
import VerificationComponent from "../components/User/Verification.jsx"; // Adjust path if needed

const UserDashboard = () => {
  const [activeSession, setActiveSession] = useState(null);
  const [location, setLocation] = useState(null);
  const [userPosition, setUserPosition] = useState(null);
  const [isInsideGeofence, setIsInsideGeofence] = useState(false);

  // Socket.IO for session updates
  useEffect(() => {
    const socket = io("http://localhost:5000");

    socket.on("session-started", ({ session, location }) => {
      setActiveSession(session);
      setLocation(location);
    });

    socket.on("session-ended", () => {
      setActiveSession(null);
      setLocation(null);
    });

    return () => socket.disconnect();
  }, []);

  // Geolocation API to track user position
  useEffect(() => {
    const watcher = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserPosition({ lat: latitude, lng: longitude });
      },
      (err) => console.error(err),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watcher);
  }, []);

  // Geofence check
  useEffect(() => {
    if (userPosition && location) {
      const distance = getDistance(
        userPosition.lat,
        userPosition.lng,
        location.latitude,
        location.longitude
      );
      setIsInsideGeofence(distance <= 500); // 500 meters radius
    }
  }, [userPosition, location]);

  // Haversine formula to calculate distance in meters
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; // Radius of Earth in meters
    const toRad = (deg) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>User Dashboard</h1>
      {activeSession ? (
        <>
          <h2>Active Session: {activeSession.name}</h2>
          <MapComponent
            center={[location.latitude, location.longitude]}
            geofence={{ lat: location.latitude, lng: location.longitude }}
            userPosition={userPosition}
          />
          {isInsideGeofence && (
            <VerificationComponent session={activeSession} />
          )}
          {!isInsideGeofence && <p>You are outside the geofence.</p>}
        </>
      ) : (
        <p>No active session.</p>
      )}
    </div>
  );
};

export default UserDashboard;
