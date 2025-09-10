import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  adminId: String,
});

export default mongoose.model("Admin", adminSchema);
