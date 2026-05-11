import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, email: true, full_name: true, whatsapp: true, role: true },
    });

    return NextResponse.json({ profile: profile || { id: user.id, email: user.email, role: "user" } });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { full_name, phone } = body;

    const profile = await prisma.user.upsert({
      where: { id: user.id },
      update: { full_name: full_name || null, whatsapp: phone || null },
      create: { id: user.id, email: user.email || "", full_name: full_name || null, whatsapp: phone || null },
      select: { id: true, email: true, full_name: true, whatsapp: true, role: true },
    });

    return NextResponse.json({ profile });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
