import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Maintenance from '@/lib/models/Maintenance';
import Vehicle from '@/lib/models/Vehicle';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const filter: Record<string, string> = {};
    if (status) filter.status = status;

    const records = await Maintenance.find(filter)
      .populate('vehicleId', 'name licensePlate')
      .sort({ createdAt: -1 });
    return NextResponse.json(records);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { vehicleId, serviceType, cost, description, serviceDate, nextServiceDate } = body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return NextResponse.json({ message: 'Vehicle not found' }, { status: 404 });

    const maintenance = await Maintenance.create({
      vehicleId,
      serviceType,
      cost,
      description,
      serviceDate,
      nextServiceDate,
      status: 'scheduled',
    });

    vehicle.totalMaintenanceCost += cost;
    await vehicle.save();

    const populated = await Maintenance.findById(maintenance._id)
      .populate('vehicleId', 'name licensePlate');

    return NextResponse.json(populated, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ message }, { status: 400 });
  }
}
