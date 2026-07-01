import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [seoPages, posts] = await Promise.all([
      prisma.seoPage.findMany(),
      prisma.post.findMany({
        select: { id: true, title: true, slug: true, seo_title: true, meta_description: true },
        orderBy: { created_at: "desc" },
      }),
    ]);

    const items: any[] = [];

    // Default static pages if not in DB yet
    const defaultStatic = ["home", "about", "contact", "faq", "privacy-policy", "terms", "destination", "tour-package"];
    defaultStatic.forEach((slug) => {
      const existing = seoPages.find((p) => p.page_slug === slug);
      items.push({
        id: existing?.id || `static_${slug}`,
        type: "page",
        slug,
        title: slug.toUpperCase(),
        seo_title: existing?.seo_title || "",
        meta_description: existing?.meta_description || "",
      });
    });

    posts.forEach((post) => {
      items.push({
        id: post.id,
        type: "post",
        slug: `/blog/${post.slug}`,
        title: post.title,
        seo_title: post.seo_title || "",
        meta_description: post.meta_description || "",
      });
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error("GET /api/admin/seo/bulk error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { items } = await req.json();
    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "Invalid items array" }, { status: 400 });
    }

    for (const item of items) {
      if (item.type === "page") {
        await prisma.seoPage.upsert({
          where: { page_slug: item.slug },
          update: { seo_title: item.seo_title, meta_description: item.meta_description },
          create: { page_slug: item.slug, seo_title: item.seo_title, meta_description: item.meta_description },
        });
      } else if (item.type === "post") {
        await prisma.post.update({
          where: { id: item.id },
          data: { seo_title: item.seo_title, meta_description: item.meta_description },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/admin/seo/bulk error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
