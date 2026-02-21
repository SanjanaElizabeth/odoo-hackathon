import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Vehicle from '@/lib/models/Vehicle';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    const filter: Record<string, string> = {};
    if (type) filter.type = type;
    if (status) filter.status = status;

    const vehicles = await Vehicle.find(filter).sort({ createdAt: -1 });
    return NextResponse.json(vehicles);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const vehicle = await Vehicle.create(body);
    return NextResponse.json(vehicle, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ message }, { status: 400 });
  }
}
