import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
  tripId: { type: String, unique: true, required: true },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
  cargoWeight: { type: Number, required: true },
  cargoDescription: String,
  startLocation: { type: String, required: true },
  endLocation: { type: String, required: true },
  startOdometer: Number,
  endOdometer: Number,
  status: {
    type: String,
    enum: ['draft', 'dispatched', 'completed', 'cancelled'],
    default: 'draft',
  },
  startTime: Date,
  endTime: Date,
  totalDistance: Number,
  notes: String,
}, { timestamps: true });

export default mongoose.models.Trip || mongoose.model('Trip', tripSchema);
