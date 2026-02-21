import express from 'express';
import Vehicle from '../models/Vehicle.js';
import { verifyToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Get all vehicles with filters
router.get('/', verifyToken, async (req, res) => {
  try {
    const { type, status, region } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (status) filter.status = status;
    if (region) filter.region = region;

    const vehicles = await Vehicle.find(filter).sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single vehicle
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create vehicle (Manager only)
router.post('/', verifyToken, authorizeRole(['manager']), async (req, res) => {
  try {
    const { name, licensePlate, model, type, maxLoadCapacity, region, acquisitionCost } = req.body;

    const vehicle = new Vehicle({
      name,
      licensePlate,
      model,
      type,
      maxLoadCapacity,
      region,
      acquisitionCost,
    });

    await vehicle.save();
    res.status(201).json(vehicle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update vehicle
router.put('/:id', verifyToken, authorizeRole(['manager']), async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.json(vehicle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete vehicle
router.delete('/:id', verifyToken, authorizeRole(['manager']), async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Toggle Out of Service
router.patch('/:id/toggle-service', verifyToken, authorizeRole(['manager']), async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    vehicle.status = vehicle.status === 'out_of_service' ? 'available' : 'out_of_service';
    await vehicle.save();

    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
