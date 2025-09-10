import mongoose from "mongoose";
const attendanceSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    firstVerifiedAt: { type: Date },
    lastSeenAt: { type: Date },
    verifiedBy: { type: String, enum: ["auto", "self"], default: "auto" },
    durationSeconds: { type: Number, default: 0 },
    percentageOfClass: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["present", "absent", "failed"],
      default: "absent",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Attendance", attendanceSchema);
