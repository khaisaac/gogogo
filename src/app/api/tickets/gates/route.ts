import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const gates = await prisma.ticketGate.findMany({
      where: { is_active: true },
      orderBy: { name: "asc" },
    });

    // Fallback if no gates in DB yet
    if (gates.length === 0) {
      const defaultGates = [
        { id: "1", name: "Aik Berik", image: "/gates/aik-berik.jpg" },
        { id: "2", name: "Tete Batu", image: "/gates/tete-batu.jpg" },
        { id: "3", name: "Sembalun", image: "/gates/sembalun.jpg" },
        { id: "4", name: "Senaru", image: "/gates/senaru.jpg" },
        { id: "5", name: "Timbanuh", image: "/gates/timbanuh.jpg" },
        { id: "6", name: "Torengan", image: "/gates/torengan.jpg" },
      ];
      return NextResponse.json({ gates: defaultGates });
    }

    return NextResponse.json({ gates });
  } catch (error) {
    console.error("Error fetching gates:", error);
    return NextResponse.json({ error: "Failed to fetch gates" }, { status: 500 });
  }
}
