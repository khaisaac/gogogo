import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pages = await prisma.seoPage.findMany({
      orderBy: { page_slug: "asc" },
    });

    return NextResponse.json({ pages });
  } catch (error) {
    console.error("GET /api/admin/seo/pages error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      page_slug,
      seo_title,
      meta_description,
      meta_keywords,
      canonical_url,
      robots,
      og_title,
      og_description,
      og_image,
      twitter_title,
      twitter_description,
      twitter_image,
    } = body;

    if (!page_slug) {
      return NextResponse.json({ error: "page_slug is required" }, { status: 400 });
    }

    const saved = await prisma.seoPage.upsert({
      where: { page_slug },
      update: {
        seo_title,
        meta_description,
        meta_keywords,
        canonical_url,
        robots: robots || "index, follow",
        og_title,
        og_description,
        og_image,
        twitter_title,
        twitter_description,
        twitter_image,
      },
      create: {
        page_slug,
        seo_title,
        meta_description,
        meta_keywords,
        canonical_url,
        robots: robots || "index, follow",
        og_title,
        og_description,
        og_image,
        twitter_title,
        twitter_description,
        twitter_image,
      },
    });

    return NextResponse.json({ success: true, page: saved });
  } catch (error) {
    console.error("POST /api/admin/seo/pages error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
