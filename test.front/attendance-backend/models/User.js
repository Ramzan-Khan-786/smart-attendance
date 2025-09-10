import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  photo: String, // stored selfie path
});

export default mongoose.model("User", userSchema);
