import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";

async function requireAdmin() {
  const user = await getUser();
  if (!user) return null;
  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  if (!profile || profile.role !== "admin") return null;
  return user;
}

// GET /api/admin/availability?package_id=xxx  (all dates including past/inactive)
export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const packageId = searchParams.get("package_id");

  const where = packageId ? { package_id: packageId } : {};

  const dates = await prisma.packageDate.findMany({
    where,
    orderBy: [{ package_id: "asc" }, { date: "asc" }],
    include: {
      package: { select: { id: true, title: true, route: true } },
    },
  });

  return NextResponse.json({ dates });
}

// POST /api/admin/availability  — Create one or many dates
export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { package_id, dates, max_pax, notes } = body;

    if (!package_id || !dates || !Array.isArray(dates) || dates.length === 0) {
      return NextResponse.json({ error: "package_id and dates[] are required" }, { status: 400 });
    }

    // Upsert each date (create or update if exists)
    const results = await Promise.all(
      dates.map(async (dateStr: string) => {
        const date = new Date(dateStr);
        date.setUTCHours(0, 0, 0, 0);

        return prisma.packageDate.upsert({
          where: {
            package_id_date: { package_id, date },
          },
          update: {
            max_pax: max_pax ?? 20,
            notes: notes ?? null,
            is_active: true,
            updated_at: new Date(),
          },
          create: {
            package_id,
            date,
            max_pax: max_pax ?? 20,
            notes: notes ?? null,
            is_active: true,
            updated_at: new Date(),
          },
        });
      })
    );

    return NextResponse.json({ created: results.length, dates: results });
  } catch (error) {
    console.error("POST /api/admin/availability error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
