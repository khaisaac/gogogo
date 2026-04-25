"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function verifyAdminRole(userId: string) {
  const adminSupabase = createAdminClient();

  const { data: profile, error } = await adminSupabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }

  return profile;
}
