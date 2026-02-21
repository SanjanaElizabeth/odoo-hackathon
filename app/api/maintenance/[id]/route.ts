import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Maintenance from '@/lib/models/Maintenance';
import Vehicle from '@/lib/models/Vehicle';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const maintenance = await Maintenance.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).populate('vehicleId', 'name licensePlate');

    if (!maintenance) return NextResponse.json({ message: 'Record not found' }, { status: 404 });

    if (body.status === 'completed') {
      const vehicle = await Vehicle.findById(maintenance.vehicleId);
      if (vehicle) {
        vehicle.status = 'available';
        await vehicle.save();
      }
    }

    return NextResponse.json(maintenance);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ message }, { status: 400 });
  }
}
