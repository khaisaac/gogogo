import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/app/admin/_lib";
import { uploadImage } from "@/lib/storage";

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
    const formData = await req.formData();
    const route = formData.get("route") as string;
    const priceStr = formData.get("price") as string;
    const isActiveStr = formData.get("is_active") as string;
    const imageFile = formData.get("image") as File | null;

    if (!route || !priceStr) {
      return NextResponse.json({ error: "Route and price are required" }, { status: 400 });
    }

    let imageUrl = null;
    if (imageFile && imageFile.size > 0) {
      imageUrl = await uploadImage(imageFile, "packages");
    }

    const newOption = await prisma.transportOption.create({
      data: {
        route,
        price: parseInt(priceStr),
        image: imageUrl,
        is_active: isActiveStr === "true",
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
    const formData = await req.formData();
    const id = formData.get("id") as string;
    const route = formData.get("route") as string;
    const priceStr = formData.get("price") as string;
    const isActiveStr = formData.get("is_active") as string;
    const imageFile = formData.get("image") as File | null;
    const existingImageUrl = formData.get("existing_image") as string | null;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    let imageUrl = existingImageUrl || null;
    if (imageFile && imageFile.size > 0) {
      imageUrl = await uploadImage(imageFile, "packages");
    }

    const updatedOption = await prisma.transportOption.update({
      where: { id },
      data: {
        route: route || undefined,
        price: priceStr ? parseInt(priceStr) : undefined,
        image: imageUrl,
        is_active: isActiveStr ? isActiveStr === "true" : undefined,
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
