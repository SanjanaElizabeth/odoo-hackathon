import express from 'express';
import Trip from '../models/Trip.js';
import Vehicle from '../models/Vehicle.js';
import User from '../models/User.js';
import { verifyToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Get all trips with filters
router.get('/', verifyToken, async (req, res) => {
  try {
    const { status, vehicleId, driverId } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (vehicleId) filter.vehicleId = vehicleId;
    if (driverId) filter.driverId = driverId;

    const trips = await Trip.find(filter)
      .populate('vehicleId', 'name licensePlate type')
      .populate('driverId', 'name email safetyScore')
      .sort({ createdAt: -1 });

    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single trip
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('vehicleId')
      .populate('driverId');

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create trip (Dispatcher only)
router.post('/', verifyToken, authorizeRole(['dispatcher']), async (req, res) => {
  try {
    const { vehicleId, driverId, cargoWeight, cargoDescription, startLocation, endLocation } = req.body;

    // Validate vehicle capacity
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    if (cargoWeight > vehicle.maxLoadCapacity) {
      return res.status(400).json({
        message: `Cargo weight (${cargoWeight}kg) exceeds vehicle capacity (${vehicle.maxLoadCapacity}kg)`,
      });
    }

    // Validate driver license
    const driver = await User.findById(driverId);
    if (!driver || driver.role !== 'driver') {
      return res.status(404).json({ message: 'Driver not found' });
    }

    if (driver.licenseExpiry && new Date(driver.licenseExpiry) < new Date()) {
      return res.status(400).json({ message: 'Driver license has expired' });
    }

    if (driver.status !== 'active') {
      return res.status(400).json({ message: 'Driver is not active' });
    }

    const tripId = `TRIP-${Date.now()}`;

    const trip = new Trip({
      tripId,
      vehicleId,
      driverId,
      cargoWeight,
      cargoDescription,
      startLocation,
      endLocation,
    });

    await trip.save();

    // Populate before returning
    await trip.populate('vehicleId', 'name licensePlate type');
    await trip.populate('driverId', 'name email safetyScore');

    res.status(201).json(trip);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update trip status
router.patch('/:id/status', verifyToken, authorizeRole(['dispatcher']), async (req, res) => {
  try {
    const { status, startOdometer, endOdometer } = req.body;
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const oldStatus = trip.status;
    trip.status = status;

    if (status === 'dispatched') {
      trip.startTime = new Date();
      trip.startOdometer = startOdometer;

      // Update vehicle status to on_trip
      await Vehicle.findByIdAndUpdate(trip.vehicleId, { status: 'on_trip' });
    }

    if (status === 'completed') {
      trip.endTime = new Date();
      trip.endOdometer = endOdometer;
      trip.totalDistance = endOdometer - (trip.startOdometer || 0);

      // Update vehicle status back to available
      await Vehicle.findByIdAndUpdate(trip.vehicleId, { status: 'available' });

      // Update driver trips count
      await User.findByIdAndUpdate(trip.driverId, {
        $inc: { tripsCompleted: 1 },
      });
    }

    if (status === 'cancelled') {
      // Reset vehicle status if it was on_trip
      if (oldStatus === 'dispatched') {
        await Vehicle.findByIdAndUpdate(trip.vehicleId, { status: 'available' });
      }
    }

    await trip.save();
    await trip.populate('vehicleId', 'name licensePlate type');
    await trip.populate('driverId', 'name email safetyScore');

    res.json(trip);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
