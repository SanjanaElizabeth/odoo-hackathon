import express from 'express';
import Maintenance from '../models/Maintenance.js';
import Vehicle from '../models/Vehicle.js';
import { verifyToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Get all maintenance records
router.get('/', verifyToken, async (req, res) => {
  try {
    const { vehicleId, status } = req.query;
    const filter = {};

    if (vehicleId) filter.vehicleId = vehicleId;
    if (status) filter.status = status;

    const records = await Maintenance.find(filter)
      .populate('vehicleId', 'name licensePlate')
      .sort({ createdAt: -1 });

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single maintenance record
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const record = await Maintenance.findById(req.params.id).populate('vehicleId');

    if (!record) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }

    res.json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create maintenance record (Manager only)
router.post('/', verifyToken, authorizeRole(['manager']), async (req, res) => {
  try {
    const { vehicleId, serviceType, cost, description, serviceDate, nextServiceDate } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    const maintenance = new Maintenance({
      vehicleId,
      serviceType,
      cost,
      description,
      serviceDate,
      nextServiceDate,
      status: 'scheduled',
    });

    await maintenance.save();

    // If not already in shop, mark vehicle as "In Shop"
    if (vehicle.status !== 'in_shop') {
      vehicle.status = 'in_shop';
      vehicle.totalMaintenanceCost += cost;
      await vehicle.save();
    }

    await maintenance.populate('vehicleId', 'name licensePlate');

    res.status(201).json(maintenance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update maintenance record
router.put('/:id', verifyToken, authorizeRole(['manager']), async (req, res) => {
  try {
    const { status, cost } = req.body;
    const maintenance = await Maintenance.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('vehicleId');

    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }

    // If completing maintenance, mark vehicle as available
    if (status === 'completed') {
      const vehicle = await Vehicle.findById(maintenance.vehicleId);
      if (vehicle) {
        vehicle.status = 'available';
        if (cost) vehicle.totalMaintenanceCost += cost;
        await vehicle.save();
      }
    }

    res.json(maintenance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete maintenance record
router.delete('/:id', verifyToken, authorizeRole(['manager']), async (req, res) => {
  try {
    const maintenance = await Maintenance.findByIdAndDelete(req.params.id);

    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }

    res.json({ message: 'Maintenance record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
