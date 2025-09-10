import React, { useEffect, useRef, useState } from "react";
import API from "../services/api";
import * as faceapi from "face-api.js";

export default function EmployeeDashboard() {
  const [sessions, setSessions] = useState([]);
  const videoRef = useRef();

  useEffect(() => {
    const load = async () => {
      await loadModels();
      startVideo();
      fetchActive();
    };
    load();
    return () => stopVideo();
  }, []);

  const loadModels = async () => {
    const MODEL_URL = "/models";
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
  };

  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      })
      .catch((err) => console.error("Camera error", err));
  };
  const stopVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
  };

  const fetchActive = async () => {
    try {
      const res = await API.get("/sessions/active", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setSessions(res.data);
    } catch (err) {
      console.error(err);
      alert("Fetch active sessions failed");
    }
  };

  const verify = async (sessionId) => {
    try {
      // 1. get geolocation
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;

          // 2. detect face and get descriptor
          const detection = await faceapi
            .detectSingleFace(
              videoRef.current,
              new faceapi.TinyFaceDetectorOptions()
            )
            .withFaceLandmarks()
            .withFaceDescriptor();
          if (!detection) return alert("No face detected");
          const descriptor = Array.from(detection.descriptor);

          // 3. call API
          const res = await API.post(
            `/sessions/${sessionId}/verify`,
            { lat, lng, descriptor },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          if (res.data.ok) alert("Verified successfully");
        },
        (err) => {
          alert("Geolocation failed: " + err.message);
        }
      );
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Verification failed");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Employee Dashboard</h2>
      <video
        ref={videoRef}
        width="320"
        height="240"
        style={{ border: "1px solid #ccc" }}
      />
      <h3>Active Sessions</h3>
      <ul>
        {sessions.map((s) => (
          <li key={s._id}>
            Session {s._id} at {s.locationId?.name || "unknown"}
            <button onClick={() => verify(s._id)}>Verify</button>
          </li>
        ))}
      </ul>
      <button onClick={fetchActive}>Refresh</button>
    </div>
  );
}
