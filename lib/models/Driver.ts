import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  licenseNumber: { type: String, required: true },
  licenseExpiry: { type: Date, required: true },
  safetyScore: { type: Number, default: 100 },
  tripsCompleted: { type: Number, default: 0 },
  tripsAssigned: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['on_duty', 'off_duty', 'suspended'],
    default: 'on_duty',
  },
}, { timestamps: true });

export default mongoose.models.Driver || mongoose.model('Driver', driverSchema);
