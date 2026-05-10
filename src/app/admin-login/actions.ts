"use server";

import { prisma } from "@/lib/db";

export async function verifyAdminRole(userId: string) {
  try {
    const profile = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    return profile;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
}
