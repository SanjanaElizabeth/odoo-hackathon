import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI not set');
  process.exit(1);
}

async function check() {
  console.log('=== MongoDB Diagnostics ===\n');
  console.log('Connecting to:', MONGODB_URI.replace(/\/\/.*@/, '//***:***@'));

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connection: SUCCESS\n');

    const db = mongoose.connection.db;
    const dbName = db.databaseName;
    console.log('Database name:', dbName);

    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('\n--- Collections ---');
    if (collections.length === 0) {
      console.log('  (No collections found)');
    } else {
      for (const col of collections) {
        const count = await db.collection(col.name).countDocuments();
        console.log(`  ${col.name}: ${count} documents`);
      }
    }

    // Show sample data from each collection
    console.log('\n--- Sample Data ---\n');
    for (const col of collections) {
      const docs = await db.collection(col.name).find().limit(2).toArray();
      console.log(`[${col.name}] (showing ${docs.length} samples):`);
      for (const doc of docs) {
        // Show a simplified view
        const simplified = {};
        for (const [key, val] of Object.entries(doc)) {
          if (key === '_id') {
            simplified[key] = val.toString();
          } else if (val instanceof Date) {
            simplified[key] = val.toISOString();
          } else if (typeof val === 'object' && val !== null && val.toString) {
            simplified[key] = val.toString();
          } else {
            simplified[key] = val;
          }
        }
        console.log('  ', JSON.stringify(simplified));
      }
      console.log('');
    }

    // Test mongoose model queries (like the API would)
    console.log('--- Testing Mongoose Queries (like API routes) ---\n');

    const vehicleSchema = new mongoose.Schema({}, { strict: false });
    const Vehicle = mongoose.model('Vehicle', vehicleSchema);

    const driverSchema = new mongoose.Schema({}, { strict: false });
    const Driver = mongoose.model('Driver', driverSchema);

    const tripSchema = new mongoose.Schema({}, { strict: false });
    const Trip = mongoose.model('Trip', tripSchema);

    const fuelSchema = new mongoose.Schema({}, { strict: false });
    const FuelExpense = mongoose.model('FuelExpense', fuelSchema);

    const maintSchema = new mongoose.Schema({}, { strict: false });
    const Maintenance = mongoose.model('Maintenance', maintSchema);

    const vehicleCount = await Vehicle.countDocuments();
    const driverCount = await Driver.countDocuments();
    const tripCount = await Trip.countDocuments();
    const fuelCount = await FuelExpense.countDocuments();
    const maintCount = await Maintenance.countDocuments();

    console.log('Vehicle.countDocuments():', vehicleCount);
    console.log('Driver.countDocuments():', driverCount);
    console.log('Trip.countDocuments():', tripCount);
    console.log('FuelExpense.countDocuments():', fuelCount);
    console.log('Maintenance.countDocuments():', maintCount);

    console.log('\n=== All checks passed! ===');
  } catch (err) {
    console.error('Connection FAILED:', err.message);
    console.error(err.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected.');
  }
}

check();
