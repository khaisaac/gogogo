import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ADMIN_MEDIA_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "admin-media";
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

type UploadFolder = "blog" | "packages";

function sanitizeFileName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-");
}

function resolveFolder(value: unknown): UploadFolder {
  return value === "blog" ? "blog" : "packages";
}

function buildPath(folder: UploadFolder, fileName: string) {
  const safeName = sanitizeFileName(fileName || "image");
  return `${folder}/${Date.now()}-${crypto.randomUUID()}-${safeName}`;
}

async function ensureBucketExists(supabase: any) {
  const { error } = await supabase.storage.createBucket(ADMIN_MEDIA_BUCKET, {
    public: true,
    fileSizeLimit: "10MB",
    allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "image/gif"],
  });

  if (error && !error.message.toLowerCase().includes("already exists")) {
    throw new Error(error.message);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const fileName = String(body?.fileName || "").trim();
    const fileSize = Number(body?.fileSize || 0);
    const folder = resolveFolder(body?.folder);

    if (!fileName || !Number.isFinite(fileSize) || fileSize <= 0) {
      return NextResponse.json(
        { error: "Invalid upload request" },
        { status: 400 },
      );
    }

    if (fileSize > MAX_IMAGE_SIZE_BYTES) {
      return NextResponse.json(
        { error: `${fileName} is larger than 10MB. Please upload a smaller file.` },
        { status: 413 },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const adminSupabase = createAdminClient();
    const { data: profile, error: profileError } = await adminSupabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    await ensureBucketExists(adminSupabase);

    const path = buildPath(folder, fileName);
    const { data: signedData, error: signedError } = await adminSupabase
      .storage
      .from(ADMIN_MEDIA_BUCKET)
      .createSignedUploadUrl(path);

    if (signedError || !signedData) {
      throw new Error(signedError?.message || "Failed to create signed upload URL");
    }

    const { data: publicData } = adminSupabase
      .storage
      .from(ADMIN_MEDIA_BUCKET)
      .getPublicUrl(path);

    return NextResponse.json({
      bucket: ADMIN_MEDIA_BUCKET,
      path,
      token: signedData.token,
      publicUrl: publicData.publicUrl,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload init failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
