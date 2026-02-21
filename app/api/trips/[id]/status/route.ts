import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Trip from '@/lib/models/Trip';
import Vehicle from '@/lib/models/Vehicle';
import Driver from '@/lib/models/Driver';

export { handler as PUT };
export { handler as PATCH };

async function handler(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const { status } = await req.json();

    const trip = await Trip.findById(id);
    if (!trip) return NextResponse.json({ message: 'Trip not found' }, { status: 404 });

    const oldStatus = trip.status;
    trip.status = status;

    if (status === 'dispatched') {
      trip.startTime = new Date();
      await Vehicle.findByIdAndUpdate(trip.vehicleId, { status: 'on_trip' });
    }

    if (status === 'completed') {
      trip.endTime = new Date();
      await Vehicle.findByIdAndUpdate(trip.vehicleId, { status: 'available' });
      await Driver.findByIdAndUpdate(trip.driverId, { $inc: { tripsCompleted: 1 } });
    }

    if (status === 'cancelled' && oldStatus === 'dispatched') {
      await Vehicle.findByIdAndUpdate(trip.vehicleId, { status: 'available' });
    }

    await trip.save();

    const populated = await Trip.findById(trip._id)
      .populate('vehicleId', 'name licensePlate type maxLoadCapacity status')
      .populate('driverId', 'name email safetyScore status');

    return NextResponse.json(populated);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ message }, { status: 400 });
  }
}
