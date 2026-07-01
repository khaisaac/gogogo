import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const posts = await prisma.post.findMany({
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        featured_image: true,
        is_published: true,
        created_at: true,
        seo_title: true,
        meta_description: true,
        meta_keywords: true,
        canonical_url: true,
        robots: true,
        og_title: true,
        og_description: true,
        og_image: true,
      },
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("GET /api/admin/blog error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
