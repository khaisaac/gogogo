import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const setting = await prisma.seoSetting.findUnique({
      where: { key: "robots_txt" },
    });

    const defaultRobots = `User-agent: *\nAllow: /\n\nSitemap: https://trekkingmountrinjani.com/sitemap.xml`;

    return NextResponse.json({ content: setting ? setting.value : defaultRobots });
  } catch (error) {
    console.error("GET /api/admin/seo/robots error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content } = await req.json();

    await prisma.seoSetting.upsert({
      where: { key: "robots_txt" },
      update: { value: content },
      create: { key: "robots_txt", value: content },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/admin/seo/robots error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
