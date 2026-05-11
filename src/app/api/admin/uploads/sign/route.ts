import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { uploadImage } from "@/lib/storage";

/**
 * This endpoint now handles direct file upload to local filesystem.
 * The client sends a file, we upload it and return the public URL.
 * No more signed URL flow since we're not using Supabase Storage.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const profile = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } });
    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { fileName, fileSize, folder = "packages" } = body;

    if (!fileName) {
      return NextResponse.json({ error: "fileName is required" }, { status: 400 });
    }

    // Since we're using local storage, we return a fake signed URL response
    // that the client can use. The client will now need to POST the file directly.
    // For backward compatibility, we return the same structure.
    return NextResponse.json({
      // These fields tell the client to use direct upload instead
      useDirectUpload: true,
      uploadUrl: "/api/admin/uploads/direct",
      folder,
      fileName,
    });
  } catch (err: any) {
    console.error("Upload sign error:", err);
    return NextResponse.json({ error: err.message || "Failed to prepare upload" }, { status: 500 });
  }
}
