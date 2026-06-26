import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import fs from "fs";
import path from "path";

/**
 * Self-healing Storage Route Handler:
 * Jika Hostinger melakukan redeploy server dan menghapus isi folder /public/uploads,
 * handler ini akan menangkap request gambar, mengambil cadangan biner dari MySQL,
 * memulihkannya kembali ke /public/uploads di disk server, lalu menampilkannya seketika.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    const relativePath = `uploads/${pathSegments.join("/")}`;
    const diskPath = path.join(process.cwd(), "public", relativePath);

    // 1. Cek apakah file fisik sudah ada di disk server
    if (fs.existsSync(diskPath)) {
      const buffer = fs.readFileSync(diskPath);
      const ext = path.extname(diskPath).toLowerCase();
      let mimeType = "image/webp";
      if (ext === ".png") mimeType = "image/png";
      else if (ext === ".jpg" || ext === ".jpeg") mimeType = "image/jpeg";
      else if (ext === ".gif") mimeType = "image/gif";

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": mimeType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    // 2. Pemulihan Otomatis (*Self-Healing*): Ambil cadangan biner dari tabel MySQL
    const storedImage = await prisma.storedImage.findUnique({
      where: { id: relativePath },
    });

    if (!storedImage) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Restore ke disk fisik agar request berikutnya langsung dilayani statis server
    try {
      const dir = path.dirname(diskPath);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(diskPath, storedImage.data);
    } catch (writeErr) {
      console.error("Warning: Could not self-heal image to disk:", writeErr);
    }

    return new NextResponse(storedImage.data, {
      status: 200,
      headers: {
        "Content-Type": storedImage.mimeType || "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving self-healing upload:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
