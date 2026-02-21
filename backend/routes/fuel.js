import express from 'express';
import FuelExpense from '../models/FuelExpense.js';
import Vehicle from '../models/Vehicle.js';
import { verifyToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Get all fuel expenses
router.get('/', verifyToken, async (req, res) => {
  try {
    const { vehicleId, tripId } = req.query;
    const filter = {};

    if (vehicleId) filter.vehicleId = vehicleId;
    if (tripId) filter.tripId = tripId;

    const expenses = await FuelExpense.find(filter)
      .populate('vehicleId', 'name licensePlate')
      .populate('tripId', 'tripId status')
      .sort({ fuelDate: -1 });

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get fuel efficiency analytics
router.get('/analytics/efficiency', verifyToken, async (req, res) => {
  try {
    const { vehicleId } = req.query;

    const pipeline = [
      ...(vehicleId ? [{ $match: { vehicleId: new mongoose.Types.ObjectId(vehicleId) } }] : []),
      {
        $group: {
          _id: '$vehicleId',
          totalLiters: { $sum: '$liters' },
          totalCost: { $sum: '$cost' },
          avgCostPerLiter: { $avg: '$costPerLiter' },
          recordCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'vehicles',
          localField: '_id',
          foreignField: '_id',
          as: 'vehicle',
        },
      },
    ];

    const analytics = await FuelExpense.aggregate(pipeline);
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single fuel expense
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const expense = await FuelExpense.findById(req.params.id).populate('vehicleId').populate('tripId');

    if (!expense) {
      return res.status(404).json({ message: 'Fuel expense not found' });
    }

    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create fuel expense (Dispatcher or Financial Analyst)
router.post('/', verifyToken, authorizeRole(['dispatcher', 'financial_analyst']), async (req, res) => {
  try {
    const { vehicleId, tripId, liters, cost, costPerLiter, fuelDate, notes } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    const expense = new FuelExpense({
      vehicleId,
      tripId,
      liters,
      cost,
      costPerLiter,
      fuelDate,
      notes,
    });

    await expense.save();

    // Update vehicle's total fuel cost
    vehicle.totalFuelCost += cost;
    await vehicle.save();

    await expense.populate('vehicleId', 'name licensePlate');

    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update fuel expense
router.put('/:id', verifyToken, authorizeRole(['dispatcher', 'financial_analyst'], async (req, res) => {
  try {
    const { cost } = req.body;
    const expense = await FuelExpense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Fuel expense not found' });
    }

    const oldCost = expense.cost;
    const costDifference = (cost || oldCost) - oldCost;

    const updated = await FuelExpense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('vehicleId');

    // Update vehicle total fuel cost with the difference
    if (costDifference !== 0) {
      const vehicle = await Vehicle.findById(updated.vehicleId);
      if (vehicle) {
        vehicle.totalFuelCost += costDifference;
        await vehicle.save();
      }
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete fuel expense
router.delete('/:id', verifyToken, authorizeRole(['dispatcher', 'financial_analyst'], async (req, res) => {
  try {
    const expense = await FuelExpense.findByIdAndDelete(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Fuel expense not found' });
    }

    // Update vehicle total fuel cost
    const vehicle = await Vehicle.findById(expense.vehicleId);
    if (vehicle) {
      vehicle.totalFuelCost -= expense.cost;
      await vehicle.save();
    }

    res.json({ message: 'Fuel expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
