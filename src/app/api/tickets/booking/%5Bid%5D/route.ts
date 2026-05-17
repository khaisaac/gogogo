import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/app/admin/_lib";

export async function DELETE(
  req: NextRequest,
  { params }: any
) {
  try {
    await requireAdmin();
    const { id } = await params;

    await prisma.ticketBooking.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting ticket booking:", error);
    return NextResponse.json({ error: error.message || "Failed to delete" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: any
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();

    const updated = await prisma.ticketBooking.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating ticket booking:", error);
    return NextResponse.json({ error: error.message || "Failed to update" }, { status: 500 });
  }
}
