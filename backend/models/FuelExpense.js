import mongoose from 'mongoose';

const fuelExpenseSchema = new mongoose.Schema({
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true,
  },
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
  },
  liters: {
    type: Number,
    required: true,
  },
  cost: {
    type: Number,
    required: true,
  },
  costPerLiter: {
    type: Number,
    required: true,
  },
  fuelDate: {
    type: Date,
    required: true,
  },
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

export default mongoose.model('FuelExpense', fuelExpenseSchema);
