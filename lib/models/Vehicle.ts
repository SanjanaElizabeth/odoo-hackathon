import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  licensePlate: { type: String, required: true, unique: true },
  model: { type: String, required: true },
  type: { type: String, enum: ['truck', 'van', 'bike'], required: true },
  maxLoadCapacity: { type: Number, required: true },
  currentOdometer: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['available', 'on_trip', 'in_shop', 'out_of_service'],
    default: 'available',
  },
  region: { type: String, default: 'Unknown' },
  acquisitionCost: { type: Number, default: 0 },
  totalFuelCost: { type: Number, default: 0 },
  totalMaintenanceCost: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.Vehicle || mongoose.model('Vehicle', vehicleSchema);
