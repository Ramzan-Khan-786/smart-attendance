import mongoose from "mongoose";

const GeofenceSchema = new mongoose.Schema({
  name: { type: String, required: true }, // friendly location name
  coords: {
    // store as array of lat-lng points or for circle: center + radius
    type: { type: String, enum: ["circle", "polygon"], default: "circle" },
    center: { lat: Number, lng: Number },
    radius: Number, // meters, for circle
    polygon: [{ lat: Number, lng: Number }], // optional
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Geofence", GeofenceSchema);
