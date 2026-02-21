import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Driver from '@/lib/models/Driver';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const driver = await Driver.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!driver) return NextResponse.json({ message: 'Driver not found' }, { status: 404 });
    return NextResponse.json(driver);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const driver = await Driver.findByIdAndDelete(id);
    if (!driver) return NextResponse.json({ message: 'Driver not found' }, { status: 404 });
    return NextResponse.json({ message: 'Driver deleted' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ message }, { status: 500 });
  }
}
