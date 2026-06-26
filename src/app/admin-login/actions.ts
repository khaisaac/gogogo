"use server";

import { prisma } from "@/lib/db";
import { verifyPassword, signInUser } from "@/lib/auth";

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

export async function adminLogin(email: string, password: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.role !== "admin" || !user.password_hash) {
      return { error: "Email atau password salah." };
    }

    const isValid = await verifyPassword(password, user.password_hash);
    
    if (!isValid) {
      return { error: "Email atau password salah." };
    }

    // Sign in using our custom JWT
    await signInUser({
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Admin login error:", error);
    return { error: `Terjadi kesalahan saat mencoba login.` };
  }
}
