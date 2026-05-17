import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const correctGates = [
      { name: "Sembalun", image: "/sembalun.jpg" },
      { name: "Torean - Senange", image: "/n.jpg" },
      { name: "Senaru", image: "/senaru.jpg" },
    ];

    for (const g of correctGates) {
      const existing = await prisma.ticketGate.findUnique({
        where: { name: g.name }
      });
      if (!existing) {
        await prisma.ticketGate.create({
          data: {
            name: g.name,
            image: g.image,
            is_active: true
          }
        });
      }
    }

    const gates = await prisma.ticketGate.findMany({
      where: { is_active: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ gates });
  } catch (error) {
    console.error("Error fetching gates:", error);
    return NextResponse.json({ error: "Failed to fetch gates" }, { status: 500 });
  }
}
