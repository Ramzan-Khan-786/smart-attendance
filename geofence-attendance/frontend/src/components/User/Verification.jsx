// src/components/attendance/Verification.jsx
import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "@vladmandic/face-api/dist/face-api.esm.js"; // ESM version for Vite
import useAuth from "../../hooks/useAuth.jsx";
import api from "../../api/index.jsx"; // updated path

const Verification = ({ session }) => {
  const { user } = useAuth();
  const videoRef = useRef();
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [message, setMessage] = useState(
    "Position your face in front of the camera."
  );

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models"; // Make sure models are in public/models
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      setModelsLoaded(true);
      startVideo();
    };

    loadModels();

    // Cleanup camera stream on unmount
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => (videoRef.current.srcObject = stream))
      .catch((err) => console.error("Error accessing camera:", err));
  };

  const handleVerification = async () => {
    if (!user || !user.faceDescriptor) {
      setMessage("Registered face data not found.");
      return;
    }

    setMessage("Verifying...");

    const detection = await faceapi
      .detectSingleFace(videoRef.current)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (detection) {
      const registeredDescriptor = new Float32Array(user.faceDescriptor);
      const distance = faceapi.euclideanDistance(
        detection.descriptor,
        registeredDescriptor
      );

      if (distance < 0.5) {
        setMessage("Verification successful! Marking attendance...");
        try {
          await api.post("/user/attendance/mark", {
            sessionId: session._id,
            isVerified: true,
          });
          setMessage("Attendance marked successfully!");
        } catch (err) {
          setMessage(err.response?.data?.msg || "Error marking attendance.");
        }
      } else {
        setMessage("Verification failed. Face does not match.");
      }
    } else {
      setMessage("No face detected. Please try again.");
    }
  };

  return (
    <div style={{ padding: "10px" }}>
      <video
        ref={videoRef}
        width="320"
        height="240"
        autoPlay
        muted
        style={{ border: "1px solid #ccc", borderRadius: "5px" }}
      />
      <div style={{ marginTop: "10px" }}>
        <button onClick={handleVerification} disabled={!modelsLoaded}>
          Self Verify
        </button>
      </div>
      <p style={{ marginTop: "10px" }}>{message}</p>
    </div>
  );
};

export default Verification;
