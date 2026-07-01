import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const redirects = await prisma.seoRedirect.findMany({
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({ redirects });
  } catch (error) {
    console.error("GET /api/admin/seo/redirects error:", error);
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
    const { source_url, target_url, status_code = 301 } = body;

    if (!source_url || !target_url) {
      return NextResponse.json({ error: "source_url and target_url required" }, { status: 400 });
    }

    const cleanSource = source_url.startsWith("/") ? source_url : "/" + source_url;
    const cleanTarget = target_url.startsWith("/") || target_url.startsWith("http") ? target_url : "/" + target_url;

    const redirect = await prisma.seoRedirect.upsert({
      where: { source_url: cleanSource },
      update: { target_url: cleanTarget, status_code: Number(status_code) },
      create: { source_url: cleanSource, target_url: cleanTarget, status_code: Number(status_code) },
    });

    return NextResponse.json({ success: true, redirect });
  } catch (error) {
    console.error("POST /api/admin/seo/redirects error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    await prisma.seoRedirect.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/seo/redirects error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
