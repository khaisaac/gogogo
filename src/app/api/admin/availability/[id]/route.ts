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

// PATCH /api/admin/availability/[id]  — Update a date
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { max_pax, notes, is_active } = body;

    const updated = await prisma.packageDate.update({
      where: { id: params.id },
      data: {
        ...(max_pax !== undefined && { max_pax }),
        ...(notes !== undefined && { notes }),
        ...(is_active !== undefined && { is_active }),
        updated_at: new Date(),
      },
    });

    return NextResponse.json({ date: updated });
  } catch (error) {
    console.error("PATCH /api/admin/availability/[id] error:", error);
    return NextResponse.json({ error: "Not found or update failed" }, { status: 404 });
  }
}

// DELETE /api/admin/availability/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await prisma.packageDate.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/availability/[id] error:", error);
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
