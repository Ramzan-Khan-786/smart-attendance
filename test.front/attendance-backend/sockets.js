// backend/socket.js
import { Server } from "socket.io";

export default function setupSocket(server, app) {
  const io = new Server(server, {
    cors: { origin: "*" }, // set appropriately for production
  });

  io.on("connection", (socket) => {
    console.log("socket connected", socket.id);

    // join room by role or session if needed
    socket.on("join:session", (sessionId) => {
      if (sessionId) socket.join(`session:${sessionId}`);
    });

    socket.on("disconnect", () => {
      console.log("socket disconnected", socket.id);
    });
  });

  // make io available via app so routes can emit events
  app.set("io", io);

  return io;
}
