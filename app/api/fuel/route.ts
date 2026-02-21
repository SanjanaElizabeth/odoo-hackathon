import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import FuelExpense from '@/lib/models/FuelExpense';
import Vehicle from '@/lib/models/Vehicle';

export async function GET() {
  try {
    await connectDB();
    const expenses = await FuelExpense.find()
      .populate('vehicleId', 'name licensePlate')
      .sort({ fuelDate: -1 });
    return NextResponse.json(expenses);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { vehicleId, liters, cost, costPerLiter, fuelDate, km, notes } = body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return NextResponse.json({ message: 'Vehicle not found' }, { status: 404 });

    const expense = await FuelExpense.create({
      vehicleId,
      liters,
      cost,
      costPerLiter,
      km: km || 0,
      fuelDate,
      notes,
    });

    vehicle.totalFuelCost += cost;
    await vehicle.save();

    const populated = await FuelExpense.findById(expense._id)
      .populate('vehicleId', 'name licensePlate');

    return NextResponse.json(populated, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ message }, { status: 400 });
  }
}
