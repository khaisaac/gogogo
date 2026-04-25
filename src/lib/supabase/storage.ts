const ADMIN_MEDIA_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "admin-media";
const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;

function sanitizeFileName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-");
}

async function ensureBucketExists(supabase: any) {
  const { error } = await supabase.storage.createBucket(ADMIN_MEDIA_BUCKET, {
    public: true,
    fileSizeLimit: "8MB",
    allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "image/gif"],
  });

  if (error && !error.message.toLowerCase().includes("already exists")) {
    throw new Error(error.message);
  }
}

export async function uploadAdminImage(
  supabase: any,
  file: File,
  folder: "blog" | "packages",
) {
  if (!file || file.size === 0) {
    return null;
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error(
      `${file.name || "Image"} is larger than 8MB. Please upload a smaller file.`,
    );
  }

  await ensureBucketExists(supabase);

  const safeName = sanitizeFileName(file.name || "image");
  const path = `${folder}/${Date.now()}-${crypto.randomUUID()}-${safeName}`;

  const { error: uploadError } = await supabase
    .storage
    .from(ADMIN_MEDIA_BUCKET)
    .upload(path, file, {
      upsert: false,
      contentType: file.type || undefined,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage.from(ADMIN_MEDIA_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadAdminImages(
  supabase: any,
  files: File[],
  folder: "blog" | "packages",
) {
  const validFiles = files.filter((file) => file && file.size > 0);
  if (validFiles.length === 0) {
    return [] as string[];
  }

  const urls = await Promise.all(
    validFiles.map((file) => uploadAdminImage(supabase, file, folder)),
  );

  return urls.filter((url): url is string => Boolean(url));
}
