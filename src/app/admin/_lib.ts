import { redirect } from "next/navigation";
import { getUser, type SessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

type AdminContext = {
  user: SessionUser;
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

export async function requireAdmin(): Promise<SessionUser> {
  const { user } = await requireAdminContext();
  return user;
}
