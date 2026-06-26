"use server";

import { prisma } from "@/lib/db";
import { verifyPassword, signInUser, hashPassword } from "@/lib/auth";

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

export async function seedDefaultAdmin(customEmail?: string, customPassword?: string) {
  if (process.env.NODE_ENV === "production") {
    return { error: "Security: Admin seeding shortcut is disabled in production." };
  }
  try {
    const email = customEmail?.trim() || "admin@rinjani.com";
    const plainPwd = customPassword?.trim() || "admin123";
    const hash = await hashPassword(plainPwd);

    await prisma.user.upsert({
      where: { email },
      update: {
        role: "admin",
        password_hash: hash,
        full_name: "Super Administrator",
      },
      create: {
        email,
        role: "admin",
        password_hash: hash,
        full_name: "Super Administrator",
      },
    });

    return { success: true, email, password: plainPwd };
  } catch (error: any) {
    console.error("Seed admin error:", error);
    return { error: error.message || String(error) };
  }
}

export async function adminLogin(email: string, password: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { error: "Akun admin tidak ditemukan di database lokal. Klik tombol '⚡ Buat/Reset Akun Admin Default' di bawah." };
    }

    if (user.role !== "admin") {
      return { error: "Akun ini bukan admin (role saat ini: " + user.role + ")." };
    }

    if (!user.password_hash) {
      return { error: "Akun admin ini belum memiliki password di database lokal. Klik tombol '⚡ Buat/Reset Akun Admin Default' di bawah." };
    }

    const isValid = await verifyPassword(password, user.password_hash);
    
    if (!isValid) {
      return { error: "Password salah." };
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
    return { error: `Terjadi kesalahan: ${error.message || String(error)}` };
  }
}
