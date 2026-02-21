import mongoose from 'mongoose';

const fuelExpenseSchema = new mongoose.Schema({
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' },
  liters: { type: Number, required: true },
  cost: { type: Number, required: true },
  costPerLiter: { type: Number, required: true },
  km: { type: Number, default: 0 },
  fuelDate: { type: Date, required: true },
  notes: String,
}, { timestamps: true });

export default mongoose.models.FuelExpense || mongoose.model('FuelExpense', fuelExpenseSchema);
