// src/components/face/FaceApiLoader.jsx
import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "@vladmandic/face-api/dist/face-api.esm.js";

const FaceApiLoader = ({ onDescriptorCaptured }) => {
  const videoRef = useRef();
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    // Load face-api models
    const loadModels = async () => {
      // const MODEL_URL = "/models"; // Place models in public/models/
      const MODEL_URL =
        "https://cdn.jsdelivr.net/gh/cgarciagl/face-api.js/weights";

      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      setModelsLoaded(true);
      await startVideo();
    };

    loadModels();

    // Cleanup camera stream on unmount
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const startVideo = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      videoRef.current.srcObject = mediaStream;
      setStream(mediaStream);
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const handleCapture = async () => {
    if (videoRef.current && modelsLoaded) {
      const detection = await faceapi
        .detectSingleFace(videoRef.current)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection) {
        onDescriptorCaptured(Array.from(detection.descriptor));
      } else {
        alert("No face detected. Please try again.");
      }
    }
  };

  return (
    <div>
      <video
        ref={videoRef}
        width="640"
        height="480"
        autoPlay
        muted
        style={{ border: "1px solid #ccc", borderRadius: "5px" }}
      />
      <button
        onClick={handleCapture}
        disabled={!modelsLoaded}
        style={{ marginTop: "10px", padding: "5px 10px" }}
      >
        {modelsLoaded ? "Capture & Register Face" : "Loading Models..."}
      </button>
    </div>
  );
};

export default FaceApiLoader;
