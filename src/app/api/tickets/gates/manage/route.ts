import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/app/admin/_lib";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { name, image, is_active } = body;

    const gate = await prisma.ticketGate.create({
      data: { name, image, is_active },
    });

    return NextResponse.json(gate);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { id, ...data } = body;

    const gate = await prisma.ticketGate.update({
      where: { id },
      data,
    });

    return NextResponse.json(gate);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await prisma.ticketGate.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
