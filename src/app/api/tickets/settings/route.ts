import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/app/admin/_lib";

const DEFAULT_SETTINGS = {
  id: "default",
  title: "e-Rinjani Entrance Tickets",
  description: "Secure your limited official Mt. Rinjani National Park entrance tickets first! Ensure flexible dates and instant confirmation before commencing your trek.",
  about_items: `Instant Booking: Avoid queues and secure your entry pass ahead of your climb.
Medical Insurance Included: Covers basic search, rescue, and health care within the national park.
Official Registration: Issued and verified directly through the Rinjani National Park registry.
Flexible Routes: Valid for Sembalun, Senaru, and Torean trekking trails.`,
  included_items: `Official Mt. Rinjani National Park Entrance Pass
Customized Entrance and Exit Gate route registry
Trekking Health & Search and Rescue (SAR) Insurance
24/7 client support for e-Rinjani processing`,
  image: "/sembalun.jpg",
};

export async function GET() {
  try {
    let settings = await prisma.ticketSetting.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      // Create default settings if they do not exist
      settings = await prisma.ticketSetting.create({
        data: DEFAULT_SETTINGS,
      });
    }

    return NextResponse.json(settings);
  } catch (error: any) {
    console.error("Error fetching ticket settings:", error);
    // Fallback if DB table is not ready during deploy or compilation
    return NextResponse.json(DEFAULT_SETTINGS);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();

    const updated = await prisma.ticketSetting.upsert({
      where: { id: "default" },
      update: {
        title: body.title,
        description: body.description,
        about_items: body.about_items,
        included_items: body.included_items,
        image: body.image,
      },
      create: {
        id: "default",
        title: body.title || DEFAULT_SETTINGS.title,
        description: body.description || DEFAULT_SETTINGS.description,
        about_items: body.about_items || DEFAULT_SETTINGS.about_items,
        included_items: body.included_items || DEFAULT_SETTINGS.included_items,
        image: body.image || DEFAULT_SETTINGS.image,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating ticket settings:", error);
    return NextResponse.json({ error: error.message || "Failed to update settings" }, { status: 500 });
  }
}
