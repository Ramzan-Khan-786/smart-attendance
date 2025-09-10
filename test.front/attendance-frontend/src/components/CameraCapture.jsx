import React, { useRef, useEffect } from "react";

/**
 * CameraCapture
 * Props:
 * - onCapture(imageBlob) => called with blob of captured image
 */
export default function CameraCapture({ onCapture }) {
  const videoRef = useRef();
  const canvasRef = useRef();

  useEffect(() => {
    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      } catch (err) {
        console.error("camera error", err);
      }
    }
    start();
    return () => {
      const s = videoRef.current?.srcObject;
      if (s) s.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const take = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);
    canvas.toBlob((blob) => onCapture(blob), "image/jpeg", 0.9);
  };

  return (
    <div>
      <video ref={videoRef} style={{ width: "100%", borderRadius: 8 }} />
      <div style={{ marginTop: 8, display: "flex", justifyContent: "center" }}>
        <button className="btn small" onClick={take}>
          Capture
        </button>
      </div>
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}
