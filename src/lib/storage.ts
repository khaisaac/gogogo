import { prisma } from "@/lib/db";
import fs from "fs";
import path from "path";

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
];

function cleanFilename(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9.]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Upload a single image to local filesystem (/public/uploads) AND backup to MySQL StoredImage table.
 * Returns the public URL path (e.g., /uploads/packages/171829-image.webp)
 */
export async function uploadImage(
  file: File,
  folder: "blog" | "packages",
): Promise<string | null> {
  if (!file || file.size === 0) {
    return null;
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error(
      `${file.name || "Image"} is larger than 10MB. Please upload a smaller file.`,
    );
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error(
      `Invalid file type: ${file.type}. Allowed: PNG, JPEG, WebP, GIF.`,
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const ext = path.extname(file.name || "") || ".webp";
  const baseName = path.basename(file.name || "image", ext);
  const safeName = cleanFilename(baseName) || "photo";
  const uniqueName = `${Date.now()}-${safeName}${ext}`;
  const relativeFolder = `uploads/${folder}`;
  const relativePath = `${relativeFolder}/${uniqueName}`;
  const publicUrl = `/${relativePath}`;

  // 1. Save to local filesystem /public/uploads/...
  try {
    const publicDir = path.join(process.cwd(), "public", relativeFolder);
    fs.mkdirSync(publicDir, { recursive: true });
    fs.writeFileSync(path.join(publicDir, uniqueName), buffer);
  } catch (err) {
    console.error("Warning: Failed to write uploaded image to disk:", err);
  }

  // 2. Backup to MySQL StoredImage (Self-healing guarantee against Hostinger redeploys)
  try {
    await prisma.storedImage.create({
      data: {
        id: relativePath, // e.g. "uploads/packages/123-image.webp"
        data: buffer,
        mimeType: file.type,
      },
    });
  } catch (dbErr) {
    console.error("Warning: Failed to backup image to MySQL:", dbErr);
  }

  return publicUrl;
}

/**
 * Upload multiple images.
 * Returns array of public URL paths.
 */
export async function uploadImages(
  files: File[],
  folder: "blog" | "packages",
): Promise<string[]> {
  const validFiles = files.filter((file) => file && file.size > 0);
  if (validFiles.length === 0) {
    return [];
  }

  const urls = await Promise.all(
    validFiles.map((file) => uploadImage(file, folder)),
  );

  return urls.filter((url): url is string => Boolean(url));
}

/**
 * Delete an uploaded file by its public URL path.
 */
export async function deleteUploadedFile(publicUrl: string): Promise<boolean> {
  try {
    if (!publicUrl) return false;
    const relativePath = publicUrl.replace(/^\//, "").split("?")[0];
    
    // 1. Delete from MySQL
    await prisma.storedImage.deleteMany({
      where: { id: relativePath },
    });

    // Also handle legacy /api/images/ID format
    if (publicUrl.startsWith("/api/images/")) {
      const id = publicUrl.replace("/api/images/", "").split("?")[0];
      await prisma.storedImage.deleteMany({ where: { id } });
    }

    // 2. Delete from disk
    const diskPath = path.join(process.cwd(), "public", relativePath);
    if (fs.existsSync(diskPath)) {
      fs.unlinkSync(diskPath);
    }
    
    return true;
  } catch (error) {
    console.error("Failed to delete stored image:", error);
    return false;
  }
}
