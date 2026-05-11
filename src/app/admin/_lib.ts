import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { User } from "@supabase/supabase-js";

type AdminContext = {
  user: User;
};

export async function requireAdminContext(): Promise<AdminContext> {
  const user = await getUser();

  if (!user) {
    redirect("/admin-login");
  }

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  if (!profile || profile.role !== "admin") {
    redirect(
      `/admin-login?error=not_admin&email=${encodeURIComponent(user.email || "unknown")}`,
    );
  }

  return { user };
}

export async function requireAdmin(): Promise<User> {
  const { user } = await requireAdminContext();
  return user;
}
