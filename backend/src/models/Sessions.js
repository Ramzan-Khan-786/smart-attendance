import mongoose from "mongoose";
const sessionSchema = new mongoose.Schema(
  {
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },
    startedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startTime: { type: Date, required: true, default: Date.now },
    endTime: { type: Date },
    active: { type: Boolean, default: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    attendanceSaved: { type: Boolean, default: false },
    savedExcelUrl: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Session", sessionSchema);
