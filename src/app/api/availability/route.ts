import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/availability?package_id=xxx
// Returns all active available dates for a package (future dates only)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const packageId = searchParams.get("package_id");

    if (!packageId) {
      return NextResponse.json({ error: "package_id is required" }, { status: 400 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dates = await prisma.packageDate.findMany({
      where: {
        package_id: packageId,
        is_active: true,
        date: { gte: today },
      },
      orderBy: { date: "asc" },
      select: {
        id: true,
        date: true,
        max_pax: true,
        booked_pax: true,
        notes: true,
      },
    });

    // Return dates with availability info
    const result = dates.map((d) => ({
      id: d.id,
      date: d.date.toISOString().split("T")[0], // YYYY-MM-DD
      max_pax: d.max_pax,
      booked_pax: d.booked_pax,
      available_pax: d.max_pax - d.booked_pax,
      notes: d.notes,
      is_available: d.booked_pax < d.max_pax,
    }));

    return NextResponse.json({ dates: result });
  } catch (error) {
    console.error("GET /api/availability error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
