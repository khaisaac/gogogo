import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const targetId = searchParams.get("target_id");

    const whereClause = targetId ? { target_id: targetId } : {};

    const revisions = await prisma.seoRevision.findMany({
      where: whereClause,
      orderBy: { created_at: "desc" },
      take: 50,
    });

    return NextResponse.json({ revisions });
  } catch (error) {
    console.error("GET /api/admin/seo/revisions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { revisionId } = await req.json();
    const rev = await prisma.seoRevision.findUnique({ where: { id: revisionId } });

    if (!rev) {
      return NextResponse.json({ error: "Revision not found" }, { status: 404 });
    }

    if (rev.target_type === "post") {
      await prisma.post.update({
        where: { id: rev.target_id },
        data: { seo_title: rev.new_title, meta_description: rev.new_description },
      });
    } else {
      await prisma.seoPage.update({
        where: { page_slug: rev.target_id },
        data: { seo_title: rev.new_title, meta_description: rev.new_description },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/admin/seo/revisions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
