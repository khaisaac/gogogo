import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/app/admin/_lib";

export const dynamic = "force-dynamic";

// GET: Fetch all transport bookings
export async function GET() {
  try {
    await requireAdmin();
    const bookings = await prisma.transportBooking.findMany({
      orderBy: { created_at: "desc" },
      include: {
        payments: true,
      },
    });
    return NextResponse.json(bookings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Update a transport booking (admin only)
export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { id, payment_status, pickup_location, dropoff_location, pickup_time, booking_date } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const updatedBooking = await prisma.transportBooking.update({
      where: { id },
      data: {
        payment_status,
        pickup_location,
        dropoff_location,
        pickup_time,
        booking_date: booking_date ? new Date(booking_date) : undefined,
      },
    });

    return NextResponse.json(updatedBooking);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Delete a transport booking (admin only)
export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    await prisma.transportBooking.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
