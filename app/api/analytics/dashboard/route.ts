import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Vehicle from '@/lib/models/Vehicle';
import Trip from '@/lib/models/Trip';
import Driver from '@/lib/models/Driver';
import FuelExpense from '@/lib/models/FuelExpense';
import Maintenance from '@/lib/models/Maintenance';

export async function GET() {
  try {
    await connectDB();

    const [
      totalVehicles,
      activeFleet,
      maintenanceAlerts,
      availableVehicles,
      pendingCargo,
      totalTrips,
      completedTrips,
      activeTrips,
      cancelledTrips,
      totalDrivers,
      onDutyDrivers,
      suspendedDrivers,
    ] = await Promise.all([
      Vehicle.countDocuments(),
      Vehicle.countDocuments({ status: 'on_trip' }),
      Vehicle.countDocuments({ status: 'in_shop' }),
      Vehicle.countDocuments({ status: 'available' }),
      Trip.countDocuments({ status: 'draft' }),
      Trip.countDocuments(),
      Trip.countDocuments({ status: 'completed' }),
      Trip.countDocuments({ status: 'dispatched' }),
      Trip.countDocuments({ status: 'cancelled' }),
      Driver.countDocuments(),
      Driver.countDocuments({ status: 'on_duty' }),
      Driver.countDocuments({ status: 'suspended' }),
    ]);

    const utilizationRate = totalVehicles > 0
      ? ((activeFleet / totalVehicles) * 100).toFixed(1)
      : '0';

    const completionRate = totalTrips > 0
      ? ((completedTrips / totalTrips) * 100).toFixed(1)
      : '0';

    // Get total fuel and maintenance costs
    const fuelAgg = await FuelExpense.aggregate([
      { $group: { _id: null, total: { $sum: '$cost' } } },
    ]);
    const maintAgg = await Maintenance.aggregate([
      { $group: { _id: null, total: { $sum: '$cost' } } },
    ]);

    const totalFuelCost = fuelAgg[0]?.total || 0;
    const totalMaintenanceCost = maintAgg[0]?.total || 0;

    // Get distance from completed trips
    const distanceAgg = await Trip.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalDistance' } } },
    ]);

    // Get driver safety avg
    const safetyAgg = await Driver.aggregate([
      { $group: { _id: null, avg: { $avg: '$safetyScore' } } },
    ]);

    return NextResponse.json({
      totalVehicles,
      activeFleet,
      maintenanceAlerts,
      availableVehicles,
      pendingCargo,
      utilizationRate: `${utilizationRate}%`,
      totalTrips,
      completedTrips,
      activeTrips,
      cancelledTrips,
      completionRate: `${completionRate}%`,
      totalDrivers,
      onDutyDrivers,
      suspendedDrivers,
      totalFuelCost,
      totalMaintenanceCost,
      totalDistance: distanceAgg[0]?.total || 0,
      avgSafetyScore: safetyAgg[0]?.avg?.toFixed(1) || '0',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ message }, { status: 500 });
  }
}
