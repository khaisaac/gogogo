import { prisma } from "@/lib/db";

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
];


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

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const storedImage = await prisma.storedImage.create({
    data: {
      data: buffer,
      mimeType: file.type,
    },
  });

  return `/api/images/${storedImage.id}`;
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
    if (!publicUrl.startsWith("/api/images/")) {
      return false;
    }

    const id = publicUrl.replace("/api/images/", "").split("?")[0];
    
    await prisma.storedImage.delete({
      where: { id },
    });
    
    return true;
  } catch (error) {
    console.error("Failed to delete stored image:", error);
    return false;
  }
}
