import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const image = await prisma.storedImage.findUnique({
      where: { id },
    });

    if (!image) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Return the image bytes with the correct mime type
    // Add aggressive caching since these images are immutable
    return new NextResponse(image.data, {
      status: 200,
      headers: {
        "Content-Type": image.mimeType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving image:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
