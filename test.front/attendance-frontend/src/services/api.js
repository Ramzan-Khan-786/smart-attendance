import axios from "axios";

const BACKEND_URL = "http://localhost:5000";

const api = axios.create({
  baseURL: BACKEND_URL,
  headers: { "Content-Type": "application/json" },
});

// ==========================
// Auth APIs
// ==========================

export const adminRegister = (data) => api.post("/admin/register", data);

export const adminLogin = async (data) => {
  const response = await api.post("/admin/login", data);
  // Store JWT token in localStorage
  localStorage.setItem("token", response.data.token);
  return response;
};

export const userRegister = (data) => api.post("/user/register", data);

export const userLogin = async (data) => {
  const response = await api.post("/user/login", data);
  // Store JWT token in localStorage
  localStorage.setItem("token", response.data.token);
  return response;
};

// ==========================
// Location / Geofence APIs
// ==========================

export const getLocations = () => {
  const token = localStorage.getItem("token");
  return api.get("/locations", {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const addLocation = (data) => {
  const token = localStorage.getItem("token");
  return api.post("/locations", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const startGeofence = (data) => {
  const token = localStorage.getItem("token");
  return api.post("/geofence/start", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const closeGeofence = (data) => {
  const token = localStorage.getItem("token");
  return api.post("/geofence/close", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// ==========================
// Session / Attendance APIs
// ==========================

export const getActiveSessions = () => {
  const token = localStorage.getItem("token");
  return api.get("/sessions/active", {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const uploadSelfie = (formData) => {
  const token = localStorage.getItem("token");
  return api.post("/verify/selfie", formData, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const checkInsideGeofence = (coords) => {
  const token = localStorage.getItem("token");
  return api.post("/geofence/check", coords, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export default api;
