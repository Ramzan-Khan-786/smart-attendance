import React, { useEffect, useRef, useState } from "react";
import API from "../services/api";
import * as faceapi from "face-api.js";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const videoRef = useRef();
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const MODEL_URL =
        "https://cdn.jsdelivr.net/gh/cgarciagl/face-api.js/weights";
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        console.log("✅ Models loaded successfully");
        setModelsLoaded(true);

        // start camera only after models are ready
        await startVideo();
      } catch (err) {
        console.error("❌ Model load failed", err);
      }
    };

    init();

    return () => stopVideo();
  }, []);

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // wait for metadata before playing
        videoRef.current.onloadedmetadata = async () => {
          try {
            await videoRef.current.play();
            console.log("🎥 Video started");
          } catch (err) {
            console.warn("Video play error:", err);
          }
        };
      }
    } catch (err) {
      console.error("Camera error", err);
    }
  };

  const stopVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const captureAndRegister = async () => {
    if (!modelsLoaded) return alert("Models not loaded yet");

    const detections = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detections) {
      return alert("No face detected. Make sure camera can see your face.");
    }

    const descriptor = Array.from(detections.descriptor);

    // capture image
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0);
    const photoBase64 = canvas.toDataURL("image/jpeg", 0.9);

    try {
      const res = await API.post("/auth/register", {
        name,
        email,
        password,
        role: "employee",
        photoUrl: photoBase64,
        faceDescriptor: descriptor,
      });
      alert("Registered. You will be logged in.");
      localStorage.setItem("token", res.data.token);
      navigate("/employee");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Register (Employee)</h2>
      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <br />
      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />
      <div>
        <video
          ref={videoRef}
          width="320"
          height="240"
          style={{ border: "1px solid #ccc" }}
          autoPlay
          muted
        />
      </div>
      <button onClick={captureAndRegister} disabled={!modelsLoaded}>
        {modelsLoaded ? "Capture & Register" : "Loading models..."}
      </button>
    </div>
  );
}
