import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
];

function sanitizeFileName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-");
}

async function ensureDirectoryExists(dirPath: string) {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

/**
 * Upload a single image to local filesystem.
 * Returns the public URL path (e.g., /uploads/packages/1234-image.jpg)
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

  const folderPath = path.join(UPLOAD_DIR, folder);
  await ensureDirectoryExists(folderPath);

  const safeName = sanitizeFileName(file.name || "image");
  const uniqueId = crypto.randomUUID();
  const fileName = `${Date.now()}-${uniqueId}-${safeName}`;
  const filePath = path.join(folderPath, fileName);

  // Convert File to Buffer and write
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await fs.writeFile(filePath, buffer);

  // Return public URL path
  return `/uploads/${folder}/${fileName}`;
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
    // Only delete files in /uploads/ directory
    if (!publicUrl.startsWith("/uploads/")) {
      return false;
    }

    const filePath = path.join(process.cwd(), "public", publicUrl);
    await fs.unlink(filePath);
    return true;
  } catch {
    return false;
  }
}
