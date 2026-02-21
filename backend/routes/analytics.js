import express from 'express';
import Vehicle from '../models/Vehicle.js';
import Trip from '../models/Trip.js';
import FuelExpense from '../models/FuelExpense.js';
import Maintenance from '../models/Maintenance.js';
import User from '../models/User.js';
import { verifyToken, authorizeRole } from '../middleware/auth.js';
import mongoose from 'mongoose';

const router = express.Router();

// Dashboard KPIs
router.get('/dashboard-kpis', verifyToken, async (req, res) => {
  try {
    const activeFleet = await Vehicle.countDocuments({ status: 'on_trip' });
    const maintenanceAlerts = await Vehicle.countDocuments({ status: 'in_shop' });
    const availableVehicles = await Vehicle.countDocuments({ status: 'available' });
    const totalVehicles = await Vehicle.countDocuments();
    const utilizationRate = totalVehicles > 0 ? ((activeFleet / totalVehicles) * 100).toFixed(2) : 0;
    const pendingCargo = await Trip.countDocuments({ status: 'draft' });

    res.json({
      activeFleet,
      maintenanceAlerts,
      utilizationRate: `${utilizationRate}%`,
      pendingCargo,
      availableVehicles,
      totalVehicles,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Vehicle ROI Analysis
router.get('/vehicle-roi', verifyToken, async (req, res) => {
  try {
    const vehicles = await Vehicle.find();

    const roiData = vehicles.map((vehicle) => {
      const totalCost = vehicle.totalFuelCost + vehicle.totalMaintenanceCost;
      const roi = vehicle.acquisitionCost > 0 ? ((totalCost / vehicle.acquisitionCost) * 100).toFixed(2) : 0;

      return {
        vehicleId: vehicle._id,
        name: vehicle.name,
        licensePlate: vehicle.licensePlate,
        acquisitionCost: vehicle.acquisitionCost,
        fuelCost: vehicle.totalFuelCost,
        maintenanceCost: vehicle.totalMaintenanceCost,
        totalOperationalCost: totalCost,
        roiPercentage: roi,
      };
    });

    res.json(roiData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Fuel Efficiency Report
router.get('/fuel-efficiency', verifyToken, async (req, res) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: '$vehicleId',
          totalLiters: { $sum: '$liters' },
          totalCost: { $sum: '$cost' },
          avgCostPerLiter: { $avg: '$costPerLiter' },
        },
      },
      {
        $lookup: {
          from: 'vehicles',
          localField: '_id',
          foreignField: '_id',
          as: 'vehicleDetails',
        },
      },
      {
        $unwind: '$vehicleDetails',
      },
      {
        $project: {
          vehicleId: '$_id',
          name: '$vehicleDetails.name',
          licensePlate: '$vehicleDetails.licensePlate',
          totalLiters: 1,
          totalCost: 1,
          avgCostPerLiter: 1,
        },
      },
    ];

    const efficiency = await FuelExpense.aggregate(pipeline);
    res.json(efficiency);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Driver Performance Report
router.get('/driver-performance', verifyToken, async (req, res) => {
  try {
    const drivers = await User.find({ role: 'driver' });

    const performance = await Promise.all(
      drivers.map(async (driver) => {
        const tripsCount = await Trip.countDocuments({ driverId: driver._id, status: 'completed' });
        const avgSafetyScore = driver.safetyScore;

        return {
          driverId: driver._id,
          name: driver.name,
          email: driver.email,
          license: driver.licenseNumber,
          licenseExpiry: driver.licenseExpiry,
          tripsCompleted: tripsCount,
          safetyScore: avgSafetyScore,
          status: driver.status,
        };
      })
    );

    res.json(performance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Monthly Operational Cost Report
router.get('/monthly-costs', verifyToken, async (req, res) => {
  try {
    const { month, year } = req.query;
    const startDate = new Date(year || new Date().getFullYear(), (month || new Date().getMonth()), 1);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1);

    const fuelCosts = await FuelExpense.aggregate([
      {
        $match: {
          fuelDate: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalFuel: { $sum: '$cost' },
        },
      },
    ]);

    const maintenanceCosts = await Maintenance.aggregate([
      {
        $match: {
          serviceDate: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalMaintenance: { $sum: '$cost' },
        },
      },
    ]);

    res.json({
      month: startDate.toLocaleString('default', { month: 'long', year: 'numeric' }),
      fuelCost: fuelCosts[0]?.totalFuel || 0,
      maintenanceCost: maintenanceCosts[0]?.totalMaintenance || 0,
      totalCost: (fuelCosts[0]?.totalFuel || 0) + (maintenanceCosts[0]?.totalMaintenance || 0),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Trip Summary Report
router.get('/trip-summary', verifyToken, async (req, res) => {
  try {
    const totalTrips = await Trip.countDocuments();
    const completedTrips = await Trip.countDocuments({ status: 'completed' });
    const activeTrips = await Trip.countDocuments({ status: 'dispatched' });
    const cancelledTrips = await Trip.countDocuments({ status: 'cancelled' });

    const totalDistance = await Trip.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalDistance' } } },
    ]);

    res.json({
      totalTrips,
      completedTrips,
      activeTrips,
      cancelledTrips,
      completionRate: totalTrips > 0 ? ((completedTrips / totalTrips) * 100).toFixed(2) : 0,
      totalDistance: totalDistance[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
