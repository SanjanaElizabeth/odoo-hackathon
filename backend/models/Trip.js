import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
  tripId: {
    type: String,
    unique: true,
    required: true,
  },
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true,
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  cargoWeight: {
    type: Number,
    required: true,
  },
  cargoDescription: String,
  startLocation: {
    type: String,
    required: true,
  },
  endLocation: {
    type: String,
    required: true,
  },
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Trip', tripSchema);
