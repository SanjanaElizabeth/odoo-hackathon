import mongoose from 'mongoose';

const maintenanceSchema = new mongoose.Schema({
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  serviceType: { type: String, required: true },
  cost: { type: Number, required: true },
  description: String,
  serviceDate: { type: Date, required: true },
  nextServiceDate: Date,
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled',
  },
  notes: String,
}, { timestamps: true });

export default mongoose.models.Maintenance || mongoose.model('Maintenance', maintenanceSchema);
