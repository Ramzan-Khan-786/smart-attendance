import mongoose from 'mongoose';
const locationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  center: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  radiusMeters: { type: Number, required: true, default: 50 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('Location', locationSchema);
