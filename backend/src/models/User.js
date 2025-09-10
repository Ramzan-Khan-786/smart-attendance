import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, required: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "employee"], default: "employee" },
    name: { type: String, required: true },
    employeeId: { type: String },
    photoUrl: { type: String, default: "" },
    faceDescriptor: { type: [Number], default: [] }, // store descriptor as array of numbers
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
