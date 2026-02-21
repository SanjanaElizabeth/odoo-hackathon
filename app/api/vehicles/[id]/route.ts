import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Vehicle from '@/lib/models/Vehicle';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const vehicle = await Vehicle.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!vehicle) return NextResponse.json({ message: 'Vehicle not found' }, { status: 404 });
    return NextResponse.json(vehicle);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const vehicle = await Vehicle.findByIdAndDelete(id);
    if (!vehicle) return NextResponse.json({ message: 'Vehicle not found' }, { status: 404 });
    return NextResponse.json({ message: 'Vehicle deleted' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ message }, { status: 500 });
  }
}
