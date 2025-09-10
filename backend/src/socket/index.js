import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const initSocketHandlers = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next();
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = payload.id;
      return next();
    } catch (err) {
      return next();
    }
  });

  io.on("connection", (socket) => {
    console.log("Socket connected", socket.id, "user", socket.userId);
    socket.on("join", (room) => {
      socket.join(room);
    });

    socket.on("start_session", (payload) => {
      // server should validate and re-emit; here we broadcast to all
      io.emit("session_started", payload);
    });

    socket.on("stop_session", (payload) => {
      io.emit("session_stopped", payload);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected", socket.id);
    });
  });
};
