import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  location: { type: mongoose.Schema.Types.ObjectId, ref: "Location" },
  active: { type: Boolean, default: true },
  attendees: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      verified: { type: Boolean, default: false },
    },
  ],
});

export default mongoose.model("Session", sessionSchema);
