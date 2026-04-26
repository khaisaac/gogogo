import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { uploadAdminImage } from "@/lib/supabase/storage";

type UploadFolder = "blog" | "packages";

function resolveFolder(value: FormDataEntryValue | null): UploadFolder {
  const text = String(value || "packages");
  return text === "blog" ? "blog" : "packages";
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const folder = resolveFolder(formData.get("folder"));

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { error: "File is required" },
        { status: 400 },
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

    const url = await uploadAdminImage(adminSupabase, file, folder);
    if (!url) {
      return NextResponse.json(
        { error: "Failed to upload image" },
        { status: 500 },
      );
    }

    return NextResponse.json({ url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
