import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI environment variable is not set');
  process.exit(1);
}

const vehicleSchema = new mongoose.Schema({
  name: String, licensePlate: { type: String, unique: true }, model: String,
  type: { type: String, enum: ['truck', 'van', 'bike'] },
  maxLoadCapacity: Number, currentOdometer: { type: Number, default: 0 },
  status: { type: String, enum: ['available', 'on_trip', 'in_shop', 'out_of_service'], default: 'available' },
  region: String, acquisitionCost: Number, totalFuelCost: Number, totalMaintenanceCost: Number,
}, { timestamps: true });

const driverSchema = new mongoose.Schema({
  name: String, email: { type: String, unique: true, lowercase: true },
  licenseNumber: String, licenseExpiry: Date, safetyScore: { type: Number, default: 100 },
  tripsCompleted: { type: Number, default: 0 }, tripsAssigned: { type: Number, default: 0 },
  status: { type: String, enum: ['on_duty', 'off_duty', 'suspended'], default: 'on_duty' },
}, { timestamps: true });

const tripSchema = new mongoose.Schema({
  tripId: { type: String, unique: true },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
  cargoWeight: Number, cargoDescription: String, startLocation: String, endLocation: String,
  startOdometer: Number, endOdometer: Number,
  status: { type: String, enum: ['draft', 'dispatched', 'completed', 'cancelled'], default: 'draft' },
  startTime: Date, endTime: Date, totalDistance: Number, notes: String,
}, { timestamps: true });

const fuelExpenseSchema = new mongoose.Schema({
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' },
  liters: Number, cost: Number, costPerLiter: Number, km: { type: Number, default: 0 },
  fuelDate: Date, notes: String,
}, { timestamps: true });

const maintenanceSchema = new mongoose.Schema({
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  serviceType: String, cost: Number, description: String,
  serviceDate: Date, nextServiceDate: Date,
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' },
  notes: String,
}, { timestamps: true });

const Vehicle = mongoose.model('Vehicle', vehicleSchema);
const Driver = mongoose.model('Driver', driverSchema);
const Trip = mongoose.model('Trip', tripSchema);
const FuelExpense = mongoose.model('FuelExpense', fuelExpenseSchema);
const Maintenance = mongoose.model('Maintenance', maintenanceSchema);

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected!');

  console.log('Clearing existing data...');
  await Promise.all([
    Vehicle.deleteMany({}), Driver.deleteMany({}), Trip.deleteMany({}),
    FuelExpense.deleteMany({}), Maintenance.deleteMany({}),
  ]);

  console.log('Seeding vehicles...');
  const vehicles = await Vehicle.insertMany([
    { name: 'TR-001', licensePlate: 'MH02AB0001', model: 'Volvo FH16', type: 'truck', maxLoadCapacity: 25000, status: 'available', currentOdometer: 45230, region: 'West', acquisitionCost: 800000, totalFuelCost: 28000, totalMaintenanceCost: 400 },
    { name: 'TR-005', licensePlate: 'MH02AB0005', model: 'Mercedes Actros', type: 'truck', maxLoadCapacity: 24000, status: 'on_trip', currentOdometer: 67890, region: 'North', acquisitionCost: 850000, totalFuelCost: 26500, totalMaintenanceCost: 800 },
    { name: 'TR-008', licensePlate: 'MH02AB0008', model: 'Scania R450', type: 'truck', maxLoadCapacity: 23000, status: 'in_shop', currentOdometer: 89120, region: 'South', acquisitionCost: 820000, totalFuelCost: 28000, totalMaintenanceCost: 1550 },
    { name: 'TR-012', licensePlate: 'MH02AB0012', model: 'Man TGX', type: 'truck', maxLoadCapacity: 25500, status: 'available', currentOdometer: 12450, region: 'East', acquisitionCost: 780000, totalFuelCost: 11000, totalMaintenanceCost: 500 },
    { name: 'VN-003', licensePlate: 'MH02AB0003', model: 'Ford Transit', type: 'van', maxLoadCapacity: 3500, status: 'available', currentOdometer: 34560, region: 'West', acquisitionCost: 350000, totalFuelCost: 8000, totalMaintenanceCost: 200 },
  ]);
  console.log(`Seeded ${vehicles.length} vehicles`);

  console.log('Seeding drivers...');
  const drivers = await Driver.insertMany([
    { name: 'John Doe', email: 'john@example.com', licenseNumber: 'DL-2024-001', licenseExpiry: new Date('2027-12-31'), safetyScore: 95, tripsCompleted: 127, tripsAssigned: 130, status: 'on_duty' },
    { name: 'Jane Smith', email: 'jane@example.com', licenseNumber: 'DL-2024-002', licenseExpiry: new Date('2026-03-15'), safetyScore: 88, tripsCompleted: 104, tripsAssigned: 112, status: 'on_duty' },
    { name: 'Mike Johnson', email: 'mike@example.com', licenseNumber: 'DL-2023-003', licenseExpiry: new Date('2025-06-20'), safetyScore: 76, tripsCompleted: 148, tripsAssigned: 156, status: 'off_duty' },
    { name: 'Sarah Wilson', email: 'sarah@example.com', licenseNumber: 'DL-2023-004', licenseExpiry: new Date('2024-03-10'), safetyScore: 62, tripsCompleted: 79, tripsAssigned: 89, status: 'suspended' },
    { name: 'Alex Brown', email: 'alex@example.com', licenseNumber: 'DL-2024-005', licenseExpiry: new Date('2027-09-01'), safetyScore: 91, tripsCompleted: 98, tripsAssigned: 100, status: 'on_duty' },
    { name: 'Lisa Chen', email: 'lisa@example.com', licenseNumber: 'DL-2024-006', licenseExpiry: new Date('2026-02-28'), safetyScore: 84, tripsCompleted: 65, tripsAssigned: 70, status: 'off_duty' },
  ]);
  console.log(`Seeded ${drivers.length} drivers`);

  console.log('Seeding trips...');
  const trips = await Trip.insertMany([
    { tripId: 'TR-0001', vehicleId: vehicles[1]._id, driverId: drivers[0]._id, cargoWeight: 2500, startLocation: 'Warehouse A', endLocation: 'Store B', status: 'dispatched', startTime: new Date('2026-02-20T10:00:00Z') },
    { tripId: 'TR-0002', vehicleId: vehicles[1]._id, driverId: drivers[1]._id, cargoWeight: 3200, startLocation: 'Port C', endLocation: 'Store D', status: 'dispatched', startTime: new Date('2026-02-20T11:30:00Z') },
    { tripId: 'TR-0003', vehicleId: vehicles[2]._id, driverId: drivers[2]._id, cargoWeight: 1800, startLocation: 'Factory E', endLocation: 'Retail F', status: 'completed', startTime: new Date('2026-02-19T09:00:00Z'), endTime: new Date('2026-02-19T17:00:00Z'), totalDistance: 320 },
    { tripId: 'TR-0004', vehicleId: vehicles[3]._id, driverId: drivers[3]._id, cargoWeight: 2200, startLocation: 'Warehouse A', endLocation: 'Store G', status: 'draft' },
  ]);
  console.log(`Seeded ${trips.length} trips`);

  console.log('Seeding fuel expenses...');
  const fuel = await FuelExpense.insertMany([
    { vehicleId: vehicles[0]._id, liters: 150, cost: 15000, costPerLiter: 100, km: 930, fuelDate: new Date('2024-01-20') },
    { vehicleId: vehicles[1]._id, liters: 120, cost: 12000, costPerLiter: 100, km: 768, fuelDate: new Date('2024-01-19') },
    { vehicleId: vehicles[2]._id, liters: 140, cost: 14000, costPerLiter: 100, km: 854, fuelDate: new Date('2024-01-18') },
    { vehicleId: vehicles[3]._id, liters: 110, cost: 11000, costPerLiter: 100, km: 693, fuelDate: new Date('2024-01-17') },
    { vehicleId: vehicles[0]._id, liters: 130, cost: 13000, costPerLiter: 100, km: 806, fuelDate: new Date('2024-01-15') },
    { vehicleId: vehicles[1]._id, liters: 145, cost: 14500, costPerLiter: 100, km: 928, fuelDate: new Date('2024-01-14') },
  ]);
  console.log(`Seeded ${fuel.length} fuel expenses`);

  console.log('Seeding maintenance records...');
  const maint = await Maintenance.insertMany([
    { vehicleId: vehicles[0]._id, serviceType: 'Oil Change', cost: 250, serviceDate: new Date('2024-01-20'), status: 'completed' },
    { vehicleId: vehicles[1]._id, serviceType: 'Tire Replacement', cost: 800, serviceDate: new Date('2024-01-19'), status: 'completed' },
    { vehicleId: vehicles[2]._id, serviceType: 'Brake Service', cost: 1200, serviceDate: new Date('2024-01-21'), status: 'scheduled' },
    { vehicleId: vehicles[3]._id, serviceType: 'Engine Inspection', cost: 500, serviceDate: new Date('2024-01-18'), status: 'completed' },
    { vehicleId: vehicles[0]._id, serviceType: 'Filter Replacement', cost: 150, serviceDate: new Date('2024-01-10'), status: 'completed' },
    { vehicleId: vehicles[2]._id, serviceType: 'Transmission Check', cost: 350, serviceDate: new Date('2024-01-05'), status: 'completed' },
  ]);
  console.log(`Seeded ${maint.length} maintenance records`);

  console.log('\nDatabase seeded successfully!');
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
