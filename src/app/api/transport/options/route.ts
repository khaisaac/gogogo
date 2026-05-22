import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/app/admin/_lib";

export const dynamic = "force-dynamic";

// GET: Fetch all transport options
export async function GET() {
  try {
    const options = await prisma.transportOption.findMany({
      orderBy: { created_at: "desc" },
    });
    return NextResponse.json(options);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Create a new transport option (admin only)
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { route, price, image, is_active } = body;

    if (!route || price === undefined) {
      return NextResponse.json({ error: "Route and price are required" }, { status: 400 });
    }

    const newOption = await prisma.transportOption.create({
      data: {
        route,
        price: parseInt(price),
        image,
        is_active: is_active ?? true,
      },
    });

    return NextResponse.json(newOption);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Update an existing transport option (admin only)
export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { id, route, price, image, is_active } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const updatedOption = await prisma.transportOption.update({
      where: { id },
      data: {
        route,
        price: price !== undefined ? parseInt(price) : undefined,
        image,
        is_active,
      },
    });

    return NextResponse.json(updatedOption);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Delete a transport option (admin only)
export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    await prisma.transportOption.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
