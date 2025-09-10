import mongoose from "mongoose";

const ActiveGeofenceSchema = new mongoose.Schema({
  geofence: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Geofence",
    required: true,
  },
  sessionName: { type: String, required: true },
  activatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  activatedByName: { type: String },
  startedAt: { type: Date, default: Date.now },
});

// We will maintain at most one document in this collection. Starting a geofence creates the doc; stopping it deletes it.
export default mongoose.model("ActiveGeofence", ActiveGeofenceSchema);
