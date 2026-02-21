import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Trip from '@/lib/models/Trip';
import Vehicle from '@/lib/models/Vehicle';
import Driver from '@/lib/models/Driver';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const filter: Record<string, string> = {};
    if (status) filter.status = status;

    const trips = await Trip.find(filter)
      .populate('vehicleId', 'name licensePlate type maxLoadCapacity status')
      .populate('driverId', 'name email safetyScore status')
      .sort({ createdAt: -1 });
    return NextResponse.json(trips);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { vehicleId, driverId, cargoWeight, startLocation, endLocation, cargoDescription } = body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return NextResponse.json({ message: 'Vehicle not found' }, { status: 404 });
    if (cargoWeight > vehicle.maxLoadCapacity) {
      return NextResponse.json({
        message: `Cargo weight (${cargoWeight}kg) exceeds vehicle capacity (${vehicle.maxLoadCapacity}kg)`,
      }, { status: 400 });
    }

    const driver = await Driver.findById(driverId);
    if (!driver) return NextResponse.json({ message: 'Driver not found' }, { status: 404 });

    const tripId = `TR-${String(Date.now()).slice(-6)}`;
    const trip = await Trip.create({
      tripId,
      vehicleId,
      driverId,
      cargoWeight,
      cargoDescription,
      startLocation,
      endLocation,
      status: 'draft',
    });

    const populated = await Trip.findById(trip._id)
      .populate('vehicleId', 'name licensePlate type maxLoadCapacity status')
      .populate('driverId', 'name email safetyScore status');

    return NextResponse.json(populated, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ message }, { status: 400 });
  }
}
