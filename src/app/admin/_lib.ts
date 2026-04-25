import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { User } from "@supabase/supabase-js";

type AdminContext = {
  user: User;
  adminSupabase: ReturnType<typeof createAdminClient>;
};

export async function requireAdminContext(): Promise<AdminContext> {
  const adminSupabase = createAdminClient();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin-login");
  }

  const { data: profile, error } = await adminSupabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (error || profile?.role !== "admin") {
    redirect(
      `/admin-login?error=not_admin&email=${encodeURIComponent(user.email || "unknown")}`,
    );
  }

  return { user, adminSupabase };
}

export async function requireAdminClient() {
  const { adminSupabase } = await requireAdminContext();
  return adminSupabase;
}
